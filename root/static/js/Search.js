var SearchParameters = Backbone.Model.extend(
  {
    filters: [],

    initialize: function() {
      this.setupPreFilters();
    },

	update: function() {
		for (var i=0; i<this.filters.length; i++) {
			this.filters[i].update();
		}
	},

	getGeographicFilter: function() {
		return this.filters[0];
	},	
	
	getGranuleFilter: function() {
		return this.filters[3];
	},
	
    setupPreFilters: function() {
      this.filters = [
        new GeographicFilter(),
        new DateFilter(),
        new PlatformFilter(),
        new GranuleFilter()
      ];

      this.setDefaults();

      // bind change events in filters to update this object's attributes
      for( var i in this.filters ) {
        this.filters[i].bind( "change", jQuery.proxy( function(filter) {
          this.trigger("change:filter", filter);
        }, this));
      }
      this.bind("change:filter", function(filter) {
		this.setAttr(filter.toJSON());
      });

    },

    setDefaults: function() {
      // initialize default values from the widgets
      for( var i in this.filters ) {
        this.filters[i].reset();
		this.setAttr(this.filters[i].toJSON());
	
      }
   
 	},

	setAttr: function(json) {
		var set=true;
		for (i in json) {
			if (i=="bbox") {
				if (json[i] == null || json[i] == "") {
					set=false;
          this.unset('bbox');
				}
			}
		}
		
		if (set) {
			this.set( json );
		}
	},

    defaults: {
        format:"json"
    },

	stripEmptyJSON: function(json) {
		for (i in json) {
			if (json[i] == null || json[i] == "") {
				delete json;
			}
		}
	}
  }
);

var SearchParametersView = Backbone.View.extend(
{
  widgets: [],

  initialize: function() {

    this.setWidgets();
    _.bindAll(this, 'render');
  },

  setWidgets: function() {
    this.widgets = [];
    for ( var i in this.model.filters ) {
      this.widgets.push(this.model.filters[i].getWidget());
    }
  },

  render: function() {
    $(this.el).accordion('destroy');
    $(this.el).empty();

    for ( var i in this.widgets ) {
      $(this.el).append( '<h3><a href="#'+this.widgets[i].model.name+'">'+this.widgets[i].title+'</a></h3>' );
      $(this.el).append( this.widgets[i].render().el );
    }
    $(this.el).accordion({
      autoHeight: false,
      navigation: true
    });

    return this;
  } 

});

var BaseWidget = Backbone.View.extend(
{
  initialize: function() {

  },
  tagName: "div",
  hide: function() {
    $(this.el).hide();
  },
  show: function() {
    $(this.el).show();
  },
}
);

var BaseFilter = Backbone.Model.extend(
{
  initialize: function() {
  },
  reset: function() {
    this.set( this.defaults, { silent: true } );
    this.trigger('reset');
  },
  update: function() {
	
  }
}
);

var GeographicFilter = BaseFilter.extend(
{
  initialize: function() {
  },

  name: "GeographicFilter",

  markers: new Array(),

  defaults: {
    bbox: "",
  },
  getWidget: function() {
		return new GeographicWidget({model:this});
  },

  reset: function() {
    for(var ii = 0; ii < this.markers.length; ii++) {
      this.markers[ii].setMap(null);
      delete this.markers[ii];
    }
    this.markers = new Array();
    this.set({ "bbox": ""});
    if(window.searchMap) {
      window.searchMap.panTo(new google.maps.LatLng(40,-100));
      window.searchMap.setZoom(2);
    }
  },

  validate: function(attrs) {
    var error = '';
    if(attrs.bbox == '') {
      return;
    }
    var bbox = attrs.bbox.split(/\s*,\s*/);
    // Make sure we have the correct number of points
    if(bbox.length != 4) {
       error = 'Invalid number of points.';
    }
    for(var ii = 0; ii < bbox.length; ii++) {
      // Make sure the coordinate provided is a number.
      if(isNaN(parseFloat(bbox[ii])) || !isFinite(bbox[ii])) {
        error = 'Bounding box contains a non-numeric value.';
      }
      // Make sure the coordinate provided is within the bounds of our
      // coordiante system.
      if(ii % 2) {
        // This coordiante  should be in the range -90 to 90
        if(bbox[ii] < -90 || bbox[ii] > 90) {
          error = 'Bounding box coordiante out of range.';
        }
      } else {
        // This coordiante should be in the range -90 to 90
        if(bbox[ii] < -180 || bbox[ii] > 180) {
          error = 'Bounding box coordiante out of range.';
        }
      }
    }
    if(error != '') {
      return(error);
    }
  }

}
);

var GeographicWidget = BaseWidget.extend(
{
  title: "Geographic Region",
  titleId: "geographic_widget_title",
  id: "geographic_widget",
  clickListener: null,
  
  initialize: function() {

    _.bindAll(this, 'changed');
  },

  events : {
    "change input" : "changed"
  },
  
  changed: function(evt) {
    this.model.reset();
    this.model.set( { "bbox": $('#filter_bbox').val() }, {
      error: function(model, error) {
        model.trigger('change', model);
        $('#searchMessageError').empty();
        $('#searchMessageError').append(error);
      }
    });
    var bbox = this.model.get('bbox');
    bbox = bbox.split(/\s*,\s*/);
    // Do not continue if the bbox is empty (failed to validate.)
    if(bbox.length < 4) {
      this.render();
      this.model.trigger('update');
      return;
    }
    bbox.reverse();
    
    while(bbox.length) {
      var lng = bbox.pop();
      var lat = bbox.pop();

      var point = new google.maps.LatLng(lat,lng);
      
      var marker = new google.maps.Marker({
        position: point,
        map: searchMap,
        draggable: true
      });
      google.maps.event.addListener(marker, 'drag', jQuery.proxy(function() {
        this.updateSearchAreaOverlay();
      }, this));
      google.maps.event.addListener(marker, 'dragend', jQuery.proxy(function() {
        this.updateWidgetFromOverlay();
      }, this));
      this.model.markers.push(marker);
    }
    if(this.model.markers.length == 2) {
      this.updateSearchAreaOverlay();
      this.updateWidgetFromOverlay();
      searchMap.fitBounds(this.searchAreaOverlay.getBounds());
    }

    this.render();
    this.model.trigger('update');
  },
  render: function() {
    var pBbox = $('#filter_bbox').val();
    $(this.el).html(
      _.template('\
<p>Enter the bounding box as a comma-separated list of points in the order West,North,East,South<br />(or use the map)<br />Example: -135,66,-133,64</p>\
<label for="filter_bbox">Bounding box:</label>\
<input type="text" id="filter_bbox" name="bbox" value="<%= bbox %>">\
', {bbox: pBbox}));
				
    this.renderMap();
    return this;
  },

  renderMap: function() {

    initMap();

    google.maps.event.clearListeners(searchMap, 'click');
    if(this.clickListener == null) {
      this.clickListener = google.maps.event.addListener(searchMap, 'click', jQuery.proxy(function(event) {
        if(this.model.markers.length >= 2) { return; }
        var marker = new google.maps.Marker({
          position: event.latLng,
          map: searchMap,
          draggable: true
        });
        google.maps.event.addListener(marker, 'drag', jQuery.proxy(function() {
          this.updateSearchAreaOverlay();
        }, this));
        google.maps.event.addListener(marker, 'dragend', jQuery.proxy(function() {
          this.updateWidgetFromOverlay();
        }, this));
        this.model.markers.push(marker);
        if(this.model.markers.length == 2) {
          this.updateSearchAreaOverlay();
          this.updateWidgetFromOverlay();
        }
      }, this));
    }

    this.searchAreaOverlay.setMap(searchMap);
    if(this.model.markers.length == 2) {
      this.searchAreaOverlay.setBounds(new google.maps.LatLngBounds(
        this.model.markers[0].getPosition(), this.model.markers[1].getPosition()
      ));
      //searchMap.fitBounds(this.searchAreaOverlay.getBounds());
    } else {
      this.searchAreaOverlay.setBounds(null);
    }

    return this;
  },

  searchAreaOverlay : new google.maps.Rectangle( {
    strokeColor: '#0000FF',
    strokeOpacity: 0.5,
    strokeWeight: 2,
    fillColor: '#0066CC',
    fillOpacity: 0.5,
    clickable: false,
    zIndex: 10000 //always be above the granule overlays, which start at 1000
  }), 

  updateSearchAreaOverlay: function() {
    if(this.model.markers.length == 2) {
      var sw = this.model.markers[0].getPosition();
      var ne = this.model.markers[1].getPosition();
      var w = Math.min(sw.lng(), ne.lng()).toFixed(2);
      var s = Math.min(sw.lat(), ne.lat()).toFixed(2);
      var e = Math.max(sw.lng(), ne.lng()).toFixed(2);
      var n = Math.max(sw.lat(), ne.lat()).toFixed(2);
      var x;
      var y;
      if(e - w > 180.0) {  // swap if it spans the antemeridian so we always use the shortest path
        var t = w; w = e; e = t;
        t = n; n = s; s = t;
      }

      if(n > s) { 
        x = n - s;
      } else {
        x = s - n;
      }
      
      if(w > e) {
        y = w - e;
      } else {
        y = e - w;
      }

      if (x < 0) {
        x = x * -1;
      }
      if (y < 0) {
       y = y * -1;
      }
      
      if( x * y > 100) { 
        this.searchAreaOverlay.setOptions({ fillColor: '#CD2626' });
        $('#searchMessage').text('Warning: The search area you have entered is very large and may take a while to return.');
      } else {
        this.searchAreaOverlay.setOptions({ fillColor: '#0066CC' });
        $('#searchMessage').empty();
      }

      var latLngBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(s, w),
        new google.maps.LatLng(n, e));
      this.searchAreaOverlay.setBounds(latLngBounds);
      
      var target = $('#filter_bbox');
      target.val([w, s, e, n].join(','));
    }
  },

  updateWidgetFromOverlay: function() {
    var bounds = this.searchAreaOverlay.getBounds();
    if(bounds) {
      var sw = bounds.getSouthWest();
      var ne = bounds.getNorthEast();
      var w = Math.min(sw.lng(), ne.lng()).toFixed(2);
      var s = Math.min(sw.lat(), ne.lat()).toFixed(2);
      var e = Math.max(sw.lng(), ne.lng()).toFixed(2);
      var n = Math.max(sw.lat(), ne.lat()).toFixed(2);
      if(e - w > 180.0) {  // swap if it spans the antemeridian so we always use the shortest path
        var t = w; w = e; e = t;
        t = n; n = s; s = t;
      }
      var target = $('#filter_bbox');
      target.val([w, s, e, n].join(','));
      var data = {};
      data[target.attr('name')] = target.attr('value');
      this.model.set(data);
      this.model.trigger('update');
    }
  },

  clear: function() {
    this.model.reset();
    $('#filter_bbox').val('');
    this.searchAreaOverlay.setBounds(null);
  }

}
);

var DateFilter = BaseFilter.extend(
{ 
	
  name: "DateFilter",

	format_date: function(this_date) {
		var year, month, day;
	    year = String(this_date.getFullYear());
	    month = String(this_date.getMonth() + 1);
	    if (month.length == 1) {
	        month = "0" + month;
	    }
	    day = String(this_date.getDate());
	    if (day.length == 1) {
	        day = "0" + day;
	    }
	    var date_str =  year + "-" + month + "-" + day;
		return date_str;
	},
	
	get_date_N_years_ago: function(N) {
		var num_days = 365*N;
		var begin_date = new Date();
		begin_date.setDate(begin_date.getDate() - num_days);
		return begin_date;
	},

  reset: function() {
    var today = new Date();
    this.set({"start":this.format_date(this.get_date_N_years_ago(2))});
    this.set({"end":this.format_date(today)});
  },
	
	initialize: function() {

    this.reset();
	},

  getWidget: function() { 
    return new DateWidget({model:this});
  }
});

var DateWidget = BaseWidget.extend(
{
  title: "Date",
  titleId: "date_widget_title",
  tagName: "div",
  id: "date_widget",
  initialize: function() {
    _.bindAll(this, "render");
  },
  events : {
    "change input" : "changed",
    "change select" : "changed"
  },
  changed: function(evt) {
      var target = $(evt.currentTarget),
      data = {};

      if(target.attr('name') == 'repeat_yearly' && !target.attr('checked')) {
        this.model.set({'repeat_start': ''});
        this.model.set({'repeat_end': ''});
        this.model.set({'season_start': ''});
        this.model.set({'season_end': ''});
        $('#filter_start').trigger('change');
        $('#filter_end').trigger('change');
      } else if(target.attr('name')=='repeat_yearly' && target.attr('checked')){
        this.model.set({'start': ''});
        this.model.set({'end': ''});
        $('#repeat_start').trigger('change');
        $('#repeat_end').trigger('change');
        $('#season_start').trigger('change');
        $('#season_end').trigger('change');
      }
      
      if(target.attr('id') == 'season_start') {
        var emon = $('#season_end option:selected').val();
        var months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
        $('#season_end').empty();
        var smon = parseInt($('#season_start option:selected').val()) - 1;
        for(var ii = 0; ii < 12; ++ii) {
          $('#season_end').append($("<option></option>").
            attr("value", (smon + ii) % 12 + 1).
            text(months[((smon + ii) % 12)])
          );
        }
        $('#season_end option[value="'+emon+'"]').attr('selected', true);
      }

      if(target.attr('name') != null) {
        data[target.attr('name')] = target.attr('value');
        this.model.set(data);
      } else if(target.attr('id') != null) {
        data[target.attr('id')] = target.attr('value');
        this.model.set(data);
      }
  },
  render: function() {
    today = new Date();
    $(this.el).html(
      _.template('\
      <input type="checkbox" id="filter_repeat" name="repeat_yearly">&nbsp;Seasonal Search<br />\
      <div id="non-seasonal_search">\
      <label id="label_filter_start" for="filter_start">Start date (YYYY-MM-DD)</label><input type="text" id="filter_start" name="start" value="<%= start %>">\
      <label id="label_filter_end" for="filter_end">End date (YYYY-MM-DD)</label><input type="text" id="filter_end" name="end" value="<%= end %>"><br /><br />\
      </div>\
      <table id="seasonal_search" style="width: 100%"><tr><td>\
      <select id="season_start" style="width: 100%"><option value="1">Jan<option value="2">Feb<option value="3">Mar<option value="4">Apr<option value="5">May<option value="6">Jun<option value="7">Jul<option value="8">Aug<option value="9">Sep<option value="10">Oct<option value="11">Nov<option value="12">Dec</select></td><td style="width: 20%"><center>to</center></td><td>\
      <select id="season_end" style="width: 100%"></select></td></tr><tr><td>\
      <select id="repeat_start" style="width: 100%">\
      </select></td><td style="width: 20%"><center>to</center></td><td>\
      <select id="repeat_end" style="width: 100%">\
      </select></td></tr></table>\
      ', this.model.toJSON())
    );
    $(this.el).find('#filter_start').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1990, 1 - 1, 1),
        yearRange: '1990:'+today.getFullYear()
    });
    $(this.el).find('#filter_end').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1990, 1 - 1, 1),
        yearRange: '1990:'+today.getFullYear()
    });
    $(this.el).find('#filter_repeat').bind('change', this.toggleRepeat);
    $(this.el).find('#seasonal_search').hide();
    for(var year = 1990; year <= today.getFullYear(); year++) {
      $(this.el).find('#repeat_start').append($("<option></option>").
        attr("value",year).
        text(year)
      );
      $(this.el).find('#repeat_end').append($("<option></option>").
        attr("value",year).
        text(year)
      );
    }

    $(this.el).find('#repeat_start option:first').attr('selected', true);
    $(this.el).find('#repeat_end option:last').attr('selected', true);
    
    var months = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    $(this.el).find('#season_end').empty();
    var smon = parseInt($('#season_start option:selected').val()) - 1;
    for(var ii = 0; ii < 12; ++ii) {
      $('#season_end').append($("<option></option>").
        attr("value", (smon + ii) % 12 + 1).
        text(months[((smon + ii) % 12)])
      );
    }
    
    return this;
  },
  toggleRepeat: function() {
    if($('#filter_repeat').attr('checked')) {
      $('#non-seasonal_search').hide();
      $('#seasonal_search').show();
    } else {
      $('#non-seasonal_search').show();
      $('#seasonal_search').hide();
    }	
  }
});

var PlatformFilter = BaseFilter.extend(
  {
    inifialize: function() {

    },
    name: "PlatformFilter",
    defaults: {
      platform: AsfPlatformConfig.platform
    },
    getWidget: function() {
      return new PlatformWidget({model:this});
    },
  }
);

var PlatformWidget = BaseWidget.extend(
  {
    title: "Platforms",
    titleId: "platform_widget_title",
    id: "filter_platform",
    platformTypes: AsfPlatformConfig.platformTypes,
    initialize: function() {
      _.bindAll(this, 'render', 'renderPlatformInfo')

    },

    events : {
      "change input" : "changed",
    },

    changed: function(evt) {
      var a = $(this.el).find('input:checkbox:checked').serializeArray();
      this.model.clear({silent:true});
      this.model.set( { platform: _.pluck(a,"value") } );
    },

    render: function() {
      $(this.el).empty();
      var checked = this.model.toJSON()["platform"];
      for( var key in this.platformTypes ) {
        rowData = {
          name: this.platformTypes[key],
          id: "pf_"+key,
          value: key,
          ifChecked: ( _.indexOf(checked, key) > -1 ) ? 'checked="checked"' : ''
        };
        var i = $('<li>');
        $(i).html( _.template('\
<div class="composite_checkbox_wrapper">\
<input type="checkbox" id="<%= id %>" <%= ifChecked %> name="platform" value="<%= value %>" /><label style="text-align: left; width: 160px;" for="<%= id %>"><%= name %></label>\
<button style="display:inline-block;" platform="<%= value %>">?</button>\
</div>\
', rowData));
        $(i).find('.composite_checkbox_wrapper').buttonset();
        $(i).find('input').button().click( function() {
          if( true == $(this).prop('checked') ) {
            $(this).button( "option", "icons", { primary: "ui-icon-check" });
          } else {
            $(this).button( "option", "icons", {} );
          }
        });
       
        $(i).find('input:checkbox:checked').button( "option", "icons", { primary: "ui-icon-check" }).prop('checked', true);
        $(i).find('button').button( { icons: { primary: "ui-icon-info"}, text: false}).click( this.renderPlatformInfo );
        $(this.el).append(i);
      }
      return this;
    },
    renderPlatformInfo: function(e) {
      if(typeof ntptEventTag == 'function') {
        ntptEventTag('ev=viewPlatform');
      }
      var platform = $(e.currentTarget).attr('platform');
      $('#platform_profile').html(
        _.template( '\
<div class="platformInformation">\
<h3><%= name %> Highlights</h3>\
<img src="<%= imageUrl %>" />\
<ul>\
<li>Launch Date: <strong><%= launchDate %></strong></li>\
<li>Altitude: <strong><%= altitude %></strong></li>\
<li>Cycle: <strong><%= cycle %></strong></li>\
<li>Status : <strong><%= status %></strong></li>\
<li>Website : <a href="<%= website %>"><%= website %></a></li>\
</ul>\
<h3>Detailed Summary</h3>\
<p><%= description %></p>\
<h3><%= name %> Data</h3>\
<p><%= dataDescription %></p>\
<ul>\
  <li><%= processingType1 %></li>\
  <li><%= processingType2 %></li>\
  <li><%= processingType3 %></li>\
</ul>\
<p><%= processingFooter %></p>\
', AsfPlatformConfig.platformInformation[platform])).dialog(
        {
          title: AsfPlatformConfig.platformTypes[platform],
          width: 800,
          modal: true,
          draggable: false,
          resizable: false
        }
      );
    }
  }
);

var GranuleFilter = BaseFilter.extend(
{ 
	
  name: "GranuleFilter",
  reset: function() {
    this.set({"granule_list":""});
  },
  initialize: function() {
    this.reset();
  },
  getWidget: function() { 
    return new GranuleWidget({model:this});
  },
  update: function() {
	this.parseGranules($('#filter_granule_list').val());
  },
	parseGranules: function(text) {
		var granules=[];
		var granules = text.split(/\n+|,|\s+|\t+/);
    var granuleString = granules.join(',');
		this.set({"granule_list": granuleString});
	}
});

var GranuleWidget = BaseWidget.extend(
{
  title: "Granule List",
  titleId: "granule_widget_title",
  tagName: "div",
  id: "granule_widget",

  initialize: function() {
    _.bindAll(this, "changed");
  },

  events : {
    "change input" : "changed"
  },

  changed: function(evt) {
	},


  render: function() {
		var v = $(this.el).html(
	      _.template('\
	        <p>Enter a list of granule names. Note: this option will supercede other search parameters.</p>\
	        <label for="filter_granule_list">Granule list:</label>\
	        <textarea cols=35 rows=10 style="resize: none;" id="filter_granule_list" name="filter_granule_list"><%= granule_list %></textarea>', this.model.toJSON())
	    ).find('textarea').bind('input',jQuery.proxy(function() {	
				this.model.trigger('update');	
		
		},this));

	return this;
  }
});

var SearchButtonState = Backbone.Model.extend({
	defaults: {
		state: 'searchButtonState', // Possible States: 'searchButton', 'stopButton'
	}
});

var SearchButtonView = Backbone.View.extend({
  xhr: null,
  initialize: function() {
		_.bindAll(this);
		
   	 	this.el2 = this.options.el2;
		this.geographicFilter = this.options.geographicFilter;
		this.granuleFilter = this.options.granuleFilter;
		
	  this.model.bind('change', this.render, this);
	
		this.geographicFilter.bind('update', this.toggleButton);
		this.granuleFilter.bind('update', this.toggleButton);
		
	    $(this.el).button({
	      icons: {
	        primary: "ui-icon-search"
	      },
	        label: "Search"
	    }).bind("click", jQuery.proxy( function(e) {
        if(typeof ntptEventTag == 'function') {
		      ntptEventTag('ev=startSearch');
        }
        // Reset certain state aspects when triggering a new search
        SearchApp.searchResults.searchParameters.update();
	      SearchApp.searchResultsView.showSearching();
        SearchApp.postFilters.reset(); // flush any filters the user had set up previously
        $("#con").html('');
        $("#con").html('<table id="searchResults" style="margin:20px 0px 20px 0px;"></table>'); 
	      
       this.xhr = SearchApp.searchResults.fetchSearchResults
                        (AsfDataportalConfig.apiUrl, SearchApp.searchResults.searchParameters.toJSON());  

        this.model.set({'state': 'stopButtonState'});
       
	    }, this)).focus();

	    this.bind('abortSearch', function() {
        if(typeof ntptEventTag == 'function') {
         ntptEventTag('ev=stopSearch'); 
        }
	      this.xhr.abort();
	    });

	    $(this.el2).button({
	      icons: {
	        primary: "ui-icon-refresh"},
	        label: "Stop Search"
	    }).bind("click", jQuery.proxy( function(e) {
	      this.trigger('abortSearch');
	      this.model.set({'state': 'searchButtonState'});
	      SearchApp.searchResultsView.showBeforeSearchMessage();
        $("#con").html('');
        $("#con").html('<table id="searchResults" style="margin:20px 0px 20px 0px;"></table>');
	    }, this));

	    $(this.el2).hide();
  },

	toggleButton: function() {
    var buttonDisabled = true;
    if(window.SearchApp && !((
      window.SearchApp.searchParameters.has('bbox') &&
        $('#filter_granule_list').val())
      || (!window.SearchApp.searchParameters.has('bbox') &&
        $('#filter_granule_list').val() == "")))
    {
      $('#searchMessageError').empty();
      buttonDisabled = false;
    } else {
      buttonDisabled = true;
    }

    $("#triggerSearch").empty();
    $('#triggerSearch').button(
      {
        icons: {
          primary: "ui-icon-search"
        },
        labal: "Search",
        disabled: buttonDisabled
      }
    );
			
		if ( ($('#filter_bbox').val() != "" && $('#filter_granule_list').val() != "")) {
      $('#triggerSearch').button('disable');
      $('#searchMessageError').empty();
			$('#searchMessageError').append('<p>The Geographic Filter cannot be used in conjunction with the Granule Filter.</p>');
			$('#searchMessageError').append('<p>Please choose only one of these filters at a time.</p>');
		}
	},

  render: function() {
    if (this.model.get('state') == 'searchButtonState') {
      $(this.el).show();
      $(this.el2).hide();
    } 
    if (this.model.get('state') == 'stopButtonState')  {
      $(this.el2).show();
      $(this.el).hide();
    }
  },
});

var SearchParameters = Backbone.Model.extend(
  {
    filters: [],

    initialize: function() {
      this.setupPreFilters();
    },

	getGeographicFilter: function() {
		return this.filters[0];
	},	
	
    setupPreFilters: function() {
      this.filters = [
        new GeographicFilter(),
        new DateFilter(),
        new PlatformFilter()
      ];

      this.setDefaults();

      // bind change events in filters to update this object's attributes
      for( var i in this.filters ) {
        this.filters[i].bind( "change", jQuery.proxy( function(filter) {
          this.trigger("change:filter", filter);
        }, this));
      }
      this.bind("change:filter", function(filter) {
        this.set( filter.toJSON() );
      });

    },

    setDefaults: function() {
      // initialize default values from the widgets
      for( var i in this.filters ) {
        this.filters[i].reset();
        this.set( this.filters[i].toJSON() );
      }
    },

    defaults: {
        format:"jsonp"
    },
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
  tagName: "div",
  hide: function() {
    $(this.el).hide();
  },
  show: function() {
    $(this.el).show();
  }
}
);

var BaseFilter = Backbone.Model.extend(
{
  reset: function() {
    this.set( this.defaults );
    this.trigger('reset');
  }
}
);



// TODO: put in csv-to-coord array utility functions
var GeographicFilter = BaseFilter.extend(
{
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
  },

  validate: function(attrs) {
			if (attrs.bbox != "") {
				$("#triggerSearch").empty();
				$("#triggerSearch").button(
			      {
			        icons: {
			          primary: "ui-icon-search"
			        },
			        label: "Search",
					disabled: false
			    }).focus();
			} else {
					$("#triggerSearch").attr('disabled', true);
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
    this.model.set( { "bbox": $(this.el).find('input').val() });
    var bbox = $(this.el).find('input').val().split(/\s*,\s*/);
    bbox.reverse();
    var selfref = this;
    
    while(bbox.length) {
      var lng = bbox.pop();
      var lat = bbox.pop();

      var point = new google.maps.LatLng(lat,lng);
      
      var marker = new google.maps.Marker({
        position: point,
        map: searchMap,
        draggable: true
      });
      google.maps.event.addListener(marker, 'drag', function() {
        selfref.updateSearchAreaOverlay();
      });
      google.maps.event.addListener(marker, 'dragend', function() {
        selfref.updateWidgetFromOverlay();
      });
      selfref.model.markers.push(marker);
    }
    if(selfref.model.markers.length == 2) {
      selfref.updateSearchAreaOverlay();
      selfref.updateWidgetFromOverlay();
      searchMap.fitBounds(this.searchAreaOverlay.getBounds());
    }

    this.render();
  
  },
  render: function() {
    $(this.el).html(
      _.template('\
<p>Enter the bounding box as a comma-separated list of points in the order West,North,East,South<br />(or use the map)<br />Example: -135,66,-133,64</p>\
<label for="filter_bbox">Bounding box:</label>\
<input type="text" id="filter_bbox" name="bbox" value="<%= bbox %>">\
', this.model.toJSON())
    );
    this.renderMap();

    return this;
  },

  renderMap: function() {

    initMap();

    google.maps.event.clearListeners(searchMap, 'click');
    var selfref = this; //needed for the events below, as 'this' does not obtain closure
    if(this.clickListener == null) {
      this.clickListener = google.maps.event.addListener(searchMap, 'click', function(event) {
        if(selfref.model.markers.length >= 2) { return; }
        var marker = new google.maps.Marker({
          position: event.latLng,
          map: searchMap,
          draggable: true
        });
        google.maps.event.addListener(marker, 'drag', function() {
          selfref.updateSearchAreaOverlay();
        });
        google.maps.event.addListener(marker, 'dragend', function() {
          selfref.updateWidgetFromOverlay();
        });
        selfref.model.markers.push(marker);
        if(selfref.model.markers.length == 2) {
          selfref.updateSearchAreaOverlay();
          selfref.updateWidgetFromOverlay();
        }
      });
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
    zIndex: 500 //always be below the granule overlays, which start at 1000
  }), 

  updateSearchAreaOverlay: function() {
    if(this.model.markers.length == 2) {
      var sw = this.model.markers[0].getPosition();
      var ne = this.model.markers[1].getPosition();
      var w = Math.min(sw.lng(), ne.lng()).toFixed(2);
      var s = Math.min(sw.lat(), ne.lat()).toFixed(2);
      var e = Math.max(sw.lng(), ne.lng()).toFixed(2);
      var n = Math.max(sw.lat(), ne.lat()).toFixed(2);
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
      var target = $('#filter_bbox');
      target.val([
        Math.min(sw.lng(), ne.lng()).toFixed(2),
        Math.min(sw.lat(), ne.lat()).toFixed(2),
        Math.max(sw.lng(), ne.lng()).toFixed(2),
        Math.max(sw.lat(), ne.lat()).toFixed(2)
      ].join(','));
      var data = {};
      data[target.attr('name')] = target.attr('value');
      this.model.set(data);
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
    this.set({"start":this.format_date(this.get_date_N_years_ago(1))});
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
    "change input" : "changed"
  },
  changed: function(evt) {
      var target = $(evt.currentTarget),
      data = {};
      data[target.attr('name')] = target.attr('value');
      this.model.set(data);
  },
  render: function() {
    today = new Date();
    $(this.el).html(
      _.template('<label for="filter_start">Start date (YYYY-MM-DD)</label><input type="text" id="filter_start" name="start" value="<%= start %>">\
      <label for="filter_end">End date (YYYY-MM-DD)</label><input type="text" id="filter_end" name="end" value="<%= end %>">\
      ', this.model.toJSON())
    );
    $(this.el).find('#filter_start').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1990, 1 - 1, 1),
        yearRange: '1990:'+today.getFullYear()
    });
    start_date = $(this.el).find('#filter_start').datepicker().val();
    $(this.el).find('#filter_start').datepicker("setDate", start_date);

    $(this.el).find('#filter_end').datepicker({
        dateFormat: 'yy-mm-dd',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(1990, 1 - 1, 1),
        yearRange: '1990:'+today.getFullYear()
    });
    end_date = $(this.el).find('#filter_end').datepicker().val();
    $(this.el).find('#filter_end').datepicker("setDate", end_date);

    return this;
  }
});

var PlatformFilter = BaseFilter.extend(
  {
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
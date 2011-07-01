//todo: this feels very much like a backbone collection, now, except
// that it is aggregating information in a slightly different way.
// perhaps this can be done more cleanly with a collection.
var SearchParameters = Backbone.Model.extend(
  {
    filters: [],

    initialize: function() {
      this.setupPreFilters();
      this.setupPostFilters();
    },
    setupPreFilters: function() {
      this.filters = [
        new GeographicFilter(),
        new DateFilter(),
        new PlatformFilter()
      ];

      // initialize default values from the widgets
      for( var i in this.filters ) {
        this.set( this.filters[i].toJSON() );
      }

      // bind change events in filters to update this object's attributes
      self = this;
      for( var i in this.filters ) {
        this.filters[i].bind( "change", function(filter) {
          self.trigger("change:filter", filter);
        });
      }
      this.bind("change:filter", function(filter) {
        this.set( filter.toJSON() );
      });

    },

    setupPostFilters: function() {
      this.postFilters = [
        new RadarsatFacet(),
        new AlosFacet(),
      ];

      self = this;
      for( var i in this.postFilters ) {
        this.postFilters[i].bind( "change", function(filter) {
          self.trigger("change:postfilter", filter);
        });
      }

      this.bind("change:postfilter", function(filter) {
        this.set( filter.toJSON() );
      });

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

var PostFiltersView = Backbone.View.extend(
{
  widgets: [],
  initialize: function() {
    _.bindAll(this, 'render');
  },
  setWidgets: function() {
    this.widgets = [];
    for ( var i in this.model.postFilters ) {
      this.widgets.push(this.model.postFilters[i].getWidget());
    }
  },
  render: function(platforms) {

    this.setWidgets();
    $(this.el).empty();
    // build this dynamically in future, but not yet
    for ( var i in this.widgets ) {
      if( -1 != _.indexOf( platforms, this.widgets[i].name )) {
        $(this.el).append( this.widgets[i].render().el );
      } 
    }
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

var PathFrameFilter = Backbone.Model.extend({
  name: "PathFrameFilter",
  defaults: {
    path:" ",
    frame:" "
  },
  getWidget: function(){
    return new PathFrameWidget({model:this});
  }
}
);

var PathFrameWidget = BaseWidget.extend({
  title: "Path/Frame",
  titleId: "path_frame_widget_title",
  events: {
    "change input" : "changed"
  },
  changed: function(evt){
    var target = $(evt.currentTarget),
    data = {};
    data[target.attr('name')] = target.attr('value');
    this.model.set(data);
  },
  render: function(){
    $(this.el).html(
      _.template('<div>\
      <label for="filter_path">Path</label><input type="text" size="10" id="filter_path" name="path" value="<%= path %>">\
      <label for="filter_frame">Frame</label><input type="text" size="10" id="filter_frame" name="frame" value="<%= frame %>">\
      </div>', this.model.toJSON())
    );
    return this;
  }

});

// TODO: put in csv-to-coord array utility functions
var GeographicFilter = Backbone.Model.extend(
{
  name: "GeographicFilter",
  defaults: {
    bbox:"-149.46,63.78,-145.96,65.56"
  },
  getWidget: function() {
    return new GeographicWidget({model:this});
  }
}
);

var GeographicWidget = BaseWidget.extend(
{
  title: "Geographic Region",
  titleId: "geographic_widget_title",
  id: "geographic_widget",
  events : {
    "change input" : "changed"
  },
  changed: function(evt) {
      var target = $(evt.currentTarget),
      data = {};
      data[target.attr('name')] = target.attr('value');
      var bbox = target.attr('value').split(/,/);
      this.searchAreaOverlay.setBounds(new google.maps.LatLngBounds(
        new google.maps.LatLng(Math.min(bbox[1], bbox[3]), Math.min(bbox[0], bbox[2])),
        new google.maps.LatLng(Math.max(bbox[1], bbox[3]), Math.max(bbox[0], bbox[2]))
      ));
      this.model.set(data);
  },
  render: function() {
    $(this.el).html(
      _.template('\
<p>Enter the bounding box as a comma-separated list of points in the order West,North,East,South.  Example: -135,64,-133,66</p>\
<label for="filter_bbox">Bounding box:</label>\
<input type="text" id="filter_bbox" name="bbox" value="<%= bbox %>">\
', this.model.toJSON())
    );
    initMap('searchMap'); //it's safe to call this willy-nilly just in case the map isn't up yet
    this.searchAreaOverlay.setMap(searchMap);
    this.searchAreaSWMarker.setMap(searchMap);
    this.searchAreaNEMarker.setMap(searchMap);
    var selfref = this; //needed for the events below, as 'this' does not obtain closure
    google.maps.event.addListener(this.searchAreaSWMarker, 'drag', function() {
      selfref.updateSearchAreaOverlay();
    });
    google.maps.event.addListener(this.searchAreaNEMarker, 'drag', function() {
      selfref.updateSearchAreaOverlay();
    });
    google.maps.event.addListener(this.searchAreaSWMarker, 'dragend', function() {
      selfref.updateWidgetFromOverlay();
    });
    google.maps.event.addListener(this.searchAreaNEMarker, 'dragend', function() {
      selfref.updateWidgetFromOverlay();
    });
    searchMap.fitBounds(this.searchAreaOverlay.getBounds());
    return this;
  },
  // todo: derive these from the true defaults
  searchAreaOverlay: new google.maps.Rectangle({
    bounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(63.78, -149.46),
      new google.maps.LatLng(65.56, -145.96)
    ),
    strokeColor: '#0000FF',
    strokeOpacity: 0.5,
    strokeWeight: 2,
    fillColor: '#0066CC',
    fillOpacity: 0.5,
    clickable: false,
    zIndex: 500 //always be below the granule overlays, which start at 1000
  }),
  // todo: derive these from the true defaults
  searchAreaSWMarker: new google.maps.Marker({
    position: new google.maps.LatLng(63.78, -149.46),
    draggable: true
  }),
  searchAreaNEMarker: new google.maps.Marker({
    position: new google.maps.LatLng(65.56, -145.96),
    draggable: true
  }),
  updateSearchAreaOverlay: function() {
    var sw = this.searchAreaSWMarker.getPosition();
    var ne = this.searchAreaNEMarker.getPosition();
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
  },
  updateWidgetFromOverlay: function() {
    var bounds = this.searchAreaOverlay.getBounds();
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
}
);

var DateFilter = Backbone.Model.extend(
{ name: "DateFilter",
  defaults: {
      start:"2009-12-01",
      end:"2009-12-15",
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

var PlatformFilter = Backbone.Model.extend(
  {
    name: "PlatformFilter",
    defaults: {
      platform: ["E1","E2","J1","A3","R1"]
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
    platformTypes: {
      // value : display name
      "R1" : "RADARSAT-1",
      "E1" : "ERS-1",
      "E2" : "ERS-2",
      "J1" : "JERS-1",
      "A3" : "ALOS"
    },

    events : {
      "change input" : "changed",
    },

    changed: function(evt) {

      //TODO: this is ugly -- there's gotta be a better way to 
      // construct the jquery selector there.
      var a = $(this.el).find('input:checkbox:checked').serializeArray();
      this.model.clear({silent:true});
      this.model.set( { platform: _.pluck(a,"value") } );

    },

    render: function() {
      var checked = this.model.toJSON()["platform"];
      for( var key in this.platformTypes ) {
        rowData = {
          name: this.platformTypes[key],
          id: "pf_"+this.platformTypes[key],
          value: key,
          ifChecked: ( _.indexOf(checked, key) > -1 ) ? 'checked="checked"' : ''
        };
        var i = $('<li>');
        $(i).html( _.template('\
<input type="checkbox" id="<%= id %>" <%= ifChecked %> name="platform" value="<%= value %>" /><label style="text-align: left;" for="<%= id %>"><%= name %></label>\
', rowData));
        $(i).find('input').button().click( function() {
          if( true == $(this).prop('checked') ) {
            $(this).button( "option", "icons", { primary: "ui-icon-check" });
          } else {
            $(this).button( "option", "icons", {} );
          }
        });
        $(i).find('input:checkbox:checked').button( "option", "icons", { primary: "ui-icon-check" }).prop('checked', true);
        $(this.el).append(i);
      }
      return this;
    }
  }
);


var ProcessingFilter = Backbone.Model.extend(
  {
    name: "ProcessingFilter",
    defaults: {
      processing: ["L0","L1","L1.5","L1.0","L1.1"]
    },
    getWidget: function() {
      return new ProcessingWidget({model:this});
    },
  }
  );

var ProcessingWidget = BaseWidget.extend(
  {
    title: "Processing Type",
    titleId: "processing_widget_title",
    tagName: "div",
    id: "filter_processing",
    processingTypes: {
      // value : display name
      "L0" : "L0",
      "L1" : "L1",
      "L1.0" : "L1.0",
      "L1.1" : "L1.1",
      "L1.5" : "L1.5"
    },

    events : {
      "change input" : "changed",
    },

    changed: function(evt) {

      //TODO: this is ugly -- there's gotta be a better way to 
      // construct the jquery selector there.
      var a = $("#"+this.id+" input").serializeArray();
      this.model.clear({silent:true});
      this.model.set( { processing: _.pluck(a,"value") } );

    },

    render: function() {
      var f = "";
      var checked = this.model.toJSON()["processing"];
      for( var key in this.processingTypes ) {
         rowData = {
          name: this.processingTypes[key],
          value: key,
          ifChecked: ( _.indexOf(checked, key) > -1 ) ? 'checked="checked"' : ''
         };
         f = f + _.template('<li><label for="filter_processing_<%= name %>"><input type="checkbox" id="filter_processing_<%= name %>" value="<%= value %>" name="<%= name %>" <%= ifChecked %>>&nbsp;<%= name %></label></li>', rowData);
      }
      $(this.el).html( '<ul>'+f+'</ul>' );
    
      return this;
    }
  }
);

var DirectionFilter = Backbone.Model.extend(
  {
    name: "DirectionFilter",
    defaults: { direction: "any" },
    getWidget: function() {
      return new DirectionWidget({model:this});
    },
  }
  );

var DirectionWidget = BaseWidget.extend(
  {
    title: "Direction",
    titleId: "direction_widget_title",
    tagName: "div",
    id: "filter_direction",
    directionTypes: {
      // value : display name
      "any":"Any",
      "ascending":"Ascending",
      "descending":"Descending"
    },

    events : {
      "change input" : "changed",
    },

    changed: function(evt) {
      this.model.set( { direction: evt.currentTarget.value } );
    },

    render: function() {
      var f = "";
      var checked = this.model.toJSON()["direction"];
      for( var key in this.directionTypes ) {
         rowData = {
          name: this.directionTypes[key],
          value: key,
          ifChecked: ( checked == key ) ? 'checked="checked"' : ''
         };
         f = f + _.template('<li><label for="filter_direction_<%= name %>"><input type="radio" id="filter_direction_<%= name %>" value="<%= value %>" name="filter_direction" <%= ifChecked %>>&nbsp;<%= name %></label></li>', rowData);
      }
      $(this.el).html( '<ul>'+f+'</ul>' );
    
      return this;
    }
  }
);

var PlatformFacet = Backbone.Model.extend( {} ); 
var PlatformFacetView = BaseWidget.extend( {

  // selected = this.model.toJSON
  // key = key name to use in selected.key
  // container = element into which all these items should be appended
  // source = data structure in format: [ { title:string, group:string, modes: [ { label:label, value:inputValue }, ... ] }, ... ]
  // id = string, ID fragment to prepend in dynamically-generated elements
  // param = string, name of http parameter
  renderButtonset: function( selected, key, el, source, id, name ) {

    for( var i in source ) {
      $(el).append( _.template('<h5><%= title %></h5>', source[i] ));
      newEl = jQuery('<div/>', {
        id: id+"_"+source[i].group,
        "class": "checkbox"
      });
      for( var j in source[i].modes ) {
        idVal = source[i].modes[j].value.replace('.','_');
        $(newEl).append( 
          _.template(
            '<input type="checkbox" name="<%= name %>[]" value="<%= value %>" <%= ifChecked %> id="<%= id %>_<%= group %>_<%= idValue %>" /><label for="<%= id %>_<%= group %>_<%= idValue %>"><%= label %></label>',
            {
              ifChecked: ( -1 !== _.indexOf( selected[key], source[i].modes[j].value)) ? 'checked="checked"' : '',
              group: source[i].group,
              value: source[i].modes[j].value,
              label: source[i].modes[j].label,
              id: id,
              idValue: idVal,
              name: name
            }
          )
        )
      }
      $(el).append( newEl );
    }
  }

} );

var AlosFacet = PlatformFacet.extend(
  {
    name: "ALOS",
    getWidget: function() {
      return new AlosFacetButton({model: this});
    }
  }
);

var AlosFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  id: "platform_facet",
  tagName: "form",
  events: { 
    "change input" : "changed",
  },
  initialize: function() {
    this.render();
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    this.model.set( { offnadir: _.pluck( $(this.el).serializeArray(), 'value' ) } );
 },
  beamModes: [
    {
      title: "FBS (Fine Beam Single Polarization)",
      group: "fbs",
      modes: [
        { label: "21.5&deg;", value: "21.5" },
        { label: "34.3&deg;", value: "34.3" },
        { label: "41.5&deg;", value: "41.5" },
        { label: "50.8&deg;", value: "50.8" }
      ]
    },
    {
      title: "FBD (Fine Beam Double Polarization)",
      group: "fbd",
      modes: [
        { label: "34.3&deg", value: "34.3" }
      ]
    },
    {
      title: "PLR (Polarimetric Mode)",
      group: "plr",
      modes: [
        { label: "21.5&deg;", value: "21.5" },
        { label: "23.1&deg;", value: "23.1" }
      ]
    },
    {
      title: "WB1 (ScanSAR Burst Mode 1)",
      group: "wb1",
      modes: [
        { label: "27.1&deg;", value: "27.1" }
      ]
    }
  ],
  render: function() {
    this.renderButtonset( this.model.toJSON(), 'offnadir', this.el, this.beamModes, 'a3', 'offnadir' );

    $(this.el).find('.checkbox').each(function(index) {
      $(this).buttonset();
    });
    
    $(this.el).dialog({
      width: 700,
      modal: true,
      draggable: false,
      resizable: false,
      title: "ALOS Beam Modes",
      position: "center"
    });

  }
  
});
 
var AlosFacetButton = PlatformFacetView.extend( {
  name: "ALOS",
  tagName: "button",
  initialize: function() {
    _.bindAll(this, "render", "openDialog");
  },
  events: {
    "click" : "openDialog"
  },
  openDialog: function(e) {
    var v = new AlosFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          secondary: "ui-icon-zoomin"
        },
        label: this.name
      }
    );
    return this;
  }
});

/*
specifying beam modes:
+ the api needs to understand eating an http array, not just csv
- the form should have all 'checked' as default BUT this corresponds to an _empty_ array of restrictions
- need a 'toggle all' button @ radarsat
- 'toggle all' button does a 'clear' on the model's list of selected things
+ when the form is changed, the model should change
+ when the model is changed, it should notify SearchParameters and update it
- strange case: user unselects all beam modes, what to do? IL#22
*/

var RadarsatFacet = PlatformFacet.extend(
  {
    defaults: {
      beam: []
    },
    name: "RADARSAT-1",
    getWidget: function() {
      return new RadarsatFacetButton({model: this});
    }
  }
);

var RadarsatFacetButton = PlatformFacetView.extend( {
  name: "RADARSAT-1",
  tagName: "button",
  initialize: function() {
    _.bindAll(this, "render", "openDialog");
  },
  events: {
    "click" : "openDialog"
  },
  openDialog: function(e) {
    var v = new RadarsatFacetDialog( { model: this.model } );
  },
  render: function() {
    $(this.el).button(
      {
        icons: {
          secondary: "ui-icon-zoomin"
        },
        label: "RADARSAT-1"
      }
    );

    return this;
 
  }
});
                                           
var RadarsatFacetDialog = PlatformFacetView.extend( {
  className: "platformFacet",
  id: "platform_facet",
  tagName: "form",
  events: {
   "change input" : "changed",
  },
  initialize: function() {
    this.render();
  },
  changed: function(e) {
    this.model.clear( { silent: true });
    this.model.set( { beam: _.pluck( $(this.el).serializeArray(), 'value' ) } );
    // hack: if the user has selected all the options, clear the model
    // so that it won't restrict by beam mode, which would
    // otherwise limit search results to only this platform (other
    // platforms would never match the beam in() clause
    if ( 23 == this.model.get('beam').length ) {
      this.model.clear( { silent: true } );
    }
  },
  beamModes: [
    { title: "Extended High Incidence Beam, Off-Nadir 52-58&deg;",
      group: "ehib",
      modes: [
        { label: "EH3 (51.8&deg;)", value: "EH3" },
        { label: "EH5 (54.5&deg;)", value: "EH5" },
        { label: "EH6 (57.3&deg;)", value: "EH6" }
      ]
    },
    { title: "Extended Low Incidence Beam, Off-Nadir 10&deg;",
      group: "elib",
      modes: [
        { label: "EL1 (10&deg;)", value: "EL1" }
      ]
    },
    { title: "Fine Beam, Off-Nadir 37-47&deg;",
      group: "fb",
      modes: [
        { label: "FN1 (36.9&deg;)", value: "FN1" },
        { label: "FN2 (39.4&deg;)", value: "FN2" },
        { label: "FN3 (41.6&deg;)", value: "FN3" },
        { label: "FN4 (43.6&deg;)", value: "FN4" },
        { label: "FN5 (45.4&deg;)", value: "FN5" }
      ]
    },
    { title: "ScanSAR Narrow Beam, Off-Nadir 20-49&deg;",
      group: "ssnb",
      modes: [
        { label: "SNA (20&deg;)", value: "SNA" },
        { label: "SNB (20&deg;)", value: "SNB" }
      ]
    },
    { title: "ScanSar Wide Beam, Off-Nadir 20-49&deg",
      group: "sswb",
      modes: [
        { label: "SWA (20&deg;)", value: "SWA" },
        { label: "SWB (20&deg;)", value: "SWB" }
      ]
    },
    { title: "Standard Beam, Off-Nadir 20-49&deg;",
      group: "sb",
      modes: [
        { label: "ST1 (19.6&deg;)", value: "ST1" },
        { label: "ST2 (24.2&deg;)", value: "ST2" },
        { label: "ST3 (30.5&deg;)", value: "ST3" },
        { label: "ST4 (33.6&deg;)", value: "ST4" },
        { label: "ST5 (36.5&deg;)", value: "ST5" },
        { label: "ST6 (41.5&deg;)", value: "ST6" },
        { label: "ST7 (44.9&deg;)", value: "ST7" }
      ]
    }
  ],
  render: function() {
    
    this.renderButtonset( this.model.toJSON(), 'beam', this.el, this.beamModes, 'r1', 'beam' );

    
    $(this.el).find('.checkbox').each(function(index) {
      $(this).buttonset();
    });

    $(this.el).dialog({
      width: 700,
      modal: true,
      draggable: false,
      resizable: false,
      title: "RADARSAT-1 Beam Modes",
      position: "center"
    });
  }
}
);

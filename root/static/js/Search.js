var SearchParameters = Backbone.Model.extend(
  {
    name: "SearchParameters",
    filters: [],
    initialize: function() {
      this.filters = [
        new GeographicFilter(),
        new ProcessingFilter(),
        new PlatformFilter(),
        new DateFilter(),
        new PathFrameFilter(),
        new OffNadirFilter()
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
      defaults: {
        format:"jsonp"
    },
  }
);

var SearchParametersView = Backbone.View.extend(
{
  widgets: [],

  // Bind to the existing filters element in the skeleton html.
  el: $("#filters"),

  initialize: function() {

    _.bindAll(this, "render");

    //todo: we depend on the SearchParameters model being defined first,
    // so we have access to its list of filters.  Check that condition &
    // fail if we don't.

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

var BaseWidget = Backbone.View.extend(
{
  tagName: "div"
}
);

var OffNadirFilter = Backbone.Model.extend(
{
  name: "OffNadirFilter",
  defaults: {
    offnadir: 0
  },
  getWidget: function() {
    return new OffNadirWidget({model:this});
  }
}
);

var OffNadirWidget = BaseWidget.extend(
{
  title: "Off Nadir",
  titleId: "offnadir_widget_title",
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
    $(this.el).html(
      _.template('<label for="filter_offnadir">Off nadir angle: <input type="text" id="filter_offnadir" name="offnadir" value="<%= offnadir %>"</label>', this.model.toJSON())
    );
    return this;
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
      <label for="filter_path">PATH: <input type="text" id="filter_path" name="path" value="<%= path %>"></label>\
      <label for="filter_frame">FRAME: <input type="text" id="filter_frame" name="frame" value="<%= frame %>"></label>\
      </div>', this.model.toJSON())
    );
    return this;
  }

});

var GeographicFilter = Backbone.Model.extend(
{
  name: "GeographicFilter",
  defaults: {
    bbox:"-135,64,-133,66"
  },
  getWidget: function() {
    return new GeographicWidget({model:this});
  }
}
);

var GeographicWidget = BaseWidget.extend(
{
  title: "Geographic region",
  titleId: "geographic_widget_title",
  events : {
    "change input" : "changed"
  },
  changed: function(evt) {
      var target = $(evt.currentTarget),
      data = {};
      data[target.attr('name')] = target.attr('value');
      var bbox = target.attr('value').split(/,/);
      this.mapOverlay.setBounds(new google.maps.LatLngBounds(
        new google.maps.LatLng(Math.min(bbox[1], bbox[3]), Math.min(bbox[0], bbox[2])),
        new google.maps.LatLng(Math.max(bbox[1], bbox[3]), Math.max(bbox[0], bbox[2]))
      ));
      this.model.set(data);
  },
  render: function() {
    $(this.el).html(
      _.template('<div><label for="filter_bbox">BBOX: <input type="text" id="filter_bbox" name="bbox" value="<%= bbox %>"</label></div>', this.model.toJSON())
    );
    initMap('searchMap'); //it's safe to call this willy-nilly just in case the map isn't up yet
    this.mapOverlay.setMap(searchMap);
    return this;
  },
  mapOverlay: new google.maps.Rectangle({
    bounds: new google.maps.LatLngBounds(
      new google.maps.LatLng(64, -135),
      new google.maps.LatLng(66, -133)
    ),
    strokeColor: '#0000FF',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: '#0066CC',
    fillOpacity: 0.5
  }),
}
);

var DateFilter = Backbone.Model.extend(
{ name: "DateFilter",
  defaults: {
      start:"2009-06-01",
      end:"2009-06-30",
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
      _.template('<label for="filter_start">Start date <input type="text" id="filter_start" name="start" value="<%= start %>"></label>\
      <label for="filter_end">End date <input type="text" id="filter_end" name="end" value="<%= end %>"></label>\
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
    name: "ProcessingFilter",
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
    tagName: "div",
    id: "filter_platform",
    platformTypes: {
      // value : display name
      "R1" : "Radarsat-1",
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
      var a = $("#"+this.id+" input").serializeArray();
      this.model.clear({silent:true});
      this.model.set( { platform: _.pluck(a,"value") } );

    },

    render: function() {
      var f = "";
      var checked = this.model.toJSON()["platform"];
      for( var key in this.platformTypes ) {
         rowData = {
          name: this.platformTypes[key],
          value: key,
          ifChecked: ( _.indexOf(checked, key) > -1 ) ? 'checked="checked"' : ''
         };
         f = f + _.template('<li><label for="filter_platform_<%= name %>"><input type="checkbox" id="filter_platform_<%= name %>" value="<%= value %>" name="<%= name %>" <%= ifChecked %>/>&nbsp;<%= name %></label></li>', rowData);
      }
      $(this.el).html( '<ul>'+f+'</ul>' );
      return this;
    }
  }
);


var ProcessingFilter = Backbone.Model.extend(
  {
    name: "ProcessingFilter",
    defaults: {
      processing: ["L0","L1","BROWSE","L1.5","L1.0","L1.1"]
    },
    getWidget: function() {
      return new ProcessingWidget({model:this});
    },
  }
  );

var ProcessingWidget = BaseWidget.extend(
  {
    title: "Processing type",
    titleId: "processing_widget_title",
    tagName: "div",
    id: "filter_processing",
    processingTypes: {
      // value : display name
      "BROWSE" : "Browse",
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

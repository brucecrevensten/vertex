var SearchParameters = Backbone.Model.extend(
  {
    name: "SearchParameters",
    filters: [],
    initialize: function() {
      this.filters = [
        new BboxFilter(),
        new ProcessingFilter(),
        new PlatformFilter(),
        new DateFilter()
      ];

    self = this;
    for( var i in this.filters ) {
      this.filters[i].bind( "change", function(filter) {
        self.trigger("change:filter", filter);
      });
    }

    this.bind("change:filter", function(filter) {
//      console.log('a change:filter event was noticed!');
//     console.log('filter name: '+filter.name);
//      console.log(filter);
//      console.log(this.name);
      this.set( filter.toJSON() );
//      console.log(this.toJSON() );
    });

      },
      defaults: {
      format:"jsonp",
      bbox:"-135,64,-133,66",
      start:"2009-06-01",
      end:"2009-06-30",
      processing:["L0","L1","L1.0","L1.1","L1.5"],
      platform:["E2","R1","E1","J1","A3"]
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
    
    console.log('rendering SearchParametersView');
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

var BboxFilter = Backbone.Model.extend(
{
  name: "BboxFilter",
  defaults: {
    bbox:"-135,64,-133,66",
  },
  getWidget: function() {
    return new BboxWidget({model:this});
  }
}
);

var BboxWidget = BaseWidget.extend(
{
  title: "Geographic region",
  titleId: "bbox_widget_title",
  tagName: "div",
  events : {
    "change input" : "changed"
  },
  changed: function(evt) {
      var target = $(evt.currentTarget),
      data = {};
      data[target.attr('name')] = target.attr('value');
      console.log("Set "+target.attr('name')+"="+target.attr('value'));
      this.model.set(data);
  },
  render: function() {
    $(this.el).html(
      _.template('<div><label for="filter_bbox">BBOX: <input type="text" id="filter_bbox" name="bbox" value="<%= bbox %>"<label></div>', this.model.toJSON())
    );
    return this;
  }
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
      console.log("Set "+target.attr('name')+"="+target.attr('value'));
      this.model.set(data);
  },
  render: function() {
    $(this.el).html(
      _.template('<label for="filter_start">Start date <input type="text" id="filter_start" name="start" value="<%= start %>"></label>\
      <label for="filter_end">End date <input type="text" id="filter_end" name="end" value="<%= end %>"></label>\
      ', this.model.toJSON())
    );
    $(this.el).find('input').datepicker({
       dateFormat: 'yy-mm-dd',
       changeMonth: true,
       changeYear: true
   });
    return this;
  }
});

var PlatformFilter = Backbone.Model.extend(
  {
    name: "ProcessingFilter",
    defaults: {
      processing: ["E1","E2","J1","J2","A3","R1"]
    },
    getWidget: function() {
      return new PlatformWidget({model:this});
    },
  }
  );

var PlatformWidget = BaseWidget.extend(
  {
    title: "Platforms &amp; products",
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
         f = f + _.template('<li><label for="filter_platform_<%= name %>"><input type="checkbox" id="filter_platform_<%= name %>" value="<%= value %>" name="<%= name %>" <%= ifChecked %>>&nbsp;<%= name %></label></li>', rowData);
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

var SearchResults = Backbone.Collection.extend(
  {
    url:"http://localhost:3000/services/search/json",
    model:DataProduct,
    error:"",
    setParameters: function(sp) {
      this.searchParameters = sp;
    },
    getQueryString: function() {
      return this.url + JSON.stringify(this.searchParameters.toJSON());
    },
    parseObjectsToArrays: function(d, c) {
      var a = [];
      for ( var i=0, iLen=d.length; i < iLen; i++ ) {
        var inner = [];
        for ( var j=0, jLen=c.length; j < jLen; j++ ) {
          inner.push( d[i][c[j]] );
        }
        a.push( inner);
      }
      return a;
    },
    fetchSearchResults: function(sp) {
      this.setParameters(sp);

      var results = $.ajax({
        type: "GET",
        url: this.url,
        data: this.searchParameters.toJSON(),
        processData: true,
        dataType: "jsonp",
        context: this,
        success: function(data, textStatus, jqXHR) {
          this.data = data;
          this.refresh( this.data.results.rows );
        },
        error: function(jqXHR, textStatus, errorThrown) {
          //todo: fix this to be meaningful
          console.log(JSON.stringify(jqXHR) + ' ' + textStatus + ' ' +errorThrown); 
        }
      }).results;

    }
  }
);

var SearchResultsView = Backbone.View.extend(
{

  dataTable: null,
  hasRendered: false,
  initialize: function() {
    _.bindAll(this, "render");

    var searchResults = this.collection;
    searchResults.bind("refresh", this.render);

  },

  renderLength: function() {
    return _.template('<h3><%= length %> results found</h3>', this.collection);
  },

  render: function() {

    var preparedData = this.collection.parseObjectsToArrays(this.collection.data.results.rows, ["GRANULENAME","PROCESSINGTYPE","PLATFORM","ORBIT","FRAMENUMBER","ACQUISITIONDATE","CENTERLAT","CENTERLON"]);

    if ( false == this.hasRendered ) {
      this.hasRendered = true;
      this.dataTable = $(this.el).dataTable(
      {
        "bJQueryUI": true,
        "aaData": preparedData,
        "aoColumns": [
        { "sTitle": "Granule Name" },
        { "sTitle": "Processing" },
        { "sTitle": "Platform" },
        { "sTitle": "Orbit" },
        { "sTitle": "Frame" },
        { "sTitle": "Acquisiton Date" },
        { "sTitle": "Center Lat" },
        { "sTitle": "Center Lon" }
        ]
      }
      );
    } else {
      this.dataTable.fnClearTable();
      this.dataTable.fnAddData(preparedData);
    }
    return this;
  }

}
);

var SearchController = Backbone.Controller.extend(
  {
     
  }
);

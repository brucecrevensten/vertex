var SearchParameters = Backbone.Model.extend(
  {
    defaults: {
      format:"jsonp",
      bbox:"-135,64,-133,66",
      start:"1998-06-01T00:00:00Z",
      end:"1998-06-30T11:59:59Z",
      processing:["L0","L1"],
      platform:["E2","R1"]
    }
  }
);

var SearchParametersView = Backbone.View.extend(
{
  events : {
  "change input" :"changed",
  },

  changed: function(evt) {
    var target = $(evt.currentTarget),
    data = {};
    data[target.attr('name')] = target.attr('value');
    console.log("Set "+target.attr('name')+"="+target.attr('value'));
    this.model.set(data);
  },

  render: function() {
    // in future, this should delegate to each specific parameter
    $(this.el).html( 
      _.template('<label>format<input type="text" name="format" value="<%= format %>" /></label> <label>bbox<input type="text" name="bbox" value="<%= bbox %>" /></label> <label>start<input type="text" name="start" value="<%= start %>" /></label> <label>end<input type="text" name="end" value="<%= end %>" /></label> <label>processing<input type="text" name="processing" value="<%= processing %>" /></label> <label>platform<input type="text" name="platform" value="<%= platform %>" /></label>', this.model.attributes)
    );
  }
});

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
  }

}
);

var SearchController = Backbone.Controller.extend(
  {
     
  }
);

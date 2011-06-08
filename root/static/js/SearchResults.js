var SearchResults = Backbone.Collection.extend(
  {
    url: AsfDataportalConfig.apiUrl,
    model:DataProduct,
    error:"",
    setParameters: function(sp) {
      this.searchParameters = sp;
    },
    getQueryString: function() {
      return this.url + JSON.stringify(this.searchParameters.toJSON());
    },

    // Purpose of this function is to build the array of data that will be provided to the DataTable.
    // The DataTable expects an array of arrays, so we've gotta do a little bit of munging
    // from the incoming JSON.
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
        beforeSend: function(){
          $("#results-banner").hide();
          $('#async-spinner').show();
          $('#results-widget-wrapper').hide();
        },
        success: function(data, textStatus, jqXHR) {
          this.data = data;

          // Munge this data to get a local true ID on each model; need to wiggle
          // the returned JSON a little bit so that Backbone can consume the (lowercase)
          // 'id' field.
          for ( var i in data.results.rows.ROW ) {
            data.results.rows.ROW[i].id = data.results.rows.ROW[i].ID;
          }
          this.refresh( this.data.results.rows.ROW );
          $('#async-spinner').hide();
          $('#results-widget-wrapper').show();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          //todo: fix this to be meaningful

          switch(jqXHR.status) {
            case 204:
              $("#async-spinner").hide();
              $("#results-banner").show();
              break;
          }
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

    var preparedData = this.collection.parseObjectsToArrays(this.collection.data.results.rows.ROW, ["GRANULENAME","PROCESSINGTYPE","PLATFORM","ORBIT","FRAMENUMBER","CENTERLAT","CENTERLON","ACQUISITIONDATE","THUMBNAIL"]);
    if ( false == this.hasRendered ) {
      this.hasRendered = true;
      this.dataTable = $(this.el).dataTable(
      {
        "bAutoWidth" : false,
        "bJQueryUI": true,
        "aaData": preparedData,
        "aoColumns": [
        { "sTitle": "Granule Name",
          "bUseRendered": false,
          "fnRender": function(o) {
            return '<img src="'+o.aData[8]+'"/>'+o.aData[0];
          }
        },
        { "sTitle": "Processing" },
        { "sTitle": "Platform" },
        { "sTitle": "Orbit" },
        { "sTitle": "Frame" },
        { "sTitle": "Center Latitude/Longitude",
          "fnRender": function(o) {
            return o.aData[5]+', '+o.aData[6];
          }
        },
        { "bVisible" : false }, // suspend display of CenterLon distinct from the prior column
        { "sTitle": "Acquisition Date" },
        { "bVisible" : false } // suspend display of thumbnail
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
          gid = aData[0]+"_"+aData[1];

          // TODO: ensure that this depenency on a global object is mediated properly (probably through a SearchApp.getSearchResults() call).
          v = new DataProductView( { model: SearchApp.searchResults.get(gid) } );
          $(nRow).bind( "click", { id: aData[0], view: v }, function(e) {
              $("#product_profile").html( e.data.view.render().el );
              $("#product_profile").dialog(
                {
                  modal: true,
                  width: 600,
                  draggable: false,
                  resizable: false,
                  title: e.data.id,
                  position: "center"
                }
              );
          });
          return nRow;
        }
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


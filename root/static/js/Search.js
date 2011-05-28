var SearchParameters = Backbone.Model.extend(
  {
    defaults: {
      format:"jsonp"
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
      console.log(a);
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
          
          $('#searchResults').dataTable(
            {
            "bJQueryUI": true,
            "aaData": this.parseObjectsToArrays(data.results.rows, ["GRANULENAME","PROCESSINGTYPE","PLATFORM","ORBIT","FRAMENUMBER","ACQUISITIONDATE","CENTERLAT","CENTERLON"]),
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

        },
        error: function(jqXHR, textStatus, errorThrown) {
          //todo: fix this to be meaningful
          console.log(JSON.stringify(jqXHR) + ' ' + textStatus + ' ' +errorThrown); 
        }
      }).results;

    }
  }
);

var SearchController = Backbone.Controller.extend(
  {
    
  }
);

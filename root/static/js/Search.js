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
          return this;
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

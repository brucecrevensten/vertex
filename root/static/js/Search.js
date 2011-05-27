var SearchParameters = Backbone.Model.extend(
  {
    defaults: {
      format:"json"
    }
  }
);

var SearchResults = Backbone.Collection.extend(
  {
    url:"http://testapi.daac.asf.alaska.edu/services/search/json?query=",
    model:DataProduct,
    setParameters: function(sp) {
      this.searchParameters = sp;
    },
    getQueryString: function() {
      return this.url + JSON.stringify(this.searchParameters.toJSON());
    }
  }
);

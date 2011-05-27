$(function() {

  window.SearchAppView = Backbone.View.extend({
    el: $('#SearchApp'),
    
    //Do we want to use these this way? Maybe, I don't know!
    //mapTemplate: _.template($('#map-template').html()),
    //filtersTemplate: _.template($('#filters-template').html()),
    //resultsTemplate: _.template($('#results-template').html()),
    
    events: {
      //bind any events here...a good example would be for triggering requestResults when the filters change
    },
    
    initialize: function() {
      console.log('Building search app html structure...');
      var lcol = '<div id="leftcolumn"></div>';
      var rcol = '<div id="rightcolumn"></div>';
      var filters = '<div id="filters"></div>';
      var map = '<div id="searchmap">asdf</div>';
      var results = '<div id="results"></div>';
      $('SearchApp').append(lcol);
      $('SearchApp').append(rcol);
      $('leftcolumn').append(filters);
      $('rightcolumn').append(map + results);
      
      initMap('SearchMap');
    },
    
    render: function () {
      //not sure if we need this, but it might be used for updating views based on minimized results panes, etc.
    },
    
    handleResults: function () {
      //this should be where the result of the filters gets passed on to the results views. Or maybe in the render function above, actually? One or the other.
    }
    
    //we'll likely need more here as we figure it out
  });
  
  window.SearchApp = new SearchAppView;
});

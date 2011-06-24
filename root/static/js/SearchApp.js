$(function() {
	
	/*  
		TODO: Modify comment below once authentication is sketched out. 
		
		Create a User Model instance in the searchApp. This stores username, password, etc. Placing 
		it here creates a blank user object for each time the document loads (any time it refreshes). 
		This may not be desirable once the authentication is well sketched out. 
		Finally, create a View that operates on the #user_auth_submit div element in index.tt and tie it
		to watch the state of the user_current model instance. Inside that 
		element are the fields for the login dialog modal, the login buttons, the username echo, etc. 
		So each time the state of user_current changes this view can update either of those fields. 
	*/
	this.user_current = new User();
	var userLoginView = new UserLoginView(  { model: this.user_current, el: $('#user_auth_submit') });
    userLoginView.render();

	
  window.SearchAppView = Backbone.View.extend({
    el: $('#SearchApp'),
    
    //Do we want to use these this way? Maybe, I don't know!
    //mapTemplate: _.template($('#map-template').html()),
    //filtersTemplate: _.template($('#filters-template').html()),
    //resultsTemplate: _.template($('#results-template').html()),
    
    events: {
      //bind any events here...a good example would be for triggering requestResults when the filters change
    },

    // The SearchAppView scopes and manages the objects noted below,
    // defined in the initialize() function.
    searchResults: null,
    searchView: null,
    searchParameters: null,
    searchParametersView: null,
	
    
    initialize: function() {

    // init search behaviors
    this.searchParameters = new SearchParameters();
    this.searchParametersView = new SearchParametersView( 
      { 
        model: this.searchParameters, 
        el: $("#filters") 
      }
    );
    this.searchParametersView.render();

    this.searchResults = new SearchResults();
    this.searchResultsView = new SearchResultsView(
      {
        collection: this.searchResults,
        el: $("#results")
      }
    );
    this.searchResults.setView( this.searchResultsView );

    // change when the form changes
    this.searchParameters.bind("change",function() {
      SearchApp.searchResults.fetchSearchResults(SearchApp.searchParameters); // initial population
    });

    this.searchResults.fetchSearchResults(this.searchParameters); // initial population

    // Initialize the download queue
    this.downloadQueue = new DownloadQueue();
    this.downloadQueueView = new DownloadQueueView( 
      { 
        collection: this.downloadQueue,
        el: $("#download_queue")
      } 
    );
    this.downloadQueueSummaryView = new DownloadQueueSummaryView( 
      { 
        collection: this.downloadQueue,
        el: $("#queue_summary")
      }
    );
    this.downloadQueueSummaryView.render();
    $("#queue_summary").bind("click", { dqv: this.downloadQueueView }, function(e) {
      $("#download_queue").html(
        e.data.dqv.render().el.innerHTML
      );
      $("#download_queue").dialog(
       {
          modal: true,
          width: 800,
          draggable: false,
          resizable: false,
          title: "Download queue",
          position: "top"
        }
      );
    });


    //fire up the map
    initMap('searchMap');

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

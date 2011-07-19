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

    // The SearchAppView scopes and manages the objects noted below,
    // defined in the initialize() function.
    searchResults: null,
    searchView: null,
    searchParameters: null,
    searchParametersView: null,
    currentUser: null,
	
    
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

    this.postFilters = new PostFilters();
    this.postFiltersView = new PostFiltersView(
    {
      model: this.postFilters,
      el: $("#platform_facets")
    }
    );

    this.searchResults = new SearchResults();

    this.searchResultsView = new SearchResultsView(
      {
        collection: this.searchResults,
        el: $("#searchResults")
      }
    );
    this.searchResults.setView( this.searchResultsView );

    // trouble brewing.  this may cause either recursion and/or things to not be cleared when expected.
    // need to distinguish between a render upon new search results, and a render based on
    // filtering.
    this.searchResultsView.bind("render", function() {
      SearchApp.postFiltersView.render( SearchApp.searchResults.platforms );
    });

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

    $('#triggerSearch').button(
      {
        icons: {
          primary: "ui-icon-search"
        },
        label: "Search"
    }).bind("click", { sp: this.searchParameters, sr: this.searchResults }, function(e) {
      e.data.sr.fetchSearchResults(e.data.sp); // initial population
    }).focus().click();

    $('#resetSearch').button(
      { icons: { primary: "ui-icon-refresh"}, label: "Reset"}).bind("click", { sp: this.searchParameters, spv: this.searchParametersView, sr: this.searchResults }, function(e) {
        e.data.sp.setDefaults();
        e.data.spv.render();
        e.data.sr.fetchSearchResults(e.data.sp);
      });

    //fire up the map
    initMap('searchMap');
 
    this.user = new User();
    this.userLoginView = new UserLoginView( { model: this.user, el: $('#login_dialog') } );
    this.userLoginButton = new UserLoginButton( { model: this.user, el: $('#user_tools') });
    this.userLoginButton.render();
  

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

	// Instead of using serialzeArray() we can use serializeJSON to return JSON formatted form data. 
	$.fn.serializeJSON=function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(n, i){
			json[n['name']] = n['value'];
		});
		return json;
	};
});

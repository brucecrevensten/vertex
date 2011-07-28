$(function() {

		
  window.SearchAppView = Backbone.View.extend({	
    
    initialize: function() {
	
	  this.user = new User();
      this.userLoginView = new UserLoginView( { model: this.user, el: $('#login_dialog') } );
      this.userLoginButton = new UserLoginButton( { model: this.user, el: $('#user_tools') });
      this.userLoginButton.render();
    	this.userLoginFields = new UserLoginFields({ model: this.user, el: $('#form1')});
  	  this.userLoginMessage = new UserLoginMessage( {model: this.user, el: $('#login_msg')});
  		this.userLoginMessage.render();
    

    // init search behaviors
    this.searchParameters = new SearchParameters();
    this.postFilters = new PostFilters();


    this.searchResults = new SearchResults();
    this.searchResults.searchParameters = this.searchParameters;
    this.searchResults.postFilters = this.postFilters;
    this.searchResults.postFilters.bind('change', jQuery.proxy( this.searchResults.filter, this.searchResults) ); // manual binding between two models
    
    this.searchParametersView = new SearchParametersView( 
      { 
        model: this.searchParameters, 
        el: $("#filters") 
      }
    );
    this.searchParametersView.render();  

    this.activeSearchFiltersView = new ActiveSearchFiltersView(
      { 
        'searchParameters': this.searchParameters,
        'postFilters': this.postFilters
      }
    );

    this.downloadQueue = new DownloadQueue();
    this.downloadQueueView = new DownloadQueueView( 
      { 
        collection: this.downloadQueue,
        el: $("#download_queue")
      } 
    );

    this.searchResultsView = new SearchResultsView(
      {
        'postFilters': this.postFilters,
        'collection': this.searchResults,
        'el': $("#searchResults"),
		'model': this.user,
		'downloadQueue': this.downloadQueue
      }
    );

    this.postFiltersView = new PostFiltersView(
      {
        'searchResults': this.searchResults,
        'model': this.postFilters,
        'el': $("#platform_facets")
      }
    );

    this.searchResultsProcTool = new SearchResultsProcessingWidget( {
      collection: this.searchResults
    });

    this.downloadQueueSummaryView = new DownloadQueueSummaryView( 
      { 
        collection: this.downloadQueue,
        el: $("#queue_summary")
      }
    );
    this.downloadQueueSummaryView.render();
    //TODO:move this
    $("#queue_summary").bind("click", this.downloadQueueView.render );
    
    this.downloadQueueSearchResultsView = new DownloadQueueSearchResultsView( {
      collection: this.downloadQueue 
    });
    //TODO: move this
    this.downloadQueueSearchResultsView.setSearchResultsView(this.searchResultsView);
    
    this.downloadQueueMapView = new DownloadQueueMapView( {
      collection: this.downloadQueue
    });
    //TODO: move this
    this.downloadQueueMapView.setSearchResultsView(this.searchResultsView);

    $('#triggerSearch').button(
      {
        icons: {
          primary: "ui-icon-search"
        },
        label: "Search"
      }).bind("click", jQuery.proxy( function(e) {
        this.searchResultsView.showSearching();
        this.searchResults.fetchSearchResults(); // initial population
      }, this)).focus();//.click(); ///// Add .click() to make app begin searching immediately

      $('#resetSearch').button(
        { icons: { primary: "ui-icon-refresh"}, label: "Reset"}).bind("click", { sp: this.searchParameters, spv: this.searchParametersView, sr: this.searchResults, srv:this.searchResultsView }, function(e) {
          e.data.sp.setDefaults();
          e.data.spv.setWidgets();
          e.data.spv.render();

		  e.data.sr.data = {};
		  e.data.sr.reset(); // can't be silent here, must be loud
		  e.data.srv.render();
		  
	      e.data.sr.trigger('clear_results');
		  e.data.srv.showBeforeSearchMessage();
        });

      //fire up the map
      initMap('searchMap');

      v = new FeedbackButton();
      v.render();
      
    },

  });


  window.SearchApp = new SearchAppView;
window.onbeforeunload = function() {
	return "Are you sure you want to leave? Your current search results will be lost.";
}
	// Instead of using serialzeArray() we can use serializeJSON to return JSON formatted form data. 
	$.fn.serializeJSON=function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(n, i){
			json[n['name']] = n['value'];
		});
		return json;
	};
});

var ActiveSearchFiltersView = Backbone.View.extend(
{
  el: '#active-filters-list',
  initialize: function() {
    _.bindAll(this);
    this.options.searchParameters.bind('change', this.render);
    this.options.postFilters.bind('change', this.render);
  },
  render: function() {
    
    $('#active-filters').show();
    $(this.el).empty();
    var p = this.options.searchParameters.get('platform');
    var platformText;
    if ( _.isEqual( p, AsfPlatformConfig.platform ) ) {
      platformText = 'All Platforms';
    } else if( _.isEmpty( p ) ) {
      platformText = 'No platforms selected'
    } else {
      platformText = AsfUtility.rtrim( _.reduce( p, function( m, e ) {
        return m + AsfPlatformConfig.platformTypes[e] + ', ';
      }, ''), ', ');
    }

    var activeDateAndPlatforms = this.options.searchParameters.toJSON();
    activeDateAndPlatforms['platformText'] = platformText;

    $(this.el).append(
      _.template('<h4><%= platformText %>: <%= start %>&mdash;<%= end %></li>', activeDateAndPlatforms )
    );
    var ul = $('<ul/>');

    var postFilterText;
    if( true != _.isUndefined( this.options.postFilters ) ) {
      _.each( this.options.postFilters.toJSON(), function(e, i, l) {

        var postFilterItems = [];
        if( e.direction && 'any' != e.direction ) {
          postFilterItems.push( AsfUtility.ucfirst( e.direction ) );
        }
        if( e.path ) {
          // ALOS = special case
          if( 'ALOS' == i ) {
            postFilterItems.push( 'Path(s) ' + e.path);
          } else {
            postFilterItems.push( 'Orbit(s) ' + e.path);
          }
        }
        if( e.frame ) {
          postFilterItems.push('Frame(s) '+e.frame)  
        }
        if( e.beamoffnadir ) {
          var beamsOffNadirs = [];

          if( _.isEqual( ['empty'], e.beamoffnadir )) {
            // this doesn't get painted in the DOM, but doesn't hurt to note this case
            beamsOffNadirs.push( '(No beam modes match)' );
          } else {
            _.each( e.beamoffnadir, function( e, i, l ) {

              if( 'WB1' != e ) {
                beamsOffNadirs.push(e.substr(0, 3) + ' (' + e.substr(3) + '&deg;)');
              } else {
                beamsOffNadirs.push('WB1');
              }
            });
          }
          postFilterItems.push(beamsOffNadirs.join(' / '));
          
        }
        if( e.beam ) {
          var beams = [];

          if( _.isEqual( ['empty'], e.beam )) {
            // this doesn't get painted in the DOM, but doesn't hurt to note this case
            beams.push( '(No beam modes match)' );
          } else {
        
            _.each( e.beam, function( e, i, l ) {
              beamsOffNadirs.push(e.substring(1, 3));
            });
          }
          postFilterItems.push(beams.join(' / '));
        }

        if( true != _.isEmpty( postFilterItems) ) {
          ul.append(
            _.template('<li><%= postFilters %></li>', { 'postFilters': i + ': '+postFilterItems.join(', ') } )
          );
        }

      }, this);
    }
    $(this.el).append(ul);
    return this;
  }

  


});
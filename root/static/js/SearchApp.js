$(function() {
window.SearchAppView = Backbone.View.extend({	

  initialize: function() {
	 $.storage = new $.store();

    this.user = new User();

    this.userLoginView = new UserLoginView( { model: this.user, el: $('#login_dialog') } );
    this.userLoginButton = new UserLoginButton( { model: this.user, el: $('#user_tools') });
    this.userLoginButton.render();
    this.userLoginFields = new UserLoginFields({ model: this.user, el: $('#form1')});
    this.userLoginMessage = new UserLoginMessage( {model: this.user, el: $('#login_msg')});
    this.userLoginMessage.render();
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

    // Hack to ensure buttons look "off" after filtering/rendering clicks occur
    $('#platform_facets fieldset button').live('click', function() {
      $(this).removeClass("ui-state-focus");
    });

    this.searchResultsProcTool = new SearchResultsProcessingWidget(
    {
      collection: this.searchResults
    }
    );

    this.downloadQueueSummaryView = new DownloadQueueSummaryView( 
    { 
      collection: this.downloadQueue,
      el: $("#queue_summary")
    }
    );
    this.downloadQueueSummaryView.render();
    this.user.bind("authSuccess", this.downloadQueueSummaryView.render);
    this.user.bind("authError", this.downloadQueueSummaryView.render);
    this.user.bind("authRefresh", this.downloadQueueSummaryView.render);
    
    //TODO:move this
    $("#queue_summary").bind("click", this.downloadQueueView.render );

    this.downloadQueueSearchResultsView = new DownloadQueueSearchResultsView(
    {
      collection: this.downloadQueue 
    }
    );
    
    //TODO: move this
    this.downloadQueueSearchResultsView.setSearchResultsView(this.searchResultsView);

    this.downloadQueueMapView = new DownloadQueueMapView( {
      collection: this.downloadQueue
    });
    //TODO: move this
    this.downloadQueueMapView.setSearchResultsView(this.searchResultsView);


    $('#resetSearch').button(
    { 
      icons: { primary: "ui-icon-refresh"}, 
      label: "Reset"
    }
    ).bind("click",
    { 
      sp: this.searchParameters,
      spv: this.searchParametersView,
      sr: this.searchResults,
      srv:this.searchResultsView,
      pf: this.postFilters
    }, function(e) {
      
      e.data.sp.setDefaults();
      e.data.spv.setWidgets();
      e.data.spv.render();
      e.data.pf.reset();


      e.data.sr.data = {};
      e.data.sr.reset(); // can't be silent here, must be loud
      e.data.srv.render();

      e.data.sr.trigger('clear_results');
      e.data.srv.showBeforeSearchMessage();
      $("#srCount").empty()
      $("#triggerSearch").button('disable').focus();

    });


	this.searchButtonState = new SearchButtonState(); // defaults to searchState as opposed to stopSearchState
    this.searchButtonView = new SearchButtonView( 
				{ 
					"el": $("#triggerSearch"), 
					"el2": $("#stopSearch"),
					"model": this.searchButtonState,
					"geographicFilter": this.searchParameters.getGeographicFilter(),
					"granuleFilter": this.searchParameters.getGranuleFilter()
				} );
	this.geoFilter = this.searchParameters.getGeographicFilter();
	
	this.searchButtonView.toggleButton();
    this.searchResults.bind('refresh', jQuery.proxy(function(e) {
      this.searchButtonView.model.set({'state': 'searchButtonState'});
    }, this));
				
	this.searchButtonView.render();

    //fire up the map
    initMap('searchMap');

    v = new FeedbackButton();
    v.render();

  }
});

window.SearchApp = new SearchAppView;  

 /*
window.onbeforeunload = function() {
	return "Are you sure you want to leave? Your current search results will be lost.";
}*/


// Instead of using serialzeArray() we can use serializeJSON to return JSON formatted form data. 
$.fn.serializeJSON=function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(n, i){
			json[n['name']] = n['value'];
		});
		return json;
	};
}
);

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
      
      // We want to iterate over the list of post filters, hence
      // the unfortunate syntax below
      _.each( this.options.postFilters.postFilters, function(e, i, l) {

        var f = e.toJSON();

        var postFilterItems = [];
        if( f.direction && 'any' != f.direction ) {
          postFilterItems.push( AsfUtility.ucfirst( f.direction ) );
        }
        if( f.path ) {
          // ALOS = special case
          if( 'ALOS' == i ) {
            postFilterItems.push( 'Path(s) ' + f.path);
          } else {
            postFilterItems.push( 'Orbit(s) ' + f.path);
          }
        }
        if( f.frame ) {
          postFilterItems.push('Frame(s) '+f.frame)  
        }

        // ALOS case
        if( f.beamoffnadir ) {
          var beamsOffNadirs = [];
          if ( _.isEqual( f.beamoffnadir, e.defaults.beamoffnadir ) ) {
            // this either means that _all_ beam modes are selected, so don't paint anything
          } else {
            
            if( _.isEqual( ['empty'], f.beamoffnadir ) ) {
              // No beam modes selected
              beamsOffNadirs.push('(No beam modes selected)');
            } else { 
              _.each( f.beamoffnadir, function( e, i, l ) {
                if( 'WB1' == e ) {
                  beamsOffNadirs.push('WB1');
                } else if( 'WB2' == e ) {
                  beamsOffNadirs.push('WB1');                
                } else {
                  beamsOffNadirs.push(e.substr(0, 3) + ' (' + e.substr(3) + '&deg;)');
                }
              });
            postFilterItems.push(beamsOffNadirs.join(' / '));
            }
          }          
        }

        // RADARSAT case
        if( f.beam ) {
          var beams = [];
          if( _.isEqual( f.beam, e.defaults.beam) ) {
            // All beam modes selected, don't display anything
          } else {
            if( _.isEqual( ['empty'], e.beam )) {
              beams.push( '(No beam modes selected)' );            
            } else {
              _.each( f.beam, function( e, i, l ) {
                beams.push(e.substring(1, 3));
              });
            }
            postFilterItems.push(beams.join(' / '));
          }
        }

        if( true != _.isEmpty( postFilterItems ) ) {
          ul.append(
            _.template('<li><%= postFilters %></li>', { 'postFilters': e.platform + ': '+postFilterItems.join(', ') } )
          );
        }

      }, this);
    }
    $(this.el).append(ul);
    return this;
  }

  


});

JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {

		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {

		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};

JSON.parse = JSON.parse || function (str) {
	if (str === "") str = '""';
	eval("var p=" + str + ";");
	return p;
};

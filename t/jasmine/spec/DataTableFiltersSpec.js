
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
// Since this spec relies on sinon working properly we test the basics of sinon's fake server
describe("Create a sinon server", function() {
  var server;
  var fakeUrl = "fakeUrl";

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function () {
    server.restore();
  });

  it("should make a successful ajax request", function () {
    server.respondWith("GET", fakeUrl,
                       [200, { "Content-Type": "application/json" },
                        JSON.stringify(Fixtures.arrayedJSON1)]);

    var callback = sinon.spy();

    jQuery.ajax({
      url: fakeUrl,
      success:  function(data, textStatus, jqXHR) {
		callback();
	  }
    });

    server.respond(); 
	
    expect(callback.calledOnce).toBeTruthy();

  });
});

describe("Create a datable", function() {
it("Should create a datatable and load it with fixture data via ajax request to a sinon server", function() {


// In order to render the results we have to satisfy dependencies between various objects in the application
// SearchResults will make the request to sinon server and genereate dataproduct objects from the servers response
// and render the dataproduct objects into an html table.  
	var searchResults = new SearchResults();
	var searchParameters = new SearchParameters();
	this.searchParameters=searchParameters;
	searchResults.searchParameters = searchParameters;
	this.searchResults = searchResults;
	this.user = new User();
	this.postFilters = new PostFilters();
    this.downloadQueue = new DownloadQueue();
	this.searchResults = searchResults;
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
    
    this.postFilters.searchResultsView = this.searchResultsView;
	this.searchResults.postFilters = this.postFilters;

    //
	this.searchResults.postFilters.bind('change', jQuery.proxy( this.searchResults.filter, this.searchResults) ); // manual binding between two models

	
   this.searchParametersView = new SearchParametersView( 
    { 
      model: this.searchParameters, 
      el: $("#filters") 
    }
    );

  //  this.searchParametersView.render();  


   
   this.activeSearchFiltersView = new ActiveSearchFiltersView(
    { 
      'searchParameters': this.searchParameters,
      'postFilters': this.postFilters
    }
    );

 

    //

	// Various objects invoke calls to other objects' methods through this staticy object, SearchApp. These dependencies 
	// should probably be removed so that instantiation is not as crazy. 
	window.SearchApp = {};
	window.SearchApp.searchResults = this.searchResults;
	window.SearchApp.searchParameters = this.searchParameters;
	window.SearchApp.user = this.user;
	window.SearchApp.searchResultsView = this.searchResultsView;
	window.SearchApp.downloadQueue = this.downloadQueue;
	window.SearchApp.searchParametersView = this.searchParametersView;
	window.SearchApp.activeSearchFiltersView = this.activeSearchFiltersView;
	this.postFiltersView.searchResultsView = this.searchResultsView;

	window.SearchApp.postFiltersView = this.postFiltersView;



	$.fn.dataTableExt.afnFiltering.push(
	    jQuery.proxy( function( oSettings, aData, iDataIndex ) {
	       // var iMin = document.getElementById('min').value * 1;
	   		
	    	if (this.searchResults.bool) {
	    		//console.log(aData);
	    		var h = $(aData[0]);
	    		var c = h.find("div").attr("product_id");
	    		//console.log(c);
	    		if (this.searchResults.get(c).id =="E2_81938_STD_F143") {
	    				this.postFiltersView.render();
	    		//h.find('#pid')
	    		//E2_81938_STD_F143
	        	return false;
	    	}
			}

			return true;	
	    	
	    }, this)
	);


	// Create the sinon server and respond with fixture data
	var server;		
	var fakeUrl = "/fakeUrl";
    server = sinon.fakeServer.create();

	server.respondWith("POST", fakeUrl,
                       [200, { "Content-Type": "application/json" },
                        JSON.stringify(Fixtures2.arrayJSON50)]);

    var callback = sinon.spy();

	// Make the actual search request to the fake url and pass a callback to detect success
    this.searchResults.fetchSearchResults(fakeUrl, null, callback); 

   	server.respond();
	
	// The call back is called inside the success method of the xhr ajax request object. So if it is called
	// it means the request was successful.
	expect(callback.calledOnce).toBeTruthy();
	
	// Make sure that the SearchResults Collection has data
	expect(this.searchResults.size()).toBeGreaterThan(0);

	// Creating Custom Filters
  	var button = $('<button id="filterButton"></button>').button({
	      icons: {
	        primary: "ui-icon-refresh"},
	        label: "Filter"
	    }).bind("click", jQuery.proxy( function(e) {
	      		
	      	this.searchResults.bool = !this.searchResults.bool;
	      	this.searchResultsView.dataTable.fnDraw();
	      
	    }, this));
	       	 

	    $('#filterButtonContainer').append(button);

 });	

});
	
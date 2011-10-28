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

	// Various objects invoke calls to other objects' methods through this staticy object, SearchApp. These dependencies 
	// should probably be removed so that instantiation is not as crazy. 
	window.SearchApp = {};
	window.SearchApp.searchResults = this.searchResults;
	window.SearchApp.user = this.user;
	window.SearchApp.searchResultsView = this.searchResultsView;
	
	// Currently the search results will be rendered via the SearchResultsView. Since at the time of writing this test
	// the search results view does not use a datatable, then we do not want it to render.
	// So we unbind all of the events it listens for inside the SearchResults object. 
    this.searchResults.unbind(); 
	
	// When the SearchResults.fetchSearchResults() method is called it sends an ajax request. If the request
	// is successful then it will trigger a refresh event. We therefore hook a callback to this event that will
	// render the dataproduct objects genereated from the ajax response into a table. In production this operation
	// should be replaced by the SearchResultsView.render() method. 
	this.searchResults.bind('refresh', function() {	
	    var ur = this.user.getWidgetRenderer();
		var li="";
		var li_2="";
		this.searchResults.each( function( model, i, l ) {   
	      	var d = model.toJSON();
	
		     li = '<tr><td class="productRow" id="result_row_'+d.id+'" product_id="'+d.id+'" onclick="window.showProductProfile(\''+d.id+'\'); return false;">'
		      + ur.srThumbnail( model )
		      + _.template( this.searchResultsView.getPlatformRowTemplate( d.PLATFORM ), d) 
		      + '<div class="productRowTools">'
		      + '<button title="More information&hellip;" role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only">'
		      + '<span class="ui-button-icon-primary ui-icon ui-icon-help"></span>'
		      + '<span class="ui-button-text">More information&hellip;</span>'
		      + '</button>'
		      + '<div title="Show files&hellip;" onclick="window.showInlineProductFiles(event, \''+d.id+'\'); return false;" class="tool_enqueuer ui-button ui-widget ui-state-default ui-corner-all ui-button-icons-only queue_toggler" product_id="'+d.id+'">'
		      + '<span class="ui-button-icon-primary ui-icon ui-icon-circle-plus"></span>'
		      + '<span class="ui-button-text">Show files&hellip;</span>'
		      + '<span class="ui-button-icon-secondary ui-icon ui-icon-triangle-1-s"></span>'
		      + '</div>'
		      + '</div><div style="clear:both;"></div></td></tr>';
	
			li_2 += li;
	    }, this);
		
	
		// Generate the table and populate it html generated from data products
		var tableHtml =
						'<div id="container" style="width:400px; margin:0 auto;">'+
						'<table id="searchResults" style="margin:20px 0px 20px 0px;">'+
							'<thead>'+
								'<tr>'+
									'<th></th>'+
								'</tr>'+
							'</thead>'+
							'<tbody>'+
								li_2 +
							'</tbody>'+
						'</table>'+'</div>';
						
		$('body').append(tableHtml);

		// Enhance the table using a DataTable object. 
		var dataTable = $('#searchResults').dataTable(
			{ 
					"bJQueryUI":true,
					"bProcessing": true,
					"sPaginationType": "full_numbers",
					"bAutoWidth": false,
					"aoColumns": [
						{"sWidth": "100%"}
					]
		});
	
	},this);
	
	
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


	/** Possible start on a unit test for interacting with the download Queue ***/ 
	// Create a Download Queue object and make sure it works with the data table. This means that you can add products to the queue
	// by clicking buttons in the datatable search results. 
	// Dependencies that need to be fixed
 /*	$.storage = new $.store();

	$('body').append('<div id="download_queue"></div>');
	this.downloadQueue = new DownloadQueue();
	
	this.downloadQueueView = new DownloadQueueView( 
    { 
      collection: this.downloadQueue,
      el: $("#download_queue")
    } 
    );
    SearchApp.downloadQueue = this.downloadQueue;
    SearchApp.downloadQueueView = this.downloadQueueView; */
/******   *** * ** * ** * **  ** * **********                     ****/

 });	

});
	
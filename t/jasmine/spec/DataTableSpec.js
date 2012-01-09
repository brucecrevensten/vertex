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
      window.SearchApp.downloadQueue = this.downloadQueue;


      $.fn.dataTableExt.afnFiltering.push(
        jQuery.proxy( function( oSettings, aData, iDataIndex ) {
         // var iMin = document.getElementById('min').value * 1;

         if (this.searchResults.bool) {
            //console.log(aData);
            var h = $(aData[0]);
            var c = h.find("div").attr("product_id");
            console.log(c);
            if (this.searchResults.get(c).id =="E2_81938_STD_F143") {
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

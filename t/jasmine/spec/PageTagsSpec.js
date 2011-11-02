// Mock out the PageTag functions that we should be calling.
ntptEventTag = jasmine.createSpy();
ntptAddPair = jasmine.createSpy();
ntptDropPair = jasmine.createSpy();


// Mock out various SearchApp methods that need to be called.
var SearchApp = {
  searchResults: {
    searchParameters: { },
  },
  searchResultsView: { },
  postFilters: { },
  user: { },
};

SearchApp.searchResults.get = function(arg) {
  return new Backbone.Model({
    'BEAMMODEDESC': 'Mock',
    'BEAMMODETYPE': 'Mock',
    'FRAMENUMBER': 'Mock',
    'ORBIT': 'Mock',
    'acquisitionDateText': 'Mock',
    'ASCENDINGDESCENDING': 'Mock',
    'POLARIZATION': 'Mock',
  });
};
SearchApp.searchResults.searchParameters.update = function(arg) {
  return arg;
};
SearchApp.searchResultsView.showSearching = function(arg) {
  return arg;
};
SearchApp.searchResultsView.showBeforeSearchMessage = function(arg) {
  return arg;
};
SearchApp.postFilters.reset = function(arg) {
  return arg;
};
SearchApp.user.getWidgetRenderer = function(arg) {
  return {
    ppBrowse: function(arg) {
      return(arg);
    },
    ppFileList: function(arg) {
      return(arg);
    },
  };
};
SearchApp.searchResults.fetchSearchResults = function(arg) {
  return {
    abort: function(arg) {
      return arg;
    },
  };
};
SearchApp.searchResults.searchParameters.toJSON = function(arg) {
  return arg;
};

describe('EMS PageTags', function() {
  // Spec 16.1.1
  it('Clicking the "Search" button should generate a PageTag event', function() {
    var startSearch = $('<button id="triggerSearch"></button>');
    var stopSearch = $('<button id="stopSearch"></button>');
    var searchButtonState = new SearchButtonState();
    var searchButtonView = new SearchButtonView({
      "model": searchButtonState,
      "el": startSearch,
      "el2": stopSearch,
      "geographicFilter": new GeographicFilter(),
      "granuleFilter": new GranuleFilter()
      });
    startSearch.click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=startSearch');
  });

  // Spec 16.1.2
  it('Clicking platform info buttons should generate a PageTag event', function() {
    var platformFilter = new PlatformFilter();
    var platformWidget = new PlatformWidget({model: platformFilter});
    platformWidget.render();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=viewPlatform');
  });

  // Spec 16.1.3
  it('Clicking the "Stop Search" button should generate a PageTag event', function() {
    var startSearch = $('<button id="triggerSearch"></button>');
    var stopSearch = $('<button id="stopSearch"></button>');
    var searchButtonState = new SearchButtonState();
    var searchButtonView = new SearchButtonView({
      "model": searchButtonState,
      "el": startSearch,
      "el2": stopSearch,
      "geographicFilter": new GeographicFilter(),
      "granuleFilter": new GranuleFilter()
      });
    startSearch.click();
    stopSearch.click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=stopSearch');
  });

  // Spec 16.1.4
  it('Clicking the "Reset" button should generate a PageTag event', function() {
    // Due to where the Reset button is setup (in SearchApp.js) this test
    // will have to manual.
  });

  // Spec 16.1.5
  it('Clicking to view the product profile should generate a PageTag event', function() {
    showProductProfile('testGranule');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=showProductProfile');
  });

  // Spec 16.1.6
  it('Clicking the browse image in the profile page should generate a PageTag event', function() {
  });

  // Spec 16.1.7
  it('"Add all by type" events generate a PageTag event that records processing type', function() {
  });

  // Spec 16.1.8
  it('Clicking the "Login" button generates a PageTag event', function() {
  });

  // Spec 16.1.9
  it('Clicking the "Login" button in the login modal generates a PageTag event', function() {
  });

  // Spec 16.1.10
  it('Clicking the "Register" button in the login modal generates a PageTag event', function() {
  });

  // Spec 16.1.11
  it('Adding items to the download queue generates a PageTag event', function() {
  });

  // Spec 16.1.12
  it('Removing items from the download queue generates a PageTag event', function() {
  });

  // Spec 16.1.13
  it('Clicking a bulk download type in the download queue modal generates a PageTag event', function() {
  });

  // Spec 16.1.14
  it('Clicking an individual download link generates a PageTag event', function() {
  });

  // Spec 16.1.15
  it('Clicking the "Feedback" button generates a PageTag event', function() {
  });

  // Spec 16.1.16
  it('Clicking the "Send Feedback" button generates a PageTag event', function() {
  });

});

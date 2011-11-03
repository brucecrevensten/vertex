beforeEach( function() {
  jasmine.getFixtures().fixturesPath = 'spec/fixtures';
  loadFixtures('SearchApp.html');
  window.SearchApp = new SearchAppView;
});

describe('EMS PageTags', function() {
  beforeEach( function() {
    // Mock out the PageTag functions that we should be calling.
    ntptEventTag = jasmine.createSpy('ntptEventTag');
    ntptAddPair = jasmine.createSpy('ntptAddPair');
    ntptDropPair = jasmine.createSpy('ntptDropPair');
  });
  // Spec 16.1.1
  it('16.1.1 - Clicking the "Search" button should generate a PageTag event', function() {
    var geofilter = SearchApp.searchParameters.getGeographicFilter();
    geofilter.set({'bbox': '-180,-90,180,90'});
    $('#filter_bbox').val('-180,-90,180,90');
    $('#filter_bbox').trigger('change');
    var searchButton = $('#triggerSearch');
    searchButton.click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=startSearch');
  });

  // Spec 16.1.2
  it('16.1.2 - Clicking platform info buttons should generate a PageTag event', function() {
    var platformFilter = new PlatformFilter();
    var platformWidget = new PlatformWidget({model: platformFilter});
    var e = new jQuery.Event('click');
    e.currentTarget = $('<button platform="A3">?</button>');
    platformWidget.renderPlatformInfo(e);
    $('#platform_profile').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=viewPlatform');
  });

  // Spec 16.1.3
  it('16.1.3 - Clicking the "Stop Search" button should generate a PageTag event', function() {
    var geofilter = SearchApp.searchParameters.getGeographicFilter();
    geofilter.set({'bbox': '-180,-90,180,90'});
    $('#filter_bbox').val('-180,-90,180,90');
    $('#filter_bbox').trigger('change');
    var searchButton = $('#triggerSearch');
    searchButton.click();
    // Clear the results of the ntptEventTag call from running the
    // search button or it will get checked with the
    // toHaveBeenCalledWith check below.
    ntptEventTag = null;
    ntptEventTag = jasmine.createSpy('ntptEventTag');
    var stopButton = $('#stopSearch');
    stopButton.click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=stopSearch');
  });

  // Spec 16.1.4
  it('16.1.4 - Clicking the "Reset" button should generate a PageTag event', function() {
    var resetButton = $('#resetSearch');
    resetButton.click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=resetSearch');
  });

  // Spec 16.1.5
  it('16.1.5 - Clicking to view the product profile should generate a PageTag event', function() {
    //showProductProfile('testGranule');
    //expect(ntptEventTag).toHaveBeenCalledWith('ev=showProductProfile');
  });

  // Spec 16.1.6
  it('Clicking the browse image in the profile page should generate a PageTag event', function() {
    // This may have to be a manual test.
  });

  // Spec 16.1.7
  it('"Add all by type" events generate a PageTag event that records processing type', function() {
    
  });

  // Spec 16.1.8
  it('16.1.8 - Clicking the "Login" button generates a PageTag event', function() {
    var loginButton = $('#login_button');
    loginButton.click();
    $('#login_dialog').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=loginModal');
  });

  // Spec 16.1.9
  it('16.1.9 - Clicking the "Login" button in the login modal generates a PageTag event', function() {
    var userLoginView = SearchApp.userLoginView;
    userLoginView.login();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=login');
  });

  // Spec 16.1.10
  it('16.1.10 - Clicking the "Register" button in the login modal generates a PageTag event', function() {
    $('#login_button').click();
    $('#login_dialog').trigger('Register');
    $('#login_dialog').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=register');
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
  it('16.1.15 - Clicking the "Feedback" button generates a PageTag event', function() {
    var feedbackButton = new FeedbackButton();
    $(feedbackButton.el).click();
    $('#feedbackForm').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=Feedback');
  });

  // Spec 16.1.16
  it('16.1.16 - Clicking the "Send Feedback" button generates a PageTag event', function() {
    var feedbackButton = new FeedbackButton();
    $(feedbackButton.el).click();
    $('#feedbackForm').trigger('Send Feedback');
    $('#feedbackForm').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=submitFeedback');
  });

});

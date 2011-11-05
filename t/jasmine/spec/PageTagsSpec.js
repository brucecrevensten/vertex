describe('EMS PageTags', function() {

  beforeEach( function() {
    $.storage.del('q_cookie_');
    jasmine.getFixtures().fixturesPath = 'spec/fixtures';
    loadFixtures('SearchApp.html');
    window.SearchApp = new SearchAppView;
    
    // Mock out jQuery.ajax calls to return fixture data.
    spyOn($, "ajax").andCallFake(function(args) {
      waits(1000);
      args.success(searchReturn);
      this.abort = function() { };
      return(this);
    });

    // Mock out the PageTag functions that we should be calling.
    ntptLinkTag = jasmine.createSpy('ntptLinkTag');
    ntptEventTag = jasmine.createSpy('ntptEventTag');
    ntptAddPair = jasmine.createSpy('ntptAddPair');
    ntptDropPair = jasmine.createSpy('ntptDropPair');
    window.alert = jasmine.createSpy('alert');
    window.open = jasmine.createSpy('open');
  });

  afterEach( function() {
    $.storage.del('q_cookie_');
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
    ntptEventTag.reset();
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
  it('16.1.5, 16.1.6, 16.1.11, 16.1.12, 16.1.14 - Product profile PageTag events', function() {

    SearchApp.user.set({'authenticated': true, 'authType': 'LEGACY'}, {'silent': true});
    var geofilter = SearchApp.searchParameters.getGeographicFilter();
    geofilter.set({'bbox': '-180,-90,180,90'});
    $('#filter_bbox').val('-180,-90,180,90');
    $('#filter_bbox').trigger('change');
    var searchButton = $('#triggerSearch');
    searchButton.click();
    ntptEventTag.reset();
    showProductProfile('E2_81917_STD_F305');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=showProductProfile');
    $('#product_profile a').click();
    expect(ntptLinkTag).toHaveBeenCalledWith($('#product_profile a').get(0));
    var button = $('#product_profile button').get(0);
    button.click();
    var product_file_id = $(button).attr('product_file_id');
    expect(ntptAddPair).toHaveBeenCalledWith('product_file_id', product_file_id);
    expect(ntptEventTag).toHaveBeenCalledWith('ev=addProductToQueue');
    button.click();
    expect(ntptDropPair).toHaveBeenCalledWith('product_file_id', product_file_id);
    expect(ntptEventTag).toHaveBeenCalledWith('ev=removeProductFromQueue');
    var downloadLink = $('#product_profile ul.downloads a').get(0);
    $(downloadLink).click()
    expect(ntptLinkTag).toHaveBeenCalledWith($('#product_profile ul.downloads a').get(0));
    $('#product_profile').dialog('close');
  });

  // Spec 16.1.7
  it('16.1.7 - "Add all by type" events generate a PageTag event that records processing type', function() {
    var geofilter = SearchApp.searchParameters.getGeographicFilter();
    geofilter.set({'bbox': '-180,-90,180,90'});
    $('#filter_bbox').val('-180,-90,180,90');
    $('#filter_bbox').trigger('change');
    var searchButton = $('#triggerSearch');
    searchButton.click();
    ntptEventTag.reset();

    $('#toggleProcMenu').click();
    var button = $('#addProductsByType li:first button');
    button.click();
    expect(ntptAddPair).toHaveBeenCalledWith('processingType', button.attr('processing'));
    expect(ntptEventTag).toHaveBeenCalledWith('ev=selectAll');
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
    ntptEventTag.reset();
    var buttons = $('#login_dialog').dialog('option', 'buttons');
    buttons['Register']();
    $('#login_dialog').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=register');
  });

  // Spec 16.1.11
  it('16.1.11, 16.1.12 - Adding and removing items to the download queue from the search results generates a PageTag event', function() {
    var geofilter = SearchApp.searchParameters.getGeographicFilter();
    geofilter.set({'bbox': '-180,-90,180,90'});
    $('#filter_bbox').val('-180,-90,180,90');
    $('#filter_bbox').trigger('change');
    var searchButton = $('#triggerSearch');
    searchButton.click();
    ntptEventTag.reset();

    $('div.tool_enqueuer :first').click();
    var button = $('ul.granuleProductList li button').get(0);
    var product_file = $(button).attr('product_file_id');
    button.click();
    expect(ntptAddPair).toHaveBeenCalledWith('product_file_id', product_file);
    expect(ntptEventTag).toHaveBeenCalledWith('ev=addProductToQueue');
    button.click();
    expect(ntptDropPair).toHaveBeenCalledWith('product_file_id', product_file);
    expect(ntptEventTag).toHaveBeenCalledWith('ev=removeProductFromQueue');
  });

  // Spec 16.1.13
  it('16.1.13 - Clicking a bulk download type in the download queue modal generates a PageTag event', function() {
    var geofilter = SearchApp.searchParameters.getGeographicFilter();
    geofilter.set({'bbox': '-180,-90,180,90'});
    $('#filter_bbox').val('-180,-90,180,90');
    $('#filter_bbox').trigger('change');
    var searchButton = $('#triggerSearch');
    searchButton.click();
    $('div.tool_enqueuer :first').click();
    var button = $('ul.granuleProductList li button').get(0);
    var product_file = $(button).attr('product_file_id');
    button.click();
    ntptEventTag.reset();
    $('#queue_summary').click();
    //Disable form submitting for this test.
    $('#download_queue_form').submit(function() { return false; });
    $('#download_type_metalink').click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=downloadMetalink');
    $('#download_type_csv').click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=downloadCSV');
    $('#download_type_kml').click();
    expect(ntptEventTag).toHaveBeenCalledWith('ev=downloadKML');
    $('#download_queue').dialog('close');
  });

  // Spec 16.1.15
  it('16.1.15 - Clicking the "Feedback" button generates a PageTag event', function() {
    var feedbackButton = new FeedbackButton();
    $(feedbackButton.el).click();
    $('#feedbackForm').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=feedback');
  });

  // Spec 16.1.16
  it('16.1.16 - Clicking the "Send Feedback" button generates a PageTag event', function() {
    var feedbackButton = new FeedbackButton();
    $(feedbackButton.el).click();
    ntptEventTag.reset();
    var buttons = $('#feedbackForm').dialog('option', 'buttons');
    buttons['Send Feedback']();
    $('#feedbackForm').dialog('close');
    expect(ntptEventTag).toHaveBeenCalledWith('ev=submitFeedback');
  });

});

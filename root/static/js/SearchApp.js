$(function() {

  //******* In place until we update jquery ************//
  // Gets rid of deprecation warnings that pop up in the console.
  (function(){
    // remove layerX and layerY
    var all = $.event.props,
    len = all.length,
    res = [];
    while (len--) {
      var el = all[len];
      if (el != 'layerX' && el != 'layerY') res.push(el);
    }
    $.event.props = res;
    }()
  );
  ////////////////////

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

      this.searchParametersView = new SearchParametersView({
        'model': this.searchParameters,
        'el': $("#filters")
      });

      this.searchParametersView.render();
      this.downloadQueue = new DownloadQueue();
      this.downloadQueueView = new DownloadQueueView({
        'collection': this.downloadQueue,
        'el': $("#download_queue")
      });

      this.searchResultsView = new SearchResultsView({
        'postFilters': this.postFilters,
        'collection': this.searchResults,
        'el': $("#searchResults"),
        'model': this.user,
        'downloadQueue': this.downloadQueue
      });

      this.postFiltersView = new PostFiltersView({
        'searchResults': this.searchResults,
        'model': this.postFilters,
        'el': $("#platform_facets")
      });

      // Hack to ensure buttons look "off" after filtering/rendering clicks occur
      $('#platform_facets fieldset button').live('click', function() {
        $(this).removeClass("ui-state-focus");
      });

      this.searchResultsProcTool = new SearchResultsProcessingWidget({
        collection: this.searchResults
      });

      this.downloadQueueSummaryView = new DownloadQueueSummaryView({
        collection: this.downloadQueue,
        el: $("#queue_summary")
      });

      this.downloadQueueSummaryView.render();
      this.user.bind("authSuccess", this.downloadQueueSummaryView.render);
      this.user.bind("authError", this.downloadQueueSummaryView.render);
      this.user.bind("authRefresh", this.downloadQueueSummaryView.render);

      //TODO:move this
      $("#queue_summary").bind("click", this.downloadQueueView.render );

      this.downloadQueueSearchResultsView = new DownloadQueueSearchResultsView({
        'collection': this.downloadQueue
      });

      //TODO: move this
      this.downloadQueueSearchResultsView.setSearchResultsView(this.searchResultsView);

      this.downloadQueueMapView = new DownloadQueueMapView( {
        'collection': this.downloadQueue
      });
      //TODO: move this
      this.downloadQueueMapView.setSearchResultsView(this.searchResultsView);


      $('#resetSearch').button({
        icons: { primary: "ui-icon-refresh"},
        label: "Reset"
      })
      .bind("click",
      {
        sp: this.searchParameters,
        spv: this.searchParametersView,
        sr: this.searchResults,
        srv:this.searchResultsView,
        pf: this.postFilters
      }, jQuery.proxy(function(e) {
        if(typeof ntptEventTag == 'function') {
          ntptEventTag('ev=resetSearch');
        }
        e.data.sp.setDefaults();
        e.data.spv.setWidgets();
        e.data.spv.render();
        e.data.pf.reset();


        e.data.sr.data = {};
        e.data.sr.reset(); // can't be silent here, must be loud
        e.data.srv.render();

        e.data.sr.trigger('clear_results');
        e.data.srv.showBeforeSearchMessage();
        $("#triggerSearch").button('disable').focus();
        $("#con").html('');
        $("#con").html('<table id="searchResults" style="margin:20px 0px 20px 0px;"></table>');

      },
      this));


      this.searchButtonState = new SearchButtonState(); // defaults to searchState as opposed to stopSearchState
      this.searchButtonView = new SearchButtonView({
        "el": $("#triggerSearch"),
        "el2": $("#stopSearch"),
        "model": this.searchButtonState,
        "geographicFilter": this.searchParameters.getGeographicFilter(),
        "granuleFilter": this.searchParameters.getGranuleFilter()
      });

      this.geoFilter = this.searchParameters.getGeographicFilter();

      this.searchButtonView.toggleButton();
      this.searchResults.bind('refresh', jQuery.proxy(function(e) {
        this.searchButtonView.model.set({
          'state': 'searchButtonState'
        });
      },
      this));

      this.searchButtonView.render();

      //fire up the map
      initMap('searchMap');

      v = new FeedbackButton();
      v.render();

    }
  });

  window.SearchApp = new SearchAppView();
  setupPlaceholders();

  // Instead of using serialzeArray() we can use serializeJSON to return JSON formatted form data.
  $.fn.serializeJSON=function() {
    var json = {};
    jQuery.map($(this).serializeArray(), function(n, i){
      json[n['name']] = n['value'];
    });
    return json;
  };

});

var SearchResults = Backbone.Collection.extend(
  {
    url: AsfDataportalConfig.apiUrl,
    model: DataProduct,
    
    error: '',

    initialize: function() {

    },

    // build the nested model structure of DataProducts and DataProductFiles
    build: function(data) {
      this.trigger('build');
      // TODO: possible memory leak here, if the associated things aren't deallocated
      // when we reset this main collection.
      this.reset();
      var dp;
      this.add(data, {'silent': true});
    },

    filter: function() {
    },

    fetchSearchResults: function(searchURL, searchData, callback) {
      
	   var xhr = $.ajax(
        {
          type: "POST",
          url: searchURL,
          data: searchData,
          processData: true,
          dataType: "json",
          context: this,
          success: jQuery.proxy(function(data, textStatus, jqXHR) {
          if (callback != null) {
              callback(); // this is for using sinon spys in unit tests
           }
            this.filteredProductCount = undefined; // Reset filtered state
            this.unfilteredProductCount = data.length;

            this.build(data);

            this.trigger('refresh');
			    
        }, this),
        error: jQuery.proxy( function(jqXHR, textStatus, errorThrown) {
          switch(jqXHR.status) {
            // todo: move this gui code into the view objects
            case 204:
              SearchApp.searchResultsView.showNoResults();
			        this.trigger('clear_results');
              break;
            default:
              SearchApp.searchResultsView.showError(jqXHR);
			        this.trigger('clear_results');
          }
        }, this)
      });
		  
		return xhr;

    },
  }
);

var SearchResultsProcessingWidget = Backbone.View.extend(
{
  el: '#srProcLevelTool',
  initialize: function() {
    _.bindAll(this);
    this.collection.bind('refresh', this.render);
    this.collection.bind('add', this.render);
    this.collection.bind('remove', this.render);
    this.collection.bind('clear_results', this.clear_results);
    this.collection.bind('refreshProcTypes', this.render);
  },
  clear_results: function() {
		$(this.el).empty();
  },
  render: function() {
    $(this.el).empty();
    var w = $('<div/>').html( '<input type="checkbox" id="toggleProcMenu" /><label for="toggleProcMenu">Add all by type&hellip...</label>');
    w.find('#toggleProcMenu').button(
      {
        'label':'Add all by type&hellip;',
        'icons': {
          'secondary': 'ui-icon-triangle-1-s'
        }
      }
    ).click( function(e) {
      $('#addProductsByType').toggle('blind');
    });

    var m = $('<ul/>', { 'id':'addProductsByType', 'class':'ui-helper-reset ui-widget-content ui-corner-bottom', 'style':'width: 300px; display: none; position: absolute; z-index: 1000'});
    _.each( this.collection.procTypes, function( p, i, l ) {

      // Don't display browse images for download.
      if( 'BROWSE' == p ) { return; }

      var li = $('<li/>');
      var ab = $('<button/>', { 'processing':p }).button(
        {
          'label': processingTypes.get(p).get('display'),
          'icons': {
            'primary':'ui-icon-circle-plus'
          }
        }
      ).click( function(e) {
       
        var pl = $(this).attr('processing');

        if(typeof ntptEventTag == 'function') {
          ntptAddPair('processingType', pl);
          ntptEventTag('ev=selectAll');
        }

        var filesToAdd = [];
        _.each(SearchApp.searchResultsView.dataTable.fnGetFilteredData(),
          function(aProduct) {
            var file = null;
            file = _.find(aProduct.files, function(row) {
              if(pl === row.processingType) {
                return(true);
              }
              return(false);
            });
            if(file) {
              filesToAdd.push(file);
            }
          });
        _.each(filesToAdd, function(row) {
          SearchApp.downloadQueue.remove(row.product_file_id, {'silent':true});
        });
        SearchApp.downloadQueue.add(filesToAdd, {'silent':true} );
        SearchApp.downloadQueue.trigger('add');
      }
      );
      m.append( li.append( ab ) );
    }, this);
    $(this.el).append(w).append(m);
    return this;
  },
});

var SearchResultsView = Backbone.View.extend(
{

  dataTable: null,
  hasRendered: false,
  initialize: function() {
    _.bindAll(this);
    // Observe changes to this collection
    this.collection.bind('refresh', this.render);
    this.collection.bind('add', this.render);
    this.collection.bind('remove', this.render);
    this.default_tile_opacity=0.2;
    this.model.bind('authSuccess', jQuery.proxy(function() {
      this.render('authSuccess');
    },this));
    this.mapBounds = new google.maps.LatLngBounds();

    // Observe changes to the post-filters
    this.options.postFilters.bind('change', this.render);
    this.options.postFilters.bind('refreshMap', this.refreshMap);

    this.showBeforeSearchMessage();
    this.dtCellTemplate = _.template('\
      <img class="lazy-thumbnail" data-original="<%= thumbnail %>" title="<%= granuleName %>" src="static/images/grey.gif" />\
      <% if("ALOS" === platform) { %>\
        <h4 title="<%= beamModeDesc %>"><%= platform %> PALSAR\
          <span class="beam"><%= beamModeType %></span>\
          <span class="date"><%= acquisitionDateText %></span>\
        </h4>\
        <p>Frame <%= frameNumber %>, Path <%= pathNumber %></p>\
        <p>Off-Nadir <%= offNadirAngle %>&deg;</p>\
      <% } else if("UAVSAR" == platform) { %>\
        <h4 title="<%= beamModeDesc %>"><%= platform %> \
          <span class="beam"><%= beamModeType %></span>\
          <span class="date"><%= acquisitionDateText %></span>\
        </h4>\
        <p><%= missionName %></p>\
      <% } else { %>\
        <h4 title="<%= beamModeDesc %>"><%= platform %> \
          <span class="beam"><%= beamModeType %></span>\
          <span class="date"><%= acquisitionDateText %></span>\
        </h4>\
        <p>Frame <%= frameNumber %>, Orbit <%= orbit %></p>\
      <% } %>\
      <div class="productRowTools">\
      <button title="More information&hellip;" role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only">\
      <span class="ui-button-icon-primary ui-icon ui-icon-help"></span>\
      <span class="ui-button-text">More information&hellip;</span>\
      </button>\
      <div title="Show files&hellip;" onclick="window.showInlineProductFiles(event, \'<%= id %>\'); return false;" class="tool_enqueuer ui-button ui-widget ui-state-default ui-corner-all ui-button-icons-only queue_toggler" product_id="<%= id %>">\
      <span class="ui-button-icon-primary ui-icon ui-icon-circle-plus"></span>\
      <span class="ui-button-text">Show files&hellip;</span>\
      <span class="ui-button-icon-secondary ui-icon ui-icon-triangle-1-s"></span>\
      </div>\
      </div>\
      <div style="clear:both;"></div>\
    ');
  },

  showBeforeSearchMessage: function() {
    $('#async-spinner').hide();
    $('#searchResults').hide();
    $('#platform_facets').hide();
    $("#error-message").hide();
    $("#results-banner").hide();
    $('#before-search-msg').show();
  },

  showResults: function() {
    $('#before-search-msg').hide();
    $('#async-spinner').hide();
    $('#searchResults').show();
    $('#platform_facets').show();
    $("#error-message").hide();
    $("#results-banner").hide();
    $('#srProcLevelTool').show(); 
  },

  showSearching: function() {
    $('#before-search-msg').hide();
    $('#async-spinner').show();
    $("#results-banner").hide();
    $('#searchResults').hide();
    $("#error-message").hide();
    $('#platform_facets').hide();
    this.clearOverlays();
    $('#srProcLevelTool').hide();
  },

  showError: function(jqXHR) {
    $('#srProcLevelTool').hide();
    $('#before-search-msg').hide();
    $("#async-spinner").hide();
    $("#results-banner").hide();
    $("#error-message").show();

    var errorText;
    switch( jqXHR.status ) {
      case '400': errorText = 'Some search fields were missing or invalid, and your search could not be completed.';
        break;
      case '500': errorText = 'An error occurred on the server and your search could not be completed.';
        break;
      default: errorText = 'Your search could not be completed due to an unhandled error condition (#' + jqXHR.status +').  You can try reloading this page and trying your search again.';
        break;
    }
    $("#error-message-text").text(errorText);
    $('#platform_facets').hide();
  },

  showNoResults: function() {
    $('#before-search-msg').hide();
    $("#async-spinner").hide();
    $("#results-banner").show();
    $("#error-message").hide();
    $("#platform_facet").hide();
    $('#platform_facets').hide();
    
    this.clearOverlays();
  },

  render: function(args) {
    this.trigger('render');
    this.dataTable = null;

	// Do not show no results message if we're logging in. 
    if( 0 == this.collection.length) {
      this.clearOverlays();
      if (args != "authSuccess") {
      	this.showNoResults();
  	  }
      return this;
    }
    this.dataTable = $('#searchResults').dataTable({ 
      'aaData': this.collection.toJSON(),
      'aoColumnDefs': [
          { 'fnRender': this.dtCell, 'aTargets': [0] }
      ],
      "oLanguage": {
        "sSearch": "Find",
        "sProcessing": "Processing..."
      },
      "bProcessing": true,
      "bAutoWidth": false,
      "bDestroy": true,
      "sScrollY": "500px",
      "iDisplayLength": 1000,
      "bLengthChange": false ,
      "fnPreDrawCallback": this.clearOverlays,
      "fnDrawCallback": jQuery.proxy(this.dtDrawCallback, this),
      "fnRowCallback": jQuery.proxy(this.dtRowCallback, this),
      "bDeferRender": true,
      'sDom': 'f<"top"pi>rt<"clear">'
    });
    this.showResults();

    SearchApp.dataTable = this.dataTable;
    this.trigger('render:finish');
    return this;
  },

  dtCell: function(row) {
    return(this.dtCellTemplate(row.aData));
  },

  dtDrawCallback: function(oSettings) {
    this.setMapBounds();
    $('.productRow').on('mouseenter', this.toggleHighlight );
    $('.productRow').on('mouseleave', this.removeHighlight );
    $('img.lazy-thumbnail').lazyload({
      'container': $('div.dataTables_scrollBody')
    });
    var a = []
    _.each(oSettings.aiDisplay, function(val, key) {
      a = _.union(_.pluck(oSettings.aoData[val]._aData.files,
        'processingType'), a);
    });
    this.collection.procTypes = a;
    this.collection.trigger('refreshProcTypes');
  },

  dtRowCallback: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
    $(nRow).attr('id', 'result_row_' + aData.id);
    $(nRow).attr('product_id', aData.id);
    $(nRow).addClass('productRow');
    $(nRow).attr('onclick', 'window.showProductProfile(\''+aData.id+'\'); return false;');
    this.renderOnMap(aData);
    return(nRow);
  },

  renderOnMap: function(aData) {

    var p1 = new google.maps.LatLng(aData.nearStartLat, aData.nearStartLon);
    var p2 = new google.maps.LatLng(aData.farStartLat, aData.farStartLon);
    var p3 = new google.maps.LatLng(aData.farEndLat, aData.farEndLon);
    var p4 = new google.maps.LatLng(aData.nearEndLat, aData.nearEndLon);
    
    var polyOptions = _.clone(this.polygonDefault);
    polyOptions.paths = [p1, p2, p3, p4];

    this.mo[aData.id] = new google.maps.Polygon(polyOptions);
    this.mo[aData.id].setMap(searchMap);
    this.mapBounds.extend(p1);
    this.mapBounds.extend(p2);
    this.mapBounds.extend(p3);
    this.mapBounds.extend(p4);
  },

  setMapBounds: function(oSettings) {
    searchMap.fitBounds(this.mapBounds);
  },

  clearOverlays: function() {

    if(this.activePoly) {
      this.mo[this.activePoly].setOptions({
        fillColor: '#777777',
        fillOpacity: this.default_tile_opacity,
        strokeColor: '#333333',
        strokeOpacity: 1,
        zIndex: 1000
      });
    }

    _.each(this.mo, function(e) {
      e.setMap(null);
    });
    this.mo = {}; 
    this.activePoly = null;
    this.mapBounds = new google.maps.LatLngBounds();
  },
  refreshMap: function() {
    this.clearOverlays();
    this.renderOnMap();
  },
  polygonDefault: {
    fillColor: '#777777',
    fillOpacity: this.default_tile_opacity,
    strokeColor: '#333333',
    strokeOpacity: 1,
    strokeWeight: 2,
    zIndex: 1000,
    clickable: true
  },
  polygonInQueue: {
    fillColor: '#77aaFF',
    fillOpacity: 0.5,
    strokeColor: '#336699',
    strokeOpacity: 0.5,
    zIndex: 10001 // just above the search area bbox zindex
  },
  polygonHighlight: {
    fillColor: '#FFFFB4',
    fillOpacity: .75,
    strokeColor: '#FFFF00',
    strokeOpacity: 1,
    zIndex: 1500
  },
  removeHighlight: function(e) {
    // switch back to 'selected' or 'inactive' state depending on if it's in the DQ or not
    if ( -1 != _.indexOf( SearchApp.downloadQueue.pluck('granuleName'), $(e.currentTarget).attr("product_id") )) {
      // It's in the DQ, turn it blue again  
      this.mo[this.activePoly].setOptions(this.polygonInQueue);
    } else {
      this.mo[this.activePoly].setOptions(this.polygonDefault);
    }
  },

  toggleHighlight: function(e) {
    this.activePoly = $(e.currentTarget).attr("product_id");
    this.mo[this.activePoly].setOptions(this.polygonHighlight);
   },
  // use this array for clearing the overlays from the map when the results change(?)
  // also for highlighting by changing the fillColor, strokeColor, etc.
  // Only contains the rows that are currently being displayed in the datatable.
  mo: {},
  // the currently active/hightlighted polygon
  activePoly: null
}
);

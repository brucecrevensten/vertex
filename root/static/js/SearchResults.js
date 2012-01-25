var SearchResults = Backbone.Collection.extend(
  {
    url: AsfDataportalConfig.apiUrl,
    model: DataProduct,

    // platforms found in result set list
    platforms: [], 
    error: '',

    initialize: function() {

    },

/*    clearAllPoly: function(map) {
        for (var i=0; i< this.models.length; i++) {
          if (map[this.models[i].id]) {
            this.
          }
        
        } 
                                  if (this.mo[d.id]) {
                                    this.mo[d.id].setMap(null); 
                                  }
                                 },this) 
                               ); 
    },*/

    // build the nested model structure of DataProducts and DataProductFiles
    build: function(data) {
      this.trigger('build');
      // TODO: possible memory leak here, if the associated things aren't deallocated
      // when we reset this main collection.
      this.reset();
      var dp;
      var start = new Date().getTime();
      this.add(data, {'silent': true});
      var end = new Date().getTime();		
      console.log('Build loop: ' + (end - start));
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
            this.unfilteredProductCount = _.uniq( _.pluck( data, 'GRANULENAME' )).length;

            // Fetch distinct platforms that were found
            this.platforms = _.uniq(_.pluck(data, 'PLATFORM'));
            this.procTypes = _.uniq(_.pluck(data, 'PROCESSINGTYPE'));
      
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
  },
  clear_results: function() {
		$(this.el).empty();
		$("#srCount").empty();
  },
  render: function() {
  /*
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
        SearchApp.searchResults.each(
          function(aProduct)
            {   
              filesToAdd.push( aProduct.files.select( 
                function(aFile)
                  { 
                    return aFile.get('processingType') == pl;
                  }
                )
              );
            }
          );
        SearchApp.downloadQueue.add( _.union(filesToAdd), {'silent':true} ); // suspend extra flashes of queue button
        SearchApp.downloadQueue.trigger('add');
      }
      );
      m.append( li.append( ab ) );
    }, this);
    $(this.el).append(w).append(m);
    return this;
  */
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
      <img title="<%= GRANULENAME %>" src="<%= THUMBNAIL %>" />\
      <% if("ALOS" === PLATFORM) { %>\
        <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> PALSAR\
          <span class="beam"><%= BEAMMODETYPE %></span>\
          <span class="date"><%= acquisitionDateText %></span>\
        <\h4>\
        <p>Frame <%= FRAMENUMBER %>, Path <%= PATHNUMBER %></p>\
        <p>Off-Nadir <%= OFFNADIRANGLE %>&deg;</p>\
      <% } else if("UAVSAR" == PLATFORM) { %>\
        <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> \
          <span class="beam"><%= BEAMMODETYPE %></span>\
          <span class="date"><%= acquisitionDateText %></span>\
        <\h4>\
        <p><%= MISSIONNAME %></p>\
      <% } else { %>\
        <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> \
          <span class="beam"><%= BEAMMODETYPE %></span>\
          <span class="date"><%= acquisitionDateText %></span>\
        <\h4>\
        <p>Frame <%= FRAMENUMBER %>, Path <%= ORBIT %></p>\
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
    $('#active-filters').hide();
  },

  showResults: function() {
    $('#before-search-msg').hide();
    $('#async-spinner').hide();
    $('#searchResults').show();
    $('#platform_facets').show();
    $("#error-message").hide();
    $("#results-banner").hide();
    $('#active-filters').show();
    $('#srCount').show();
    $('#srProcLevelTool').show(); 
  },

  showSearching: function() {
    $('#before-search-msg').hide();
    $('#async-spinner').show();
    $("#results-banner").hide();
    $('#searchResults').hide();
    $("#error-message").hide();
    $('#platform_facets').hide();
    $('#srCount').hide();
    this.clearOverlays();
    $('#active-filters').show();
    $('#srProcLevelTool').hide();
  },

  showError: function(jqXHR) {
    $('#active-filters').show();
    $('#srCount').hide();
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
    $('#active-filters').show();
    $('#srCount').hide();
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

    // Enhance the table using a DataTable object. 
    start = new Date().getTime();		
     this.dataTable = $('#searchResults').dataTable(
      { 
        'aaData': this.collection.toJSON(),
        'aoColumnDefs': [
          { 'fnRender': this.dtCell, 'aTargets': [0], 'sClass': 'productRow' },
        ],
           "oLanguage": {
            "sSearch": "Find",
            "sProcessing": "Processing..."
           },
          "bProcessing": true,
          "bAutoWidth": true,
          "bDestroy": true,     // destroy old table
          "sScrollY": "500px",
          "iDisplayLength": 1000, // default number of rows per page
          "bLengthChange": false ,// do not allow users to change the default page length
          "fnPreDrawCallback": this.clearOverlays,
          "fnDrawCallback": this.setMapBounds,
          "fnRowCallback": jQuery.proxy(function(nRow, aData, iDisplayIndex, iDisplayIndexFull ) { 
          $(nRow).attr('id', 'result_row_' + aData.id);
          $(nRow).attr('product_id', aData.id);
          $(nRow).attr('onclick', 'window.showProductProfile(\''+aData.id+'\'); return false;');
          this.renderOnMap(aData);
          return(nRow);
          }, this),
          "bDeferRender": true
    });
    end = new Date().getTime();		
    console.log('build datatable: ' + (end - start));

    SearchApp.dataTable = this.dataTable;

    $('.productRow').live('mouseenter', { view: this }, this.toggleHighlight );
    $('.productRow').live('mouseleave', { view: this }, this.removeHighlight );


    this.showResults();
    //this.clearOverlays();
    //this.renderOnMap();
    //this.resetHeight();

   

    if ( true == _.isUndefined( this.collection.filteredProductCount ) || ( this.collection.filteredProductCount == this.collection.unfilteredProductCount )) {
      $("#srCount").empty().html(_.template("<%= total %> results found",
        { 'total' : this.collection.unfilteredProductCount }
      )); 
    } else {
      $("#srCount").empty().html(_.template("<span><%= filtered %> filtered from</span> <%= total %> results",
        { 
          'total' : this.collection.unfilteredProductCount,
          'filtered' : this.collection.filteredProductCount
        }
      ));
    
    }
    this.trigger('render:finish');
    return this;

  },

  dtCell: function(row) {
    return(this.dtCellTemplate(row.aData));
  },

  resetHeight: function() {
    // 580 = maximum possible height of the search results, before
    // other dynamic page elements are rendered.
    $(this.el).height( 575 - ( $('#active-filters').outerHeight() + 31 )); // 31px = fixed height of ProcTypeButton
  },

  renderOnMap: function(aData) {
    
    var p1 = new google.maps.LatLng(aData.NEARSTARTLAT, aData.NEARSTARTLON);
    var p2 = new google.maps.LatLng(aData.FARSTARTLAT, aData.FARSTARTLON);
    var p3 = new google.maps.LatLng(aData.FARENDLAT, aData.FARENDLON);
    var p4 = new google.maps.LatLng(aData.NEARENDLAT, aData.NEARENDLON);

    this.mo[aData.id] = new google.maps.Polygon({
      paths: new Array(p1, p2, p3, p4),
      fillColor: '#777777',
      fillOpacity: this.default_tile_opacity,
      strokeColor: '#333333',
      strokeOpacity: 1,
      strokeWeight: 2,
      zIndex: 1000,
      clickable: true
    });
    this.mo[ aData.id ].setMap(searchMap);
    this.mapBounds.extend(p1);
    this.mapBounds.extend(p2);
    this.mapBounds.extend(p3);
    this.mapBounds.extend(p4);
  },

  setMapBounds: function(oSettings) {
    searchMap.fitBounds(this.mapBounds);
  },

  clearOverlays: function() {

    if( this.activePoly ) {
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
  removeHighlight: function(e) {
    // switch back to 'selected' or 'inactive' state depending on if it's in the DQ or not
    if ( -1 != _.indexOf( e.view.SearchApp.downloadQueue.pluck('productId'), $(e.currentTarget).attr("product_id") )) {
      // It's in the DQ, turn it blue again  
      e.view.SearchApp.searchResultsView.mo[e.view.SearchApp.searchResultsView.activePoly].setOptions({
        fillColor: '#77aaFF',
        fillOpacity: 0.5,
        strokeColor: '#336699',
        strokeOpacity: 0.5,
        zIndex: 10001 // just above the search area bbox zindex
      });
    } else {
      e.view.SearchApp.searchResultsView.mo[e.view.SearchApp.searchResultsView.activePoly].setOptions({
        fillColor: '#777777',
        fillOpacity: this.default_tile_opacity,
        strokeColor: '#333333',
        strokeOpacity: 1,
        zIndex: 1000
      });
    }
  
  },

  toggleHighlight: function(e) {

    if( e.view.SearchApp.searchResultsView.activePoly ) {
      // switch back to 'selected' or 'inactive' state depending on if it's in the DQ or not
      if ( -1 != _.indexOf( e.view.SearchApp.downloadQueue.pluck('productId'), e.view.SearchApp.searchResultsView.activePoly )) {
        // It's in the DQ, turn it blue again  
        e.view.SearchApp.searchResultsView.mo[e.view.SearchApp.searchResultsView.activePoly].setOptions({
          fillColor: '#77aaFF',
          fillOpacity: 0.5,
          strokeColor: '#336699',
          strokeOpacity: 0.5,
          zIndex: 1500
        });
      } else {
        e.view.SearchApp.searchResultsView.mo[e.view.SearchApp.searchResultsView.activePoly].setOptions({
          fillColor: '#777777',
          fillOpacity: this.default_tile_opacity,
          strokeColor: '#333333',
          strokeOpacity: 1,
          zIndex: 1000
        });
      }
    }

    e.view.SearchApp.searchResultsView.activePoly = $(e.currentTarget).attr("product_id");

    e.view.SearchApp.searchResultsView.mo[e.view.SearchApp.searchResultsView.activePoly].setOptions({
      fillColor: '#FFFFB4',
      fillOpacity: .75,
      strokeColor: '#FFFF00',
      strokeOpacity: 1,
      zIndex: 1500
    });

   },
  // use this array for clearing the overlays from the map when the results change(?)
  // also for highlighting by changing the fillColor, strokeColor, etc.
  // (this array is 1:1 with the results, so overlay [0] here is product [0] in the results)
  mo: {},
  // the currently active/hightlighted polygon
  activePoly: null
}
);

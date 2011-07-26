var SearchResults = Backbone.Collection.extend(
  {
    url: AsfDataportalConfig.apiUrl,
    model: DataProduct,

    // platforms found in result set list
    platforms: [], 
    error: '',

    initialize: function() {},

    // build the nested model structure of DataProducts and DataProductFiles
    build: function(data) {

      // TODO: possible memory leak here, if the associated things aren't deallocated
      // when we reset this main collection.

      this.reset();
      var dp;

      for ( var i in data ) {
        // Munge this data to get a local true ID (granule name)
        data[i].id = data[i].GRANULENAME;
        
        // Create the DataProduct if it doesn't already exist
        dp = this.get( data[i].id );
        if( _.isUndefined(dp) ) {
          this.add( data[i], { 'silent' : true} );
          dp = this.get( data[i].id );
        }

        // Create the DataProductFile, add to the collection in the DataProduct
        dp.files.add( {
          thumbnail: data[i].THUMBNAIL,
          productId: data[i].GRANULENAME,
          id: data[i].ID,
          processingType: data[i].PROCESSINGTYPE,
          processingTypeDisplay: data[i].PROCESSINGTYPEDISPLAY,
          processingLevel: data[i].PROCESSINGLEVEL,
          processingDescription: data[i].PROCESSINGDESCRIPTION,
          url: data[i].URL,
          platform: data[i].PLATFORM,
          acquisitionDate: data[i].ACQUISITIONDATE,
          bytes: data[i].BYTES,
          sizeText: AsfUtility.bytesToString(data[i].BYTES),
          md5sum: data[i].MD5SUM,
          filename: data[i].FILENAME
        });
      }
    },

    filter: function() {
      var d = this.postFilters.applyFilters( this.data );
      this.build( d );
    },

    fetchSearchResults: function() {

      this.data = {}; // flush previous result set

      var results = $.ajax(
        {
          type: "GET",
          url: this.url,
          data: this.searchParameters.toJSON(),
          processData: true,
          dataType: "jsonp",
          context: this,
          success: function(data, textStatus, jqXHR) {
            this.data = data.results.rows.ROW;

            // Fetch distinct platforms that were found
            this.platforms = _.uniq( _.pluck( this.data, 'PLATFORM') );
            this.procTypes = _.uniq( _.pluck( this.data, 'PROCESSINGTYPE') );
      
            this.build(this.data);
            this.trigger('refresh');

        },
        error: function(jqXHR, textStatus, errorThrown) {
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
        }
      }).results;

    }
  }
);

var SearchResultsProcessingWidget = Backbone.View.extend(
{
  el: '#srProcLevelTool',
  initialize: function() {
    _.bindAll(this);
    this.collection.bind('all', function(e) { console.log('SearchResultsProcessingWidget observed collectionEvent='+e); } );
    this.collection.bind('refresh', this.render);
    this.collection.bind('add', this.render);
    this.collection.bind('remove', this.render);
    this.collection.bind('clear_results', this.clear_results);
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

    var m = $('<ul/>', { 'id':'addProductsByType', 'class':'ui-helper-reset ui-widget-content ui-corner-bottom', 'style':'display: none;'});
    _.each( this.collection.procTypes, function( p, i, l ) {
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
        SearchApp.downloadQueue.trigger('add'); // manually trigger to get one flash effect
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
    _.bindAll(this, "render");
    
    // Observe changes to this collection
    this.collection.bind('refresh', this.render);
    this.collection.bind('add', this.render);
    this.collection.bind('remove', this.render);
    this.collection.bind('all', function(e) { console.log('SearchResultsView observed collectionEvent='+e); } );

    
    // Observe changes to the post-filters
    this.options.postFilters.bind('change', this.render);
    this.options.postFilters.bind('all', function(e) { console.log('SearchResultsView observed postFiltersEvent='+e); } );

    _.each( this.postFilters, function(e, i, l) {
      e.bind('change', this.render);
      e.bind('all', function(e) { console.log('SearchResultsView observed postFilterInstanceEvent='+e); } );

    }, this);
    
    this.showBeforeSearchMessage();
  },

  renderLength: function() {
    return _.template('<h3><%= length %> results found</h3>', this.collection);
  },

  events: {
	   'authSuccess':'render'
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

  },

  showSearching: function() {
	$('#before-search-msg').hide();
    $('#async-spinner').show();
    $("#results-banner").hide();
    $('#searchResults').hide();
    $("#error-message").hide();
    $('#platform_facets').hide();
    this.clearOverlays();
      $('#active-filters').show();

  },

  showError: function(jqXHR) {
          $('#active-filters').show();

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

	$('#before-search-msg').hide();
    $("#async-spinner").hide();
    $("#results-banner").show();
    $("#error-message").hide();
    $("#platform_facet").hide();
    $('#platform_facets').hide();
    this.clearOverlays();
  },
  getPlatformRowTemplate: function( p ) {
    switch(p) {
      case 'ALOS':
        return '\
  <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %>-PALSAR <span class="beam"><%= BEAMMODETYPE %></span><span class="date"><%= acquisitionDateText %></span></h4>\
  <p>Frame <%= FRAMENUMBER %>, Path <%= PATHNUMBER %></p>\
  <p>Off-Nadir <%= OFFNADIRANGLE %>&deg;</p>\
';
        break;
      case 'UAVSAR':
        return '\
  <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> <span class="beam"><%= BEAMMODETYPE %></span><span class="date"><%= acquisitionDateText %></span></h4>\
  <p><%= MISSIONNAME %> <%= GRANULENAME %></p>\
';
        break;
      default: return '\
  <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> <span class="beam"><%= BEAMMODETYPE %></span><span class="date"><%= acquisitionDateText %></span></h4>\
  <p>Frame <%= FRAMENUMBER %>, Orbit <%= ORBIT %></p>\
';
    }
  },
  render: function() {

    $(this.el).empty();
    if( 0 == this.collection.length ) {
      this.clearOverlays();
      this.showNoResults();
      return this;
    }

    var ur = SearchApp.user.getWidgetRenderer();
    this.collection.each( function( e, i, l ) {
     
      var d = e.toJSON();
      d['acquisitionDateText'] = $.datepicker.formatDate( 'yy-mm-dd', $.datepicker.parseDate('yy-mm-dd', d.ACQUISITIONDATE));
      var li = jQuery('<li/>', {'class':'productRow'}).attr('product_id', d.id);
      li.append( ur.srThumbnail( e ));
      li.append( _.template( this.getPlatformRowTemplate( d.PLATFORM) , d ) );
      li.find('img').error( function() { $(this).remove(); });
      var b = $('<div/>', { 'class':'productRowTools' }
      ).append( $('<button>More information&hellip;</button>').button( { 'text':false, 'icons':{'primary':'ui-icon-help'}}));
      
      var k = $('<div/>', { 'class':'tool_enqueuer' }
      ).html( 
        _.template('\
<input type="checkbox" id="<%= id %>_queue_toggler" /><label for="<%= id %>_queue_toggler">&nbsp;</label>\
', { id: d.id }
        )
      ).button( 
        { 
          'text':false,
          'icons':
            {
              'primary':'ui-icon-circle-plus',
              'secondary':'ui-icon-triangle-1-s'
            }
        }
      ).bind('click', { 'd':d }, function(e) {
        if( true != _.isUndefined( SearchApp.searchResultsView.currentProduct )) {
          if( e.data.d.id != SearchApp.searchResultsView.currentProduct ) {
            $('#'+SearchApp.searchResultsView.currentProduct+'_queue_toggler').click();
          } 
        }
        if( e.data.d.id == SearchApp.searchResultsView.currentProduct ) {
          SearchApp.searchResultsView.currentProduct = undefined;
        } else {
          SearchApp.searchResultsView.currentProduct = e.data.d.id;
        }
        $('#gpl_'+e.data.d.id).toggle();
        e.stopPropagation();
      });

      b.append(k);
      
      var c = $('<ul/>', { 'style':'display:none', 'class':'granuleProductList', 'id':'gpl_'+d.id } );

      //TODO: refactor this into DataProductFile view/model/something
      e.files.each( function( q, w, r ) {
        
        // skip if BROWSE
        if( 'BROWSE' == q.get('processingType')) { return; }

        var lit = $('<li/>');
        var btn = $('<button>Add to queue...</button>', {
          'class': 'tool_enqueuer',
          'title': 'Add to download queue'
        }).attr('product_id', q.get('productId'));
        btn.attr('product_file_id', q.id);
		    btn.attr('id', "b_"+q.id);
        btn.click( function(e2) {
            e2.stopPropagation();
            if ( $(this).prop('disabled') == 'disabled' ) { return false; }
            if ( $(this).prop('selected') == 'selected' ) {
              $(this).toggleClass('tool-dequeue');
              $(this).prop('selected','false');
              SearchApp.downloadQueue.remove( SearchApp.searchResults.get( $(this).attr('product_id') ).files.get( $(this).attr('product_file_id') ));
              $(this).button( "option", "icons", { primary: "ui-icon-circle-plus" } );
            } else {
              $(this).toggleClass('tool-dequeue');
              $(this).prop('selected','selected');
              SearchApp.downloadQueue.add( SearchApp.searchResults.get( $(this).attr('product_id')).files.get( $(this).attr('product_file_id')) );
              $(this).button( "option", "icons", { primary: "ui-icon-circle-minus" } );
            }
          }
          ).button(
            {
              'label': q.get('processingTypeDisplay') + ' (' + q.get('sizeText') + ')',
              'icons': {
                'primary':'ui-icon-circle-plus'
              }
            }
          );
          lit.append(btn);
          c.append(lit);
    
    });

      li.append(b);
      li.append(c);
      li.append('<div style="clear: both"></div>');

      v = new DataProductView( { model: e } );
      li.bind( "click", { id: e.id, view: v }, function(e) {
		 $("#product_profile").empty();
        $("#product_profile").html( e.data.view.render().el );
        $("#product_profile").dialog(
          {
            modal: true,
            width: 'auto',
			minWidth: 400,
            draggable: false,
            resizable: false,
            title: e.data.id,
            position: "center"
          }
        );
      });

      $(this.el).append(li);

    }, this); // end iteration over collection

    $('#searchResults li.productRow').live('mouseenter', { view: this }, this.toggleHighlight );
    $('#searchResults li.productRow').live('mouseleave', { view: this }, this.removeHighlight );

    this.showResults();
    this.clearOverlays();
    this.renderOnMap();
    
    return this;

  },

  renderOnMap: function() {

    e = this.collection.at(0).toJSON();
    this.leastLat = Math.min( e.NEARSTARTLAT, e.FARSTARTLAT, e.FARENDLAT, e.NEARENDLAT );
    this.mostLat = Math.max( e.NEARSTARTLAT, e.FARSTARTLAT, e.FARENDLAT, e.NEARENDLAT );
    this.leastLon = Math.min( e.NEARSTARTLON, e.FARSTARTLON, e.FARENDLON, e.NEARENDLON );
    this.mostLon = Math.max( e.NEARSTARTLON, e.FARSTARTLON, e.FARENDLON, e.NEARENDLON );

    this.collection.each( function( dp, i, l ) {

        e = dp.toJSON();

        this.leastLat = Math.min( this.leastLat, e.NEARSTARTLAT, e.FARSTARTLAT, e.FARENDLAT, e.NEARENDLAT );
        this.mostLat = Math.max( this.mostLat, e.NEARSTARTLAT, e.FARSTARTLAT, e.FARENDLAT, e.NEARENDLAT );
        this.leastLon = Math.min( this.leastLon, e.NEARSTARTLON, e.FARSTARTLON, e.FARENDLON, e.NEARENDLON );
        this.mostLon = Math.max( this.mostLon, e.NEARSTARTLON, e.FARSTARTLON, e.FARENDLON, e.NEARENDLON );

        this.mo[ e.id ] = new google.maps.Polygon({
            paths: new Array(
              new google.maps.LatLng(e.NEARSTARTLAT, e.NEARSTARTLON),
              new google.maps.LatLng(e.FARSTARTLAT, e.FARSTARTLON),
              new google.maps.LatLng(e.FARENDLAT, e.FARENDLON),
              new google.maps.LatLng(e.NEARENDLAT, e.NEARENDLON)
            ),
            fillColor: '#777777',
            fillOpacity: 0.25,
            strokeColor: '#333333',
            strokeOpacity: 0.5,
            strokeWeight: 2,
            zIndex: 1000 + i,
            clickable: true
          });
        this.mo[ e.id ].setMap(searchMap);


    }, this);

    searchMap.fitBounds( new google.maps.LatLngBounds(
      new google.maps.LatLng( this.leastLat, this.leastLon ),
      new google.maps.LatLng( this.mostLat, this.mostLon )
    ));
    
  },
  clearOverlays: function() {

    if( this.activePoly ) {
      this.mo[this.activePoly].setOptions({
        fillColor: '#777777',
        fillOpacity: 0.25,
        strokeColor: '#333333',
        strokeOpacity: 0.5,
        zIndex: 1000
      });
    }

    _.each(this.mo, function(e) {
      e.setMap(null);
    });
    this.mo = {}; 
    this.activePoly = null;

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
        zIndex: 1500
      });
    } else {
      e.view.SearchApp.searchResultsView.mo[e.view.SearchApp.searchResultsView.activePoly].setOptions({
        fillColor: '#777777',
        fillOpacity: 0.25,
        strokeColor: '#333333',
        strokeOpacity: 0.5,
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
          fillOpacity: 0.25,
          strokeColor: '#333333',
          strokeOpacity: 0.5,
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
      zIndex: 10000
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


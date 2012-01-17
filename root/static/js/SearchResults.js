var SearchResults = Backbone.Collection.extend({
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
  },

  fetchSearchResults: function(searchURL, searchData, callback) {

    this.data = {}; // flush previous result set

    var xhr = $.ajax({
      type: "POST",
      url: searchURL,
      data: searchData,
      processData: true,
      dataType: "json",
      context: this,
      success: jQuery.proxy(function(data, textStatus, jqXHR) {
        if ( ! _.isNull(callback) ) {
          callback(); // this is for using sinon spys in unit tests
        }
        this.data = data;

        this.filteredProductCount = undefined; // Reset filtered state
        this.unfilteredProductCount = _.uniq( _.pluck( this.data, 'GRANULENAME' )).length;

        // Fetch distinct platforms that were found
        this.platforms = _.uniq( _.pluck( this.data, 'PLATFORM') );
        this.procTypes = _.uniq( _.pluck( this.data, 'PROCESSINGTYPE') );

        this.build(this.data);

        this.trigger('refresh');

        }, this
      ),
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
        }, this
      )
    });

    return xhr;

  },

  comparator: function(m) {
    var retval = 0;
    var platform = m.get('PLATFORM');
    var beam = m.get('BEAMMODETYPE');
    var offnadir = m.get('OFFNADIRANGLE');
    var acqdate = m.get('ACQUISITIONDATE');
    acqdate = 90000000 - acqdate.replace(/^(\d\d\d\d)-(\d\d)-(\d\d).+/, "$1$2$3");
    var platvals = {
      'UAVSAR':     100000000000,
      'ALOS':       200000000000,
      'RADARSAT-1': 300000000000,
      'ERS-1':      400000000000,
      'ERS-2':      500000000000,
      'JERS-1':     600000000000
    };
    var beamvals = {
      'UAVSAR':     {
        'PolSAR':  {
          'NA': 100000000
        }
      },
      'ALOS':       {
        'FBS':  {
          '21.5': 100000000,
          '34.3': 200000000,
          '41.5': 300000000,
          '50.8': 400000000,
          'NA': 600000000
        },
        'FBD':  {
          '34.3': 700000000,
          'NA': 800000000
        },
        'PLR':  {
          '21.5': 900000000,
          '23.1': 1000000000,
          'NA': 1100000000
        },
        'WB1':  {
          '24.6': 1200000000,
          '25.9': 1300000000,
          '27.1': 1400000000,
          'NA': 1500000000
        },
        'WB2':  {
          '27.1': 1600000000,
          'NA': 1700000000
        }
      },
      'RADARSAT-1': {
        'EH3':  {
          'NA': 100000000
        },
        'EH4':  {
          'NA': 200000000
        },
        'EH6':  {
          'NA': 300000000
        },
        'EL1':  {
          'NA': 400000000
        },
        'FN1':  {
          'NA': 500000000
        },
        'FN2':  {
          'NA': 600000000
        },
        'FN3':  {
          'NA': 700000000
        },
        'FN4':  {
          'NA': 800000000
        },
        'FN5':  {
          'NA': 900000000
        },
        'SNA':  {
          'NA': 1000000000
        },
        'SNB':  {
          'NA': 1100000000
        },
        'SWA':  {
          'NA': 1200000000
        },
        'SWB':  {
          'NA': 1300000000
        },
        'ST1':  {
          'NA': 1400000000
        },
        'ST2':  {
          'NA': 1500000000
        },
        'ST3':  {
          'NA': 1600000000
        },
        'ST4':  {
          'NA': 1700000000
        },
        'ST5':  {
          'NA': 1800000000
        },
        'ST6':  {
          'NA': 1900000000
        },
        'ST7':  {
          'NA': 2000000000
        },
        'WD1': {
          'NA': 2100000000
        },
        'WD2': {
          'NA': 2200000000
        },
        'WD3': {
          'NA': 2300000000
        }
      },
      'ERS-1':      {
        'STD':  {
          'NA': 100000000
        }
      },
      'ERS-2':      {
        'STD':  {
          'NA': 100000000
        }
      },
      'JERS-1': {
        'STD':  {
          'NA': 100000000
        }
      }
    };
    if( _.isUndefined(beamvals[platform][beam][offnadir]) ) {
      retval = platvals[platform]+9900000000+acqdate;
    } else {
      retval = platvals[platform]+beamvals[platform][beam][offnadir]+acqdate;
    }
    return(retval);
  }
});

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
}
});

var SearchResultsView = Backbone.View.extend(
  {

    dataTable: null,
    hasRendered: false,
    initialize: function() {
      _.bindAll(this, "render");
      this.bind('DrawPolygonsOnMap', jQuery.proxy(function() {
       if ( ! _.isNull(this.dataTable) )  {
         _.each(this.dataTable.fnGetData(), jQuery.proxy(function(h) {
          if (h[1] == 1) {
            if(this.mo[$(h[0]).find("div").attr("product_id")]) {
              this.mo[$(h[0]).find("div").attr("product_id")].setMap(searchMap);
            }
          } else {
            if(this.mo[$(h[0]).find("div").attr("product_id")]) {
              this.mo[$(h[0]).find("div").attr("product_id")].setMap(null);
            }
          }
          h[1]=0;

          },this)
        );
        }
        },this)
      );

        // Observe changes to this collection
        this.collection.bind('refresh', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);

        this.default_tile_opacity=0.2;

        this.model.bind('authSuccess', jQuery.proxy(function() {
          this.render('authSuccess');
          },this)
        );

        // Observe changes to the post-filters
        this.options.postFilters.bind('change', this.render);
        this.options.postFilters.bind('refreshMap', this.refreshMap);

        this.showBeforeSearchMessage();
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

      getPlatformRowTemplate: function( p ) {
        switch(p) {
          case 'ALOS':
          return '\
          <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> PALSAR <span class="beam"><%= BEAMMODETYPE %></span><span class="date"><%= acquisitionDateText %></span></h4>\
          <p>Frame <%= FRAMENUMBER %>, Path <%= PATHNUMBER %></p>\
          <p>Off-Nadir <%= OFFNADIRANGLE %>&deg;</p>\
          ';
          break;
          case 'UAVSAR':
          return '\
          <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> <span class="beam"><%= BEAMMODETYPE %></span><span class="date"><%= acquisitionDateText %></span></h4>\
          <p><%= MISSIONNAME %></p>\
          ';
          break;
          default: return '\
          <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> <span class="beam"><%= BEAMMODETYPE %></span><span class="date"><%= acquisitionDateText %></span></h4>\
          <p>Frame <%= FRAMENUMBER %>, Orbit <%= ORBIT %></p>\
          ';
        }
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

        $('#con').empty();

        var el = $('<table id="searchResults" width="375" style="margin:20px 0px 20px 0px;"></table>');

        var ur = SearchApp.user.getWidgetRenderer();
        var li="";
        var li_2="";
        this.collection.each( function( model, i, l ) {
          var d = model.toJSON();

          li = '<tr><td class="productRow" id="result_row_'+d.id+'" product_id="'+d.id+'" onclick="window.showProductProfile(\''+d.id+'\'); return false;">'
          + ur.srThumbnail( model )
          + _.template( this.getPlatformRowTemplate( d.PLATFORM ), d)
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

          var tableHtml =
          '<thead>'+
          '<tr>'+
          '<th></th>'+
          '</tr>'+
          '</thead>'+
          '<tbody>'+
          li_2 +
          '</tbody>';
          el.html(tableHtml);

          $('#con').append(el); // append the table to it's container


          // Enhance the table using a DataTable object.
          this.dataTable = $('#searchResults').dataTable(
            {
             "oLanguage": {
              "sSearch": "Find"
            },
            "bProcessing": true,
            "bAutoWidth": true,
            "aoColumns": [
            {"sWidth": "100%"}
            ],
            "bDestroy": true,     // destroy old table
            "sScrollY": "500px",
            "iDisplayLength": 1000, // default number of rows per page
            "bLengthChange": false ,// do not allow users to change the default page length
            "fnDrawCallback": jQuery.proxy(function() {
              this.trigger("DrawPolygonsOnMap");
              },this),
              "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                aData[1]=1;
                return nRow;

              }
            });

            SearchApp.dataTable = this.dataTable;

            $('.productRow').live('mouseenter', { view: this }, this.toggleHighlight );
            $('.productRow').live('mouseleave', { view: this }, this.removeHighlight );


            this.showResults();
            this.clearOverlays();
            this.renderOnMap();
            this.resetHeight();



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

      resetHeight: function() {
        // 580 = maximum possible height of the search results, before
        // other dynamic page elements are rendered.
        $(this.el).height( 575 - ( $('#active-filters').outerHeight() + 31 )); // 31px = fixed height of ProcTypeButton
      },

      renderOnMap: function() {
        this.bounds = new google.maps.LatLngBounds();
        var changeBounds=false;

        _.each(SearchApp.dataTable.fnGetData(), jQuery.proxy(function(h) {
          var dp = this.collection.get( $(h[0]).find("div").attr("product_id") );
          if (!dp.get("filtered")) {
            changeBounds=true;
            e = dp.toJSON();

            this.bounds.extend(new google.maps.LatLng(e.NEARSTARTLAT, e.NEARSTARTLON));
            this.bounds.extend(new google.maps.LatLng(e.FARSTARTLAT, e.FARSTARTLON));
            this.bounds.extend(new google.maps.LatLng(e.NEARENDLAT, e.NEARENDLON));
            this.bounds.extend(new google.maps.LatLng(e.FARSTARTLAT, e.FARSTARTLON));

            this.mo[ e.id ] = new google.maps.Polygon({
              paths: new Array(
                new google.maps.LatLng(e.NEARSTARTLAT, e.NEARSTARTLON),
                new google.maps.LatLng(e.FARSTARTLAT, e.FARSTARTLON),
                new google.maps.LatLng(e.FARENDLAT, e.FARENDLON),
                new google.maps.LatLng(e.NEARENDLAT, e.NEARENDLON)
              ),
              fillColor: '#777777',
              fillOpacity: this.default_tile_opacity,
              strokeColor: '#333333',
              strokeOpacity: 1,
              strokeWeight: 2,
              zIndex: 1000,
              clickable: true
            });
            this.mo[ e.id ].setMap(searchMap);
          }

          }, this)
        );

          if (changeBounds) {
            searchMap.fitBounds( this.bounds );
          }
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

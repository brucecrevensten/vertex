var SearchResults = Backbone.Collection.extend(
  {
    url: AsfDataportalConfig.apiUrl,
    model: DataProduct,

    // platforms found in result set list
    platforms: [], 
    error: '',

    // Client sets this to the SearchResultsView it creates
    view: null,

    setView: function(v) {
      this.view = v;
    },

    setParameters: function(sp) {
      this.searchParameters = sp;
    },

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
        if( 'undefined' == typeof dp ) {
          this.add( data[i] );
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
          processingType: data[i].PROCESSINGTYPE,
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
      var d = SearchApp.postFilters.applyFilters( this.data.results.rows.ROW );
      this.build( d );
      this.view.render();
    },

    fetchSearchResults: function(sp) {

      this.setParameters(sp);

      var results = $.ajax({
        type: "GET",
        url: this.url,
        data: this.searchParameters.toJSON(),
        processData: true,
        dataType: "jsonp",
        context: this,
        beforeSend: function(){
          this.view.showSearching();
        },
        success: function(data, textStatus, jqXHR) {
          this.data = data;

          // Fetch distinct platforms that were found
          this.platforms = _.uniq( _.pluck( data.results.rows.ROW, 'PLATFORM') );
          this.build(data.results.rows.ROW);
          this.view.render();

        },
        error: function(jqXHR, textStatus, errorThrown) {

          switch(jqXHR.status) {
            // todo: move this gui code into the view object
            case 204:
              this.view.showNoResults();
              break;
            default:
              this.view.showError(jqXHR);
          }
        }
      }).results;

    }
  }
);

var SearchResultsView = Backbone.View.extend(
{

  dataTable: null,
  hasRendered: false,
  initialize: function() {
    _.bindAll(this, "render");
  },

  renderLength: function() {
    return _.template('<h3><%= length %> results found</h3>', this.collection);
  },

  showResults: function() {

    $('#async-spinner').hide();
    $('#searchResults').show();
    $('#platform_facets').show();
    $("#error-message").hide();
    $("#results-banner").hide();

  },

  showSearching: function() {

    $('#async-spinner').show();
    $("#results-banner").hide();
    $('#searchResults').hide();
    $("#error-message").hide();
    $('#platform_facets').hide();
    this.clearOverlays();

  },

  showError: function(jqXHR) {

    $("#async-spinner").hide();
    $("#results-banner").hide();
    $("#error-message").show();
    $("#error-message-code").text(jqXHR.status);
    $('#platform_facets').hide();
  },

  showNoResults: function() {

    $("#async-spinner").hide();
    $("#results-banner").show();
    $("#error-message").hide();
    $("#platform_facet").hide();
    $('#platform_facets').hide();
    this.clearOverlays();

  },
  getPlatformRowTemplate: function( p ) {
    switch(p) {
      case 'ALOS': return '\
  <img src="<%= THUMBNAIL %>" title="<%= GRANULENAME %>" />\
  <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> <span><%= BEAMMODETYPE %></span></h4>\
  <div>\
    <p><%= acquisitionDateText %></p>\
    <p>Frame <%= FRAMENUMBER %>, Path <%= PATHNUMBER %></p>\
  </div>\
  <div style="clear: both"></div>\
';
      case 'RADARSAT-1': return '\
 <img src="<%= THUMBNAIL %>" title="<%= GRANULENAME %>" />\
  <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> <span><%= BEAMMODETYPE %></span></h4>\
  <div>\
    <p><%= acquisitionDateText %></p>\
    <p>Frame <%= FRAMENUMBER %>, Orbit <%= ORBIT %></p>\
  </div>\
  <div style="clear: both"></div>\
';
      default: return '';
    }
  },
  render: function() {

    $(this.el).empty();

    if( 0 == this.collection.length ) {
      this.clearOverlays();
      this.showNoResults();
      return this;
    }
    this.collection.each( function( e, i, l ) {
     
      d = e.toJSON();

      d['acquisitionDateText'] = $.datepicker.formatDate( 'yy-mm-dd', $.datepicker.parseDate('yy-mm-dd', d.ACQUISITIONDATE));

      li = jQuery('<li/>').attr('product_id', d.id);

      li.append(
        _.template( this.getPlatformRowTemplate( d.PLATFORM) , d )
      );

      li.find('img').error( function() { $(this).remove(); });

      v = new DataProductView( { model: e } );

      li.bind( "click", { id: e.id, view: v }, function(e) {
        $("#product_profile").html( e.data.view.render().el );
        $("#product_profile").dialog(
          {
            modal: true,
            width: 900,
            draggable: false,
            resizable: false,
            title: e.data.id,
            position: "center"
          }
        );
      });

      $(this.el).append(li);

    }, this); // end iteration over collection

    
    $('#searchResults li').live('mouseenter', { view: this }, this.toggleHighlight );

    this.showResults();
    this.clearOverlays();
    this.renderOnMap();
    this.trigger('render'); // custom event so post-filters know to render
    
    return this;

  },
  renderOnMap: function() {
    console.log('rendering frames on map');
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
  toggleHighlight: function(e) {

    if( e.view.SearchApp.searchResultsView.activePoly ) {
      e.view.SearchApp.searchResultsView.mo[e.view.SearchApp.searchResultsView.activePoly].setOptions({
        fillColor: '#777777',
        fillOpacity: 0.25,
        strokeColor: '#333333',
        strokeOpacity: 0.5,
        zIndex: 1000
      });
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


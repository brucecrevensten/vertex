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
          this.platforms = _.uniq( _.pluck( this.data.results.rows.ROW, 'PLATFORM') );

          // Munge this data to get a local true ID on each model; need to wiggle
          // the returned JSON a little bit so that Backbone can consume the (lowercase)
          // 'id' field.
          for ( var i in data.results.rows.ROW ) {
            data.results.rows.ROW[i].id = data.results.rows.ROW[i].ID;
          }
          
          this.view.showResults();
          this.reset( this.data.results.rows.ROW );
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
    this.collection.bind("reset", this.render);
  },

  renderLength: function() {
    return _.template('<h3><%= length %> results found</h3>', this.collection);
  },

  showResults: function() {

    $('#async-spinner').hide();
    $('#searchResults').show();
    $('#platform_facets').show();

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
  },

  render: function() {

    this.collection.each( function( e, i, l ) {
     
      d = e.toJSON();
      d['acquisitionDateText'] = $.datepicker.formatDate( 'yy-mm-dd', $.datepicker.parseDate('yy-mm-dd', d.ACQUISITIONDATE));

      li = jQuery('<li/>').attr('product_id', d.id);

      li.append(
        _.template('\
  <img src="<%= THUMBNAIL %>" title="<%= GRANULENAME %>" />\
  <h4 title="<%= BEAMMODEDESC %>"><%= PLATFORM %> <span><%= BEAMMODETYPE %></span></h4>\
  <div>\
    <p><%= acquisitionDateText %></p>\
    <p>Frame <%= FRAMENUMBER %>, Path <%= ORBIT %></p>\
    <div>\
      <a href="<%= URL %>" product="<%= FILENAME %>" class="tool_download">Download</a>\
      <button product="<%= id %>" class="tool_enqueuer">Add to queue</button>\
    </div>\
  </div>\
  <div style="clear: both"></div>\
', d )
      );

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
    $('.tool_download').button(
      {
        icons: {
          primary: "ui-icon-circle-arrow-s"
        },
        text: 'Download' 
      }
    ).click( function(e) {
      e.stopPropagation();
    });
    
    $('.tool_enqueuer').click( function(e) {
      e.stopPropagation();
      if ( $(this).prop('selected') == 'selected' ) {
        $(this).toggleClass('tool-dequeue');
        $(this).prop('selected','false');
        SearchApp.downloadQueue.remove( SearchApp.searchResults.get( $(this).attr('product')));
        $(this).button( "option", "label", "Add to queue" );
        $(this).button( "option", "icons", { primary: "ui-icon-circle-plus" } );
      } else {
        $(this).toggleClass('tool-dequeue');
        $(this).prop('selected','selected');
        SearchApp.downloadQueue.add( SearchApp.searchResults.get( $(this).attr('product')));
        $(this).button( "option", "label", "Remove from queue" );
        $(this).button( "option", "icons", { primary: "ui-icon-circle-minus" } );
      }
      $(e.currentTarget.parentNode.parentNode).toggleClass("selected");
    }).button(
      {
        icons: {
          primary: "ui-icon-circle-plus"
        },
        label: 'Add to queue'
      }
    );

    this.clearOverlays();
    this.renderOnMap();


    return this;

  },
  renderOnMap: function() {
    var res = this.collection.data.results.rows.ROW;

    this.leastLat = Math.min( res[0].NEARSTARTLAT, res[0].FARSTARTLAT, res[0].FARENDLAT, res[0].NEARENDLAT );
    this.mostLat = Math.max( res[0].NEARSTARTLAT, res[0].FARSTARTLAT, res[0].FARENDLAT, res[0].NEARENDLAT );
    this.leastLon = Math.min( res[0].NEARSTARTLON, res[0].FARSTARTLON, res[0].FARENDLON, res[0].NEARENDLON );
    this.mostLon = Math.max( res[0].NEARSTARTLON, res[0].FARSTARTLON, res[0].FARENDLON, res[0].NEARENDLON );

    for(var ii = 0; ii < res.length; ++ii) {

      this.leastLat = Math.min( this.leastLat, res[ii].NEARSTARTLAT, res[ii].FARSTARTLAT, res[ii].FARENDLAT, res[ii].NEARENDLAT );
      this.mostLat = Math.max( this.mostLat, res[ii].NEARSTARTLAT, res[ii].FARSTARTLAT, res[ii].FARENDLAT, res[ii].NEARENDLAT );
      this.leastLon = Math.min( this.leastLon, res[ii].NEARSTARTLON, res[ii].FARSTARTLON, res[ii].FARENDLON, res[ii].NEARENDLON );
      this.mostLon = Math.max( this.mostLon, res[ii].NEARSTARTLON, res[ii].FARSTARTLON, res[ii].FARENDLON, res[ii].NEARENDLON );

      var path = new Array(
        new google.maps.LatLng(res[ii].NEARSTARTLAT, res[ii].NEARSTARTLON),
        new google.maps.LatLng(res[ii].FARSTARTLAT, res[ii].FARSTARTLON),
        new google.maps.LatLng(res[ii].FARENDLAT, res[ii].FARENDLON),
        new google.maps.LatLng(res[ii].NEARENDLAT, res[ii].NEARENDLON)
      );
      
      this.mo[ res[ii].ID ] = new google.maps.Polygon({
          paths: path,
          fillColor: '#777777',
          fillOpacity: 0.25,
          strokeColor: '#333333',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          zIndex: 1000 + ii,
          clickable: true
        });
      this.mo[res[ii].ID].setMap(searchMap);
    }
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


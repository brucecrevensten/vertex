var SearchResults = Backbone.Collection.extend(
  {
    url: AsfDataportalConfig.apiUrl,
    model: DataProduct,

    // platforms found in result set list
    platforms: [], 
    error:"",

    // Client sets this to the SearchResultsView it creates
    view: null,

    setView: function(v) {
      this.view = v;
    },

    setParameters: function(sp) {
      this.searchParameters = sp;
    },


    // Purpose of this function is to build the array of data that will be provided to the DataTable.
    // The DataTable expects an array of arrays, so we've gotta do a little bit of munging
    // from the incoming JSON.
    // TODO: remove this, most recent revision of DataTables gives another way to provision data
    parseObjectsToArrays: function(d, c) {
      var a = [];
      for ( var i=0, iLen=d.length; i < iLen; i++ ) {
        var inner = [];
        for ( var j=0, jLen=c.length; j < jLen; j++ ) {
          inner.push( d[i][c[j]] );
        }
        a.push( inner);
      }
      return a;
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
          this.platforms = _.uniq( _.pluck( this.data.results.rows.ROW, 'PLATFORM') );

          // Munge this data to get a local true ID on each model; need to wiggle
          // the returned JSON a little bit so that Backbone can consume the (lowercase)
          // 'id' field.
          for ( var i in data.results.rows.ROW ) {
            data.results.rows.ROW[i].id = data.results.rows.ROW[i].ID;
          }

          this.view.showTable();
          this.refresh( this.data.results.rows.ROW );

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
    this.collection.bind("refresh", this.render);
  },

  renderLength: function() {
    return _.template('<h3><%= length %> results found</h3>', this.collection);
  },

  showTable: function() {

    $('#async-spinner').hide();
    $('#results-widget-wrapper').show();
    $('#platform_facets').show();

  },

  showSearching: function() {

    $('#async-spinner').show();
    $("#results-banner").hide();
    $('#results-widget-wrapper').hide();
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

// todo: fix this to not use the mess of arrays -- datatables v1.8 should fix that with mDataProp in aoColumns
  render: function() {

//todo: remove this nonsense
    var preparedData = this.collection.parseObjectsToArrays(this.collection.data.results.rows.ROW, ["GRANULENAME","PROCESSINGTYPE","PLATFORM","ORBIT","FRAMENUMBER","CENTERLAT","CENTERLON","ACQUISITIONDATE","THUMBNAIL","URL","ID"]);

    if ( false == this.hasRendered ) {
      this.hasRendered = true;
      this.dataTable = $(this.el).dataTable(
      {
        "bFilter" : false,
        "bLengthChange" : false,
        "sScrollY" : "20em",
        "bPaginate" : false,
        "bJQueryUI": true,
        "aaData": preparedData,
        "bAutoWidth" : false,
        "aoColumns": [
          { 
            "bSearchable": false,
            "bSortable": false,
            "sWidth": "135px", // THIS makes the column width predictable in chrome/webkit
            "sTitle": "Granule",
            "bUseRendered": false, // preserve the original granule name (don't replace with the html internally) so sorting works as expected
            "fnRender": function(o) {
              // We do a little mini-table here to get vertical centering
              return _.template('<img title="<%= name %>" src="<%= thumbnail %>"/>', { thumbnail: o.aData[8], name: o.aData[0] });
            }
          },
          { "sTitle": "Processing" },
          { "sTitle": "Platform" },
          { "sTitle": "Orbit" },
          { "sTitle": "Frame" },
          { "sTitle": "Center Latitude/Longitude",
            "fnRender": function(o) {
              return o.aData[5]+', '+o.aData[6];
            }
          },
          { "bVisible" : false }, // suspend display of CenterLon distinct from the prior column
          { 
            "sTitle": "Acquisition Date",
            "fnRender" : function(o) {
              // truncate the date to yyyy-mm-dd format
              return $.datepicker.formatDate( 'yy-mm-dd', $.datepicker.parseDate('yy-mm-dd', o.aData[7]));
            }
          },
          { "bVisible" : false }, // suspend display of thumbnail
          { 
            "sTitle": "",
            "sClass": "left-adjusted",
            "fnRender": function(o) {
      
              return _.template('\
<a href="<%= url %>" product="<%= product %>" class="tool_download">Download</a>\
<button product="<%= product %>" class="tool_enqueuer">Add to queue</button>\
', { product: o.aData[0]+"_"+o.aData[1], url: o.aData[9] } );

            },
            "bUseRendered": false, // keep the URl here for convenience for direct download link
            "bSearchable": false,
            "bSortable": false
          },
          { "bVisible":false } // suspend display of the ID column
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {

          $(nRow).attr("product_id", aData[10]);

          v = new DataProductView( { model: SearchApp.searchResults.get(aData[10]) } );
          $(nRow).bind( "click", { id: aData[0], view: v }, function(e) {
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
          return nRow;
        }
      }
      );

    } else {
      this.clearOverlays();
      this.dataTable.fnClearTable();
      this.dataTable.fnAddData(preparedData);
    }

    $('#results tbody tr').live('mouseenter', { view: this }, this.toggleHighlight );

    $('.tool_download').button(
      {
        icons: {
          primary: "ui-icon-circle-arrow-s"
        },
        text: 'Download' 
      }
    );

    $('.tool_download').click( function(e) {
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
    });

    $('.tool_enqueuer').button(
      {
        icons: {
          primary: "ui-icon-circle-plus"
        },
        label: 'Add to queue'
      }
    );

    this.renderOnMap();
    this.dataTable.fnAdjustColumnSizing();
    return this;

  },
  renderOnMap: function() {
    var res = this.collection.data.results.rows.ROW;
    for(var ii = 0; ii < res.length; ++ii) {
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
  mapOverlays: new Array(),
  mo: {},
  // the currently active/hightlighted polygon
  activePoly: null
}
);


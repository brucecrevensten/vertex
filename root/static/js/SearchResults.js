var SearchResults = Backbone.Collection.extend(
  {
    url: AsfDataportalConfig.apiUrl,
    model:DataProduct,
    error:"",
    setParameters: function(sp) {
      this.searchParameters = sp;
    },

    // Purpose of this function is to build the array of data that will be provided to the DataTable.
    // The DataTable expects an array of arrays, so we've gotta do a little bit of munging
    // from the incoming JSON.
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
          $('#async-spinner').show();
          $("#results-banner").hide();
          $('#results-widget-wrapper').hide();
          $("#error-message").hide();
        },
        success: function(data, textStatus, jqXHR) {
          this.data = data;

          // Munge this data to get a local true ID on each model; need to wiggle
          // the returned JSON a little bit so that Backbone can consume the (lowercase)
          // 'id' field.
          for ( var i in data.results.rows.ROW ) {
            data.results.rows.ROW[i].id = data.results.rows.ROW[i].ID;
          }
          this.refresh( this.data.results.rows.ROW );
          $('#async-spinner').hide();
          $('#results-widget-wrapper').show();
        },
        error: function(jqXHR, textStatus, errorThrown) {

          switch(jqXHR.status) {
            case 204:
              $("#async-spinner").hide();
              $("#results-banner").show();
              $("#error-message").hide();
              break;
            default:
              $("#async-spinner").hide();
              $("#results-banner").hide();
              $("#error-message").show();
              $("#error-message-code").text(jqXHR.status);
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


// todo: fix this to not use the mess of arrays -- datatables v1.8 should fix that with mDataProp in aoColumns
  render: function() {

//todo: remove this nonsense
    var preparedData = this.collection.parseObjectsToArrays(this.collection.data.results.rows.ROW, ["GRANULENAME","PROCESSINGTYPE","PLATFORM","ORBIT","FRAMENUMBER","CENTERLAT","CENTERLON","ACQUISITIONDATE","THUMBNAIL","URL"]);

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
        "aoColumns": [
          { 
                      
            "sTitle": "Granule Name",
            "bUseRendered": false, // preserve the original granule name (don't replace with the html internally) so sorting works as expected
            "fnRender": function(o) {
              // We do a little mini-table here to get vertical centering
              return _.template('\
  <div style="display:table">\
    <img style="display:table-cell" src="<%= thumbnail %>"/>\
    <span style="display:table-cell;vertical-align:middle;height: 100%;">\
      <%= name %>\
    </span>\
  </div', { thumbnail: o.aData[8], name: o.aData[0] });
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
          { "sTitle": "Acquisition Date" },
          { "bVisible" : false }, // suspend display of thumbnail
          { 
            "sTitle": "Tools",
            "fnRender": function(o) {
      
              return _.template('\
<button product="<%= product %>" class="tool_download">Download</button>\
<button product="<%= product %>" class="tool_enqueuer">Add to queue</button>\
', { product: o.aData[0]+"_"+o.aData[1] } );

            },
            "bUseRendered": false, // keep the URl here for convenience for direct download link
            "bSearchable": false,
            "bSortable": false
          }
        ],
        "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
          gid = aData[0]+"_"+aData[1];

          v = new DataProductView( { model: SearchApp.searchResults.get(gid) } );
          $(nRow).bind( "click", { id: aData[0], view: v }, function(e) {
              $("#product_profile").html( e.data.view.render().el );
              $("#product_profile").dialog(
                {
                  modal: true,
                  width: 600,
                  draggable: false,
                  resizable: false,
                  title: e.data.id,
                  position: "top"
                }
              );
          });
          return nRow;
        }
      }
      );
      
      this.dataTable.fnAdjustColumnSizing();

    } else {
      this.dataTable.fnClearTable();
      this.dataTable.fnAddData(preparedData);
    }

    $('.tool_download').button(
      {
        icons: {
          primary: "ui-icon-circle-arrow-s"
        },
        text: 'Download' 
      }
    );
    
    $('.tool_enqueuer').click( function(e) {
      e.stopPropagation();
      if ( $(this).prop('selected') == 'selected' ) {
        $(this).prop('selected','false');
        SearchApp.downloadQueue.remove( SearchApp.searchResults.get( $(this).attr('product')));
        $(this).button( "option", "label", "Add to queue" );
        $(this).button( "option", "icons", { primary: "ui-icon-circle-plus" } );
      } else {
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

    this.clearOverlays(); // consider calling this at the same time we clear the datatable out?
    this.renderOnMap();
    return this;
  },
  renderOnMap: function() {
    var res = this.collection.data.results.rows.ROW;
    for(var ii = 0; ii < res.length; ++ii) {
      var path = new Array(
        new google.maps.LatLng(res[ii].NEARSTARTLAT, res[ii].NEARSTARTLON),
        new google.maps.LatLng(res[ii].FARSTARTLAT, res[ii].FARSTARTLON),
        new google.maps.LatLng(res[ii].FARENDLAT, res[ii].FARENDLON),
        new google.maps.LatLng(res[ii].NEARENDLAT, res[ii].NEARENDLON));
      
      var poly = new google.maps.Polygon({
          paths: path,
          fillColor: '#777777',
          fillOpacity: 0.25,
          strokeColor: '#333333',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          zIndex: 1000 + ii,
          clickable: true
        });
      poly.setMap(searchMap);
      this.mapOverlays.push(poly);
    }
  },
  clearOverlays: function() {
    for(var ii = 0; ii < this.mapOverlays.length; ++ii) {
      this.mapOverlays[ii].setMap(null);
    }
    this.mapOverlays.length = 0;
  },
  highlightOverlay: function(idx) {
    this.mapOverlays[idx].setOptions({
      fillColor: '#FFFFB4',
      StrokeColor: '#FFFF00'
    });
  },
  unhighlightOverlay: function(idx) {
    this.mapOverays[idx].setOptions({
      fillColor: '#777777',
      strokeColor: '#333333'
    });
  },
  // use this array for clearing the overlays from the map when the results change(?)
  // also for highlighting by changing the fillColor, strokeColor, etc.
  // (this array is 1:1 with the results, so overlay [0] here is product [0] in the results)
  mapOverlays: new Array()
}
);


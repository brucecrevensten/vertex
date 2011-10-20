var DataProductFile = Backbone.Model.extend( {
 /* Structure of this model:
  {
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
  }
 */
  initialize: function() {
    this.set( {
       'acquisitionDateText': $.datepicker.formatDate( 'yy-mm-dd', $.datepicker.parseDate('yy-mm-dd', this.get('acquisitionDate').substring(0,10)))
    });
  }
} );

var DataProductFiles = Backbone.Collection.extend( { 
  model: DataProductFile,
  comparator: function(m) {
    var ptype = m.get('processingType');
    var porder = {
      'L0': 0,
      'L1': 1,
      'L1.0': 2,
      'L1.1': 3,
      'L1.5': 4,
      'METADATA': 5,
      'STOKES': 6,
      'COMPLEX': 7,
      'PROJECTED': 8,
      'KMZ': 9,
    };
    return porder[ptype];
  }
});

var DataProductFilesView = Backbone.View.extend( {

  renderForProfile: function(o) {
    var disabled = false;
    if( _.isUndefined( o ) ) { 
      disabled = false;
    } else {
      disabled = (o.disabled == true) ? true : false;
    }

    var l = jQuery('<ul/>', { 'class': 'downloads'});
    this.collection.each( function(el, i, list) {

      e = el.toJSON();
      // Skip if type = BROWSE
      if( 'BROWSE' == e.processingType ) { return; }
   
      var li = jQuery('<li/>');
      if(disabled) {
        li.append(jQuery('<div/>', {
          'class':'tool_download'
        }).button({
          'disabled': true,
          'icons': {
              'primary': "ui-icon-circle-arrow-s"
            }, 
            label: _.template("&nbsp;&nbsp;&nbsp;<%= processingTypeDisplay %> (<%= sizeText %>)", e) }) );
      } else {
        li.append( jQuery('<a/>', {
          'href': e.url,
          'class': 'tool_download',
          'target': '_blank'
        }).button( {
          'icons': {
            'primary': "ui-icon-circle-arrow-s"
          },
          label: _.template("&nbsp;&nbsp;&nbsp;<%= processingTypeDisplay %> (<%= sizeText %>)", e) 
        }) );
      }

      li.append( $('<button>Add to queue</button>', {
        'class': 'tool_enqueuer',
        'title': 'Add to download queue'
      }).attr('product_id', e.productId).attr('product_file_id', e.id).click( function(e) {
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
      }).button(
        {
          'icons': {
            'primary': "ui-icon-circle-plus"
          },
          'text': false
        }
      ));
      l.append(li);
    });
    return l;
  }
});

var DataProduct = Backbone.Model.extend({
  initialize: function() {
    this.name = 'DataProduct';
    this.files = new DataProductFiles();
    var fdr = this.get('FARADAYROTATION');
    if(_.isNumber(fdr)) {
      fdr = fdr.toFixed(2);
    }
    this.set({
      'ASCENDINGDESCENDING': AsfUtility.ucfirst( this.get('ASCENDINGDESCENDING')),
      'acquisitionDateText': ( true != _.isUndefined( this.get('ACQUISITIONDATE') ) ) ?
        $.datepicker.formatDate( 'yy-mm-dd', $.datepicker.parseDate('yy-mm-dd', this.get('ACQUISITIONDATE').substring(0,10))) : '',
      'FARADAYROTATION': fdr
    });
    if(this.get('BEAMMODETYPE') == 'POL') {
      this.set({'BEAMMODETYPE': 'PolSAR'});
    }
  }
});

window.stopEventPropagation = function(event) {
    if (typeof event.stopPropagation != "undefined") {
        event.stopPropagation();
    } else {
        event.cancelBubble = true;
    }
}

window.showInlineProductFiles = function(event, product) {
  
  stopEventPropagation( event );

  if( true !== _.isUndefined( SearchApp.searchResultsView.currentProduct )
      || product === SearchApp.searchResultsView.currentProduct ) {
      // destroy the old one
      $('#gpl_'+SearchApp.searchResultsView.currentProduct).remove();
      //$('#'+SearchApp.searchResultsView.currentProduct+'_queue_toggler').click();
  }

  if( product === SearchApp.searchResultsView.currentProduct ) {
    // user toggled already-open row, unmark current product
    SearchApp.searchResultsView.currentProduct = undefined;
  } else {
    // render product list
    SearchApp.searchResultsView.currentProduct = product;
    var model = SearchApp.searchResults.get( product );

    var c = $('<ul/>', { 'class':'granuleProductList', 'id':'gpl_'+product } );
    model.files.each( function( file, w, r ) {
      
      // skip if BROWSE
      if( 'BROWSE' == file.get('processingType')) { return; }

      var lit = $('<li/>');
      var btn = $('<button>Add to queue...</button>', {
        'class': 'tool_enqueuer',
        'title': 'Add to download queue',
        'id': "b_"+file.id
      }).attr('product_id', file.get('productId'))
      .attr('product_file_id', file.id)
      .bind( 'click', function(event) {
          event.stopPropagation();
          var el = $(this);
          if ( el.prop('disabled') == 'disabled' ) { return false; }
          if ( el.prop('selected') == 'selected' ) {
            el.toggleClass('tool-dequeue');
            el.prop('selected','false');
            SearchApp.downloadQueue.remove( SearchApp.searchResults.get( el.attr('product_id') ).files.get( el.attr('product_file_id') ));
            el.button( "option", "icons", { primary: "ui-icon-circle-plus" } );
          } else {
            el.toggleClass('tool-dequeue');
            el.prop('selected','selected');
            SearchApp.downloadQueue.add( SearchApp.searchResults.get( el.attr('product_id')).files.get( el.attr('product_file_id')) );
            el.button( "option", "icons", { primary: "ui-icon-circle-minus" } );
          }
        }
        ).button(
          {
            'label': file.get('processingTypeDisplay') + ' (' + file.get('sizeText') + ')',
            'icons': {
              'primary':'ui-icon-circle-plus'
            }
          }
        );
        lit.append(btn);
        c.append(lit);
    });
    $('#result_row_'+product).append(c);
  }        
}

window.showProductProfile = function(product) {
  var v = new DataProductView( { 'model': window.SearchApp.searchResults.get(product) } );
  $("#product_profile").empty().unbind().html( v.render().el ).dialog(
    {
      modal: true,
      width: 'auto',
      minWidth: 400,
      draggable: false,
      resizable: false,
      title: product,
      position: "center"
    }
  );
  return false;

};

var DataProductView = Backbone.View.extend(
  {
    width: 500, // width of the rendered Product Profile; will be changed depending on missing image, etc
    getTemplate: function() {
      switch(this.model.get('PLATFORM')) {
        case 'ALOS': return '\
<h4>ALOS PALSAR</h4>\
<ul class="metadata">\
<li><span>Beam mode</span>: <span class="beamModeHelp" title="<%= BEAMMODEDESC %>"><%= BEAMMODETYPE %></span></li>\
<li><span>Orbit</span>: <%= ORBIT %></li>\
<li><span>Path</span>: <%= PATHNUMBER %></li>\
<li><span>Frame</span>: <%= FRAMENUMBER %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Faraday rotation</span>: <%= FARADAYROTATION %>&deg;</li>\
<li><span>Ascending/Descending</span>: <%= ASCENDINGDESCENDING %></li>\
<li><span>Off Nadir Angle</span>: <%= OFFNADIRANGLE %>&deg;</li>\
<li><span>Frequency</span>: L-Band</li>\
<li><span>Polarization</span>: <%= POLARIZATION %></li>\
</ul>\
';
        case 'UAVSAR': return '\
<ul class="metadata">\
<li><span>Mission</span>: <%= MISSIONNAME %></li>\
<li><span>Beam mode</span>: <%= BEAMMODEDESC %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Frequency</span>: L-Band</li>\
<li><span>Polarization</span>: <%= POLARIZATION %></li>\
</ul>\
';
        case 'JERS-1': return '\
<ul class="metadata">\
<li><span>Beam mode</span>: <span class="beamModeHelp" title="<%= BEAMMODEDESC %>"><%= BEAMMODETYPE %></span></li>\
<li><span>Frame</span>: <%= FRAMENUMBER %></li>\
<li><span>Orbit</span>: <%= ORBIT %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Ascending/Descending</span>: <%= ASCENDINGDESCENDING %></li>\
<li><span>Frequency</span>: L-Band</li>\
<li><span>Polarization</span>: <%= POLARIZATION %></li>\
</ul>\
';
        default: return '\
<ul class="metadata">\
<li><span>Beam mode</span>: <span class="beamModeHelp" title="<%= BEAMMODEDESC %>"><%= BEAMMODETYPE %></span></li>\
<li><span>Frame</span>: <%= FRAMENUMBER %></li>\
<li><span>Orbit</span>: <%= ORBIT %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Ascending/Descending</span>: <%= ASCENDINGDESCENDING %></li>\
<li><span>Frequency</span>: C-Band</li>\
<li><span>Polarization</span>: <%= POLARIZATION %></li>\
</ul>\
';

      }
    },

    render: function() {
      var ur = SearchApp.user.getWidgetRenderer();
		  $(this.el).empty();
      $(this.el).html( ur.ppBrowse( this.model ));
      var p3 = $(
        '<div/>',{'id':'hanger'}
        ).append(
          _.template( this.getTemplate(), this.model.toJSON())
        ).append( ur.ppFileList( this.model ));
      $(this.el).append(p3);
      return this;

    }
  }
);

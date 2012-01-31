var DataProductFile = Backbone.Model.extend( {
 /* Structure of this model:
  {
          thumbnail: data[i].thumbnail,
          granuleName: data[i].granuleName,
          id: data[i].id,
          processingType: data[i].processingType,
          processingTypeDisplay: data[i].processingTypeDisplay,
          processingLevel: data[i].processingLevel,
          processingTypeDescription: data[i].processingTypeDescription,
          url: data[i].url,
          platform: data[i].platform,
          acquisitionDate: data[i].acquisitionDate,
          bytes: data[i].bytes,
          sizeText: AsfUtility.bytesToString(data[i].bytes),
          md5sum: data[i].md5sum,
          filename: data[i].fileName
  }
 */
  initialize: function() {
    if(window.SearchApp && SearchApp.searchResults.get(this.get('granuleName'))) {
      var obj = SearchApp.searchResults.get(this.get('granuleName'));
      this.set( {
         'acquisitionDateText': obj.get('acquisitionDate').substring(0,10),
         'thumbnail': obj.get('thumbnail'),
         'id': this.get('product_file_id'),
         'platform': obj.get('platform'),
         'sizeText': AsfUtility.bytesToString(this.get('bytes'))
      });
    }
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
    _.each(this.options.files, function(el, i, list) {
      // Skip if type = BROWSE
      if( 'BROWSE' == el.processingType ) { return; }

      el.sizeText = AsfUtility.bytesToString(el.bytes);
   
      var li = jQuery('<li/>');
      if(disabled) {
        li.append(jQuery('<div/>', {
          'class':'tool_download'
        }).button({
          'disabled': true,
          'icons': {
              'primary': "ui-icon-circle-arrow-s"
            }, 
            label: _.template("&nbsp;&nbsp;&nbsp;<%= processingTypeDisplay %> (<%= sizeText %>)", el) }) );
      } else {
        li.append( jQuery('<a/>', {
          'href': el.url,
          'class': 'tool_download',
          'target': '_blank',
        }).button( {
          'icons': {
            'primary': "ui-icon-circle-arrow-s"
          },
          label: _.template("&nbsp;&nbsp;&nbsp;<%= processingTypeDisplay %> (<%= sizeText %>)", el) 
        }).click(function() {
          if(typeof ntptEventTag == 'function') {
            ntptEventTag('ev=downloadProduct');
            return this;
          }
        }));
      }

      li.append( $('<button>Add to queue</button>', {
        'class': 'tool_enqueuer',
        'title': 'Add to download queue'
      }).attr('product_id', el.granuleName).attr('product_file_id', el.product_file_id).click( function(e) {
        var el = $(this);
        if ( el.prop('disabled') == 'disabled' ) { return false; }
        if ( el.prop('selected') == 'selected' ) {
          if(typeof ntptEventTag == 'function') {
            ntptDropPair('product_file_id', el.attr('product_file_id'));
            ntptEventTag('ev=removeProductFromQueue');
          }
          el.toggleClass('tool-dequeue');
          el.prop('selected','false');
          SearchApp.downloadQueue.remove(el.attr('product_file_id'));
          el.button( "option", "icons", { primary: "ui-icon-circle-plus" } );
        } else {
          if(typeof ntptEventTag == 'function') {
            ntptAddPair('product_file_id', el.attr('product_file_id'));
            ntptEventTag('ev=addProductToQueue');
          }
          el.toggleClass('tool-dequeue');
          el.prop('selected','selected');
          SearchApp.downloadQueue.remove(el.attr('product_file_id'));
          SearchApp.downloadQueue.add(_.find(SearchApp.searchResults.get(
            el.attr('product_id')).get('files'), function(obj) {
              return((obj.product_file_id === el.attr('product_file_id')));
            }
          ));
          el.button( "option", "icons", { primary: "ui-icon-circle-minus" } );
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
    var fdr = parseFloat(this.get('faradayRotation'));
    if(_.isNumber(fdr)) {
      fdr = fdr.toFixed(2);
    } else {
      fdr = this.get('faradayRotation');
    }
    this.set({
      'ascendingDescending': AsfUtility.ucfirst( this.get('ascendingDescending')),
      'acquisitionDateText': this.get('acquisitionDate').substr(0,10),
      'faradayRotation': fdr
    });
    if(this.get('beamModeType') == 'POL') {
      this.set({'beamModeType': 'PolSAR'});
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
    _.each(model.get('files'), function(file) {
      
      // skip if BROWSE
      if( 'BROWSE' == file.processingType) { return; }

      var id = file.granuleName;
      var file_id = file.granuleName + '_' + file.processingType;

      var lit = $('<li/>');
      var btn = $('<button>Add to queue...</button>')
        .attr('product_id', id).attr('id', 'b_' + file_id)
        .attr('product_file_id', file_id)
        .bind( 'click', function(event) {
          event.stopPropagation();
          var el = $(this);
          if ( el.prop('disabled') == 'disabled' ) { return false; }
          if ( el.prop('selected') == 'selected' ) {
            if(typeof ntptEventTag == 'function') {
              ntptDropPair('product_file_id', el.attr('product_file_id'));
              ntptEventTag('ev=removeProductFromQueue');
            }
            el.toggleClass('tool-dequeue');
            el.prop('selected','false');
            SearchApp.downloadQueue.remove(el.attr('product_file_id'));
            el.button( "option", "icons", { primary: "ui-icon-circle-plus" } );
          } else {
            if(typeof ntptEventTag == 'function') {
              ntptAddPair('product_file_id', el.attr('product_file_id'));
              ntptEventTag('ev=addProductToQueue');
            }
            el.toggleClass('tool-dequeue');
            el.prop('selected','selected');
            SearchApp.downloadQueue.remove(el.attr('product_file_id'));
            SearchApp.downloadQueue.add(_.find(SearchApp.searchResults.get(
              el.attr('product_id')).get('files'), function(obj) {
                return((obj.product_file_id === el.attr('product_file_id')));
              }
            ));
            el.button( "option", "icons", { primary: "ui-icon-circle-minus" } );
          }
        }
        ).button(
          {
            'label': file.processingTypeDisplay + ' (' + AsfUtility.bytesToString(file.bytes) + ')',
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
  if(typeof ntptEventTag == 'function') {
    ntptEventTag('ev=showProductProfile');
  }
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
      switch(this.model.get('platform')) {
        case 'ALOS': return '\
<h4>ALOS PALSAR</h4>\
<ul class="metadata">\
<li><span>Beam mode</span>: <span class="beamModeHelp" title="<%= beamModeDesc %>"><%= beamModeType %></span></li>\
<li><span>Orbit</span>: <%= orbit %></li>\
<li><span>Path</span>: <%= pathNumber %></li>\
<li><span>Frame</span>: <%= frameNumber %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Faraday rotation</span>: <%= faradayRotation %>&deg;</li>\
<li><span>Ascending/Descending</span>: <%= ascendingDescending %></li>\
<li><span>Off Nadir Angle</span>: <%= offNadirAngle %>&deg;</li>\
<li><span>Frequency</span>: L-Band</li>\
<li><span>Polarization</span>: <%= polarization %></li>\
</ul>\
';
        case 'UAVSAR': return '\
<ul class="metadata">\
<li><span>Mission</span>: <%= missionName %></li>\
<li><span>Beam mode</span>: <%= beamModeDesc %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Frequency</span>: L-Band</li>\
<li><span>Polarization</span>: <%= polarization %></li>\
</ul>\
';
        case 'JERS-1': return '\
<ul class="metadata">\
<li><span>Beam mode</span>: <span class="beamModeHelp" title="<%= beamModeDesc %>"><%= beamModeType %></span></li>\
<li><span>Frame</span>: <%= frameNumber %></li>\
<li><span>Orbit</span>: <%= orbit %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Ascending/Descending</span>: <%= ascendingDescending %></li>\
<li><span>Frequency</span>: L-Band</li>\
<li><span>Polarization</span>: <%= polarization %></li>\
</ul>\
';
        default: return '\
<ul class="metadata">\
<li><span>Beam mode</span>: <span class="beamModeHelp" title="<%= beamModeDesc %>"><%= beamModeType %></span></li>\
<li><span>Frame</span>: <%= frameNumber %></li>\
<li><span>Orbit</span>: <%= orbit %></li>\
<li><span>Acquisition Date</span>: <%= acquisitionDateText %></li>\
<li><span>Ascending/Descending</span>: <%= ascendingDescending %></li>\
<li><span>Frequency</span>: C-Band</li>\
<li><span>Polarization</span>: <%= polarization %></li>\
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

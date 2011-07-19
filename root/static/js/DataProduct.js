var DataProductFile = Backbone.Model.extend( {} );

var DataProductFiles = Backbone.Collection.extend( { 
  model: DataProductFile
});

var DataProductFilesView = Backbone.View.extend( {

  renderForProfile: function(o) {

    if( _.isUndefined( o ) ) { 
      disabled = false;
    } else {
      var disabled = (o.disabled == true) ? true : false;
    }

    var l = jQuery('<ul/>', { 'class': 'downloads'});
    this.collection.each( function(el, i, list) {
      e = el.toJSON();
      var li = jQuery('<li/>');
      
      li.append( jQuery('<a/>', {
        'href': (disabled) ? '#' : e.url, // deactivate the link if user isn't logged in
        'class': 'tool_download'
      }).button( {
        'disabled': disabled,
        'icons': {
          'primary': "ui-icon-circle-arrow-s"
        },
        label: _.template("&nbsp;&nbsp;&nbsp;<%= processingTypeDisplay %> (<%= sizeText %>)", e) 
      }) );

      li.append( jQuery('<button>Add to queue</button>', {
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
          'disabled' : disabled,
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
  }
});

var DataProductView = Backbone.View.extend(
  {
    width: 500, // width of the rendered Product Profile; will be changed depending on missing image, etc
    getTemplate: function() {
      switch(this.model.PLATFORM) {
        case 'ALOS': return '\
<ul class="metadata">\
<li><span>Processing type</span>: <%= PROCESSINGTYPE %></li>\
<li><span>Beam mode</span>: <%= BEAMMODEDESC %></li>\
<li><span>Frame</span>: <%= FRAMENUMBER %></li>\
<li><span>Path</span>: <%= PATHNUMBER %></li>\
<li><span>Start time</span>: <%= STARTTIME %></li>\
<li><span>End time</span>: <%= ENDTIME %></li>\
<li><span>Faraday rotation</span>: <%= FARADAYROTATION %></li>\
<li><span>Ascending/Descending</span>: <%= ASCENDINGDESCENDING %></li>\
<li><span>Off Nadir Angle</span>: <%= OFFNADIRANGLE %></li>\
</ul>\
';
        case 'UAVSAR': return '\
<ul class="metadata">\
<li><span>Processing type</span>: <%= PROCESSINGTYPE %></li>\
<li><span>Beam mode</span>: <%= BEAMMODEDESC %></li>\
<li><span>Start time</span>: <%= STARTTIME %></li>\
<li><span>End time</span>: <%= ENDTIME %></li>\
</ul>\
';

        default: return '\
<ul class="metadata">\
<li><span>Processing type</span>: <%= PROCESSINGTYPE %></li>\
<li><span>Beam mode</span>: <%= BEAMMODEDESC %></li>\
<li><span>Frame</span>: <%= FRAMENUMBER %></li>\
<li><span>Orbit</span>: <%= ORBIT %></li>\
<li><span>Start time</span>: <%= STARTTIME %></li>\
<li><span>End time</span>: <%= ENDTIME %></li>\
<li><span>Faraday rotation</span>: <%= FARADAYROTATION %></li>\
<li><span>Ascending/Descending</span>: <%= ASCENDINGDESCENDING %></li>\
</ul>\
';

      }
    },
    render: function() {

      var ur = SearchApp.user.getWidgetRenderer();
      $(this.el).html( ur.ppBrowse( this.model ));
      $(this.el).append( _.template( this.getTemplate(), this.model.toJSON()));      
      $(this.el).append( ur.ppFileList( this.model ));
      return this;

    }
  }
);

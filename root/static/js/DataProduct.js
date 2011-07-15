var DataProductFile = Backbone.Model.extend( {} );

var DataProductFiles = Backbone.Collection.extend( { 
  model: DataProductFile
});

var DataProduct = Backbone.Model.extend({
  initialize: function() {
    this.name = 'DataProduct';
    this.files = new DataProductFiles();
  }
});

var DataProductView = Backbone.View.extend(
  {
    initialize: function() {
      
    },
    render: function() {
      $(this.el).html(
        _.template('\
<img src="<%= BROWSE %>" />\
<ul class="metadata">\
<li>Processing type: <%= PROCESSINGTYPE %></li>\
<li>Beam mode: <%= BEAMMODEDESC %></li>\
<li>Frame: <%= FRAMENUMBER %></li>\
<li>Path/Orbit: <%= PATHNUMBER %> / <%= ORBIT %></li>\
<li>Start time: <%= STARTTIME %></li>\
<li>End time: <%= ENDTIME %></li>\
<li>Faraday rotation: <%= FARADAYROTATION %></li>\
<li>Ascending/Descending: <%= ASCENDINGDESCENDING %></li>\
<li>Off Nadir Angle: <%= OFFNADIRANGLE %></li>\
</ul>\
', this.model.toJSON())
      );
      var l = jQuery('<ul/>', { 'class': 'downloads'});
      this.model.files.each( function(el, i, list) {
        e = el.toJSON();
        var li = jQuery('<li/>');
        
        li.append( jQuery('<a/>', {
          'href': e.url,
          'class': 'tool_download'
        }).button( {
          icons: {
            primary: "ui-icon-circle-arrow-s"
          },
          label: _.template("&nbsp;&nbsp;&nbsp;<%= processingTypeDisplay %> (<%= sizeText %>)", e) 
        }) );

        li.append( jQuery('<button>Add to queue</button>', {
          'class': 'tool_enqueuer',
          'title': 'Add to download queue'
        }).attr('product_id', e.productId).attr('product_file_id', e.id).click( function(e) {
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
            icons: {
              primary: "ui-icon-circle-plus"
            },
            text: false
          }
        ));
        l.append(li);
      });
      $(this.el).append(l);
      return this;

    }
  }
);

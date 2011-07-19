var UnrestrictedWidgetRenderer = Backbone.View.extend({

	// Returns Product Profile browse image
  _ppBrowse: function( m ) {
		// Try to use the BROWSE512
    // probably want to hide image until it's loaded then show it then resize the profile.
		if ( 'none' != m.get('BROWSE')) {
      var t = jQuery(
        '<img/>',
        {
          style: "height: 512px",
          src: m.get('BROWSE'),
          title: m.get('GRANULENAME')
        }
      ).error( { 'context':this }, function(e) { $(this).remove(); });
      var s = m.files.select( function(row) { return ( 'BROWSE' == row.get('processingType') ) } );
      if ( s[0] ) {
        t = jQuery('<a/>', { "href" : s[0].get('url'), 'target':'_blank' } ).html( t );
      }     
		} else {
      this.ppWidth = 500; // missing image = make narrow  
    }
    return t;
	},
	ppBrowse: function( m ) {
		if ( 'RADARSAT-1' == m.get('PLATFORM') ) {
			return '<div class="ui-widget">\
				<div class="ui-state-highlight ui-corner-all" style="padding: 1em;">\
					<p><span class="ui-icon ui-icon-info" style="float: left; position: relative; top: -2px; margin-right: .3em;"></span>\
					This image has a restricted browse product, and you must log in to view it.</p>\
				</div>\
			</div>';
		} else {
			return this._ppBrowse(m);
		}
	},
	ppFileList: function( m ) {}
		
});

var ALOSUserWidgetRenderer = UnrestrictedWidgetRenderer.extend({

	ppFileList: function( m ) {
		
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
      return l;
	}
});


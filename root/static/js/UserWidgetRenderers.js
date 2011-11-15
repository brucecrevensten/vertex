var UnrestrictedWidgetRenderer = Backbone.View.extend({

  restrictedBrowseNote: '<div class="ui-widget">\
        <div class="ui-state-highlight ui-corner-all" style="padding: 1em;">\
          <p><span class="ui-icon ui-icon-info" style="float: left; position: relative; top: -2px; margin-right: .3em;"></span>\
          This granule has a restricted browse product, and you must log in to view it.</p>\
        </div>\
      </div>',

  restrictedProductNote: '<div class="ui-widget">\
        <div class="ui-state-highlight ui-corner-all" style="padding: 1em;">\
          <p><span class="ui-icon ui-icon-info" style="float: left; position: relative; top: -2px; margin-right: .3em;"></span>\
          This granule&rsquo;s products are restricted, and you must log in to download them.</p>\
        </div>\
      </div>',

	// Returns Product Profile browse image
  _ppBrowse: function( m ) {
		// Try to use the BROWSE512
    // probably want to hide image until it's loaded then show it then resize the profile.
		if ( 'none' != m.get('BROWSE')) {
      var t = jQuery(
        '<img/>',
        {
          src: m.get('BROWSE'),
          title: m.get('GRANULENAME')
        }
      ).error( { 'context':this }, function(e) { $(this).remove(); });
      var s = m.files.select( function(row) { return ( 'BROWSE' == row.get('processingType') ) } );
      if ( s[0] ) {
        t = jQuery('<a/>', { "href" : s[0].get('url'), 'target':'_blank', 'title':m.get('GRANULENAME') } ).html( t );
        t.click(function() {
          if(typeof ntptLinkTag == 'function') {
            return ntptLinkTag(this);
          }
        });
      }     
		} else {
      this.ppWidth = 500; // missing image = make narrow  
    }
    return t;
	},
	ppBrowse: function( m ) {
		if ( 'RADARSAT-1' == m.get('PLATFORM') || 'JERS-1' == m.get('PLATFORM') ) {
			return this.restrictedBrowseNote;
		} else {
			return this._ppBrowse(m);
		}
	},
	ppFileList: function( m ) {
    if ( 'UAVSAR' == m.get('PLATFORM') ) {
      return new DataProductFilesView( { collection: m.files } ).renderForProfile();
    } else {
      return $('<div/>').html( this.restrictedProductNote ).append( new DataProductFilesView( { collection: m.files } ).renderForProfile( { 'disabled': true }));
    }
  },
  // This code is in the critical rendering loop -- avoid _.template()
  srThumbnail: function( m ) {
    if ( 'RADARSAT-1' == m.get('PLATFORM') || 'JERS-1' == m.get('PLATFORM')) {
      return ''; // return empty string for concatenation
    } else {
      if( 'none' == m.get('THUMBNAIL') ) { return ''; } // return empty string for concatenation
      return '<img title="'+m.get('GRANULENAME')+'" src="'+m.get('THUMBNAIL')+'" />';
    }
  }
		
});

var RestrictedWidgetRenderer = UnrestrictedWidgetRenderer.extend({
    restrictedBrowseNote: '<div class="ui-widget">\
        <div class="ui-state-highlight ui-corner-all" style="padding: 1em;">\
          <p><span class="ui-icon ui-icon-info" style="float: left; position: relative; top: -2px; margin-right: .3em;"></span>\
          This granule has a restricted browse product, and your account does not have permissions to view it.</p>\
        </div>\
      </div>',

  restrictedProductNote: '<div class="ui-widget">\
        <div class="ui-state-highlight ui-corner-all" style="padding: 1em;">\
          <p><span class="ui-icon ui-icon-info" style="float: left; position: relative; top: -2px; margin-right: .3em;"></span>\
          This granule&rsquo;s products are restricted, and your account does not have permissions to download them.</p>\
        </div>\
      </div>',
});

var AlosUserWidgetRenderer = RestrictedWidgetRenderer.extend({
  
  ppFileList: function( m ) {
    if( 'ALOS' == m.get('PLATFORM') || 'UAVSAR' == m.get('PLATFORM')) {
      return new DataProductFilesView( { collection: m.files } ).renderForProfile();
    } else {
      return $('<div/>').html( this.restrictedProductNote ).append( new DataProductFilesView( { collection: m.files } ).renderForProfile( { 'disabled': true }));
    }
	}
  
});

var LegacyUserWidgetRenderer = RestrictedWidgetRenderer.extend({

  ppBrowse: function( m ) {
      return this._ppBrowse(m);
  },
  
  ppFileList: function( m ) {
    if( 'RADARSAT-1' == m.get('PLATFORM')
      || 'JERS-1' == m.get('PLATFORM')
      || 'ERS-1' == m.get('PLATFORM')
      || 'ERS-2' == m.get('PLATFORM')
      || 'UAVSAR' == m.get('PLATFORM')
    ) {
      return new DataProductFilesView( { collection: m.files } ).renderForProfile();
    } else {
      return $('<div/>').html( this.restrictedProductNote ).append( new DataProductFilesView( { collection: m.files } ).renderForProfile( { 'disabled': true }));
    }
  },

  srThumbnail: function( m ) {
      return _.template('<img title="<%= GRANULENAME %>" src="<%= THUMBNAIL %>" />', m.toJSON());
  }

});


var UniversalUserWidgetRenderer = UnrestrictedWidgetRenderer.extend({

  ppBrowse: function( m ) {
    return this._ppBrowse(m);
  },
  
  ppFileList: function( m ) {
    return new DataProductFilesView( { collection: m.files } ).renderForProfile();
  },

  srThumbnail: function( m ) {
    return _.template('<img title="<%= GRANULENAME %>" src="<%= THUMBNAIL %>" />', m.toJSON());
  }

});

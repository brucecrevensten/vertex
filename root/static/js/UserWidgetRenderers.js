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
    var t;
    var loading;
		if ( 'none' != m.get('browse')) {
      loading = $('<div style="width:512px;height:512px" id="ppImageLoading"><img src="static/images/loading.gif"/></div>');
      t = jQuery(
        '<img/>',
        {
          src: m.get('browse'),
          title: m.get('granuleName')
        }
      ).error( { 'context':this }, function(e) {
        $(this).remove();
        $('#ppImageLoading').hide();
      });
      var s = m.files.select( function(row) { return ( 'browse' == row.get('processingType') ) } );
      t.load(function() {
        // Scale the image to be no bigger then 512px and preserve the aspect
        // ratio. This must be done here, we can only get the image dimensions
        // after the image is displayed.
        var img = $("#product_profile img");
        var imgH = img.height();
        var imgW = img.width();
        if(imgH >= imgW && imgH > 512) {
          img.height('512');
          img.width(imgW/imgH * 512);
        } else if(imgW > imgH && imgW > 512) {
          img.width('512');
          img.height(imgH/imgW * 512);
        }
        $('#ppImageLoading').hide();
        $(this).show();
      });
      t.hide();
      if ( s[0] ) {
        t = jQuery('<a/>', { "href" : s[0].get('url'), 'target':'_blank', 'title':m.get('granuleName') } ).html( t );
        t.click(function() {
          if(typeof ntptEventTag == 'function') {
            ntptEventTag('ev=browseImageLink');
            return(this);
          }
        });
      }     
		} else {
      this.ppWidth = 500; // missing image = make narrow  
    }
    if(t) {
      return t.append(loading);
    }
	},
	ppBrowse: function( m ) {
		if ( 'RADARSAT-1' == m.get('platform') || 'JERS-1' == m.get('platform') ) {
			return this.restrictedBrowseNote;
		} else {
			return this._ppBrowse(m);
		}
	},
	ppFileList: function( m ) {
    if ( 'UAVSAR' == m.get('platform') ) {
      return new DataProductFilesView( { files: m.get('files') } ).renderForProfile();
    } else {
      return $('<div/>').html( this.restrictedProductNote ).append( new DataProductFilesView( { files: m.get('files') } ).renderForProfile( { 'disabled': true }));
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
    if( 'ALOS' == m.get('platform') || 'UAVSAR' == m.get('platform')) {
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
    if( 'RADARSAT-1' == m.get('platform')
      || 'JERS-1' == m.get('platform')
      || 'ERS-1' == m.get('platform')
      || 'ERS-2' == m.get('platform')
      || 'UAVSAR' == m.get('platform')
    ) {
      return new DataProductFilesView( { collection: m.files } ).renderForProfile();
    } else {
      return $('<div/>').html( this.restrictedProductNote ).append( new DataProductFilesView( { collection: m.files } ).renderForProfile( { 'disabled': true }));
    }
  }
});


var UniversalUserWidgetRenderer = UnrestrictedWidgetRenderer.extend({

  ppBrowse: function( m ) {
    return this._ppBrowse(m);
  },
  
  ppFileList: function( m ) {
    return new DataProductFilesView( { collection: m.files } ).renderForProfile();
  }
});

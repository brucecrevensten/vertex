var DownloadQueue = Backbone.Collection.extend(
{
  url: AsfDataportalConfig.apiUrl,
  model:DataProductFile,

  getSizeInBytes:function() {
    return _.reduce(
      this.pluck("bytes"),
      function(memo, size) {
        return memo + size;
      },
      0
    );
  },

  getTextSummary:function() {
    var t; // will identify text fragment in summary button
    if ( 0 == this.length ) {
      t = 'empty';
    } else {
      t = this.length.toString();
      if ( 1 == this.length ) {
        t = t + ' item';
      } else {
        t = t + ' items';
      }
      t = t + ', ' + AsfUtility.bytesToString( this.getSizeInBytes() ); 
    }
    return t; 
  }
}
);

var DownloadQueueSearchResultsView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "render");
    this.collection.bind("add", this.render);
    this.collection.bind("remove", this.render);

    //TODO: bind this to the 'render' event on the search results
  },
  setSearchResultsView: function(srv) {
    this.srv = srv;
    this.srv.bind("render", this.render);
  },
  render: function() {
    $(SearchApp.searchResultsView.el).find('li.productRow').removeClass('inQueue');
    this.collection.each( function(m) {
      $(SearchApp.searchResultsView.el).find('[product_id="'+m.get('productId')+'"]').addClass('inQueue');
    });
  }
});

var DownloadQueueMapView = Backbone.View.extend({
  
  initialize: function() {
    _.bindAll(this, "render");
    this.collection.bind("add", this.render);
    this.collection.bind("remove", this.render);
  },
  setSearchResultsView: function(srv) {
    this.srv = srv;
    this.srv.bind("render", this.render);
  },
  render: function() {
    // find each .mo that is in the queue, and highlight it + bump it up
    this.collection.each( function(m) {
      // After applying filters, currently-selected items may not be drawn on the map -- check first!
      if( true != _.isUndefined( SearchApp.searchResultsView.mo[ m.get('productId') ] )) {
        SearchApp.searchResultsView.mo[ m.get('productId') ].setOptions({
          fillColor: '#7777FF',
          fillOpacity: 0.5,
          strokeColor: '#333399',
          strokeOpacity: 0.5,
          zIndex: 1500
        });
      }
    });
  }
});

var DownloadQueueSummaryView = Backbone.View.extend(
  {
  initialize: function() {
    _.bindAll(this, "render");
    this.collection.bind("add", this.render);
    this.collection.bind("remove", this.render);
  },

  // Creates a button that can pop the real DownloadQueue
  render:function() {

    var c = ( 0 == this.collection.length ) ? 'empty' : 'nonempty'; // will store class for styling nonempty queue button

    $(this.el).button(
      {
        disabled: ( 0 == this.collection.length ) ? true : false,
        icons: {
          primary: 'ui-icon-folder-open'
        },
        label: _.template('Download queue <span class="<%= className %>">(<%= summary %>)</span>', { summary: this.collection.getTextSummary(), className: c })
      }
    );

    if( 0 != this.collection.length ) {
      $(this.el).effect('highlight');
    }

    return this;
  }
});

var DownloadQueueView = Backbone.View.extend(
  {
  // this div is already present in the static DOM upon page load
  id: "download_queue",

  initialize: function() {
    _.bindAll(this, "render");
    this.collection.bind('queue:remove', this.render );
  },
 
  // Renders the main download queue
  render: function() {

    $(this.el).empty();
    var table = '';

    if( 0 < this.collection.length ) {
      
      this.collection.each( function(m) {
        table = table + _.template('\
<tr>\
<td style="vertical-align: middle; line-height: 30px;">\
<img style="height: 30px; float: left;" src="<%= thumbnail %>" title="<%= productId %>" />\
<span style="height: 30px; display: inline-block;" vertical-align: middle" ><%= filename %></span>\
</div>\
</td>\
<td><%= processingTypeDisplay %></td>\
<td><%= platform %></td>\
<td><%= acquisitionDateText %></td>\
<td><%= sizeText %></td>\
<td>\
<a product_file_id="<%= id %>" product_id="<%= productId %>" class="remove">Remove from queue</a>\
<input type="hidden" name="products[]" value="<%= filename %>" />\
</td>\
</tr>\
', m.toJSON());
      });

      var pageTemplate = { 
        'table': table, 
        'url': AsfDataportalConfig.apiUrl,
        'restricted': ''
      };

      if ( SearchApp.user.getRestrictionTester().containsRestrictedProduct( this.collection ) ) {
        pageTemplate.restricted = '<div class="ui-state-highlight ui-corner-all" style="padding: 1em;">\
          <p><span class="ui-icon ui-icon-info" style="float: left; position: relative; top: -2px; margin-right: .3em;"></span>\
          Your download queue contains some items that are restricted.  You can download the metadata, but you&rsquo;ll\
          need to log in to be able to successfully bulk download the products.</p>\
          </div>';
      }

      $(this.el).html(
        _.template('\
<form id="download_queue_form" action="<%= url %>">\
<%= restricted %>\
<table class="datatable" id="download_queue_table">\
<thead>\
<tr>\
<th>Granule</th>\
<th>Processing</th>\
<th>Platform</th>\
<th>Acquisition Date</th>\
<th>Size</th>\
<th>Tools</th>\
</tr>\
</thead>\
<tbody> <%= table %> </tbody>\
</table>\
<h4 style="margin: 1em 0; font-weight: bold;">About bulk download</h4>\
<p style="margin: 1em 0; line-height: 120%;">\
This search tool uses the <strong>.metalink</strong> format to support bulk downloads of data.<br/>\
<a style="margin-top: 1ex;" target="_blank" href="http://www.asf.alaska.edu/program/sdc/bulk_download" id="get_bulk_download">Get a bulk download client</a>\
</p>\
<div class="footer_controls" style="margin-top: 1em; padding-top: 1ex; border-top: 1px solid #888">\
<div id="download_queue_formats">\
<input type="hidden" name="format" value="metalink" id="format_specifier" />\
<input class="downloader" type"button" value="metalink" id="download_type_metalink" />\
<input class="downloader" type="button" value="csv" id="download_type_csv" />\
<input class="downloader" type="button" value="kml" id="download_type_kml" />\
</div>\
</div>\
</form>\
', pageTemplate ));

      $(this.el).find('#get_bulk_download').button({ icons: { primary: "ui-icon-newwin" }});
      $(this.el).find('a.remove').button(
        {
          'label': 'Remove',
          'icons': {
            'primary':'ui-icon-circle-minus'
          }
        }
      ).bind( "click", { 'collection':this.collection }, function(e) {
        $( e.currentTarget.parentNode.parentNode ).hide('blind');
        e.data.collection.remove( SearchApp.searchResults.get( $(e.currentTarget).attr('product_id') ).files.get( $(e.currentTarget).attr('product_file_id') ));
        e.data.collection.trigger('queue:remove');
		
		$("#b_"+$(e.currentTarget).attr('product_file_id')).toggleClass('tool-dequeue');
		$("#b_"+$(e.currentTarget).attr('product_file_id')).prop('selected','false');
		$("#b_"+$(e.currentTarget).attr('product_file_id')).button( "option", "icons", { primary: "ui-icon-circle-plus" } );
				
      });

      $(this.el).find("#download_queue_table").dataTable(
        {
        "bFilter" : false,
        "bLengthChange" : false,
        "bPaginate" : false,
        "bJQueryUI": true
      });

      $(this.el).find("#download_type_metalink").button( { icons: { primary: "ui-icon-circle-arrow-s" }, label:'Bulk Download (.metalink)'} ).click( function() {
        $('#format_specifier').val( 'metalink');
        $('#download_queue_form').submit();
      });
      $(this.el).find("#download_type_csv").button( { icons: { primary: "ui-icon-circle-arrow-s" }, label:'Download Metadata (.csv)'} ).click( function() {
        $('#format_specifier').val( 'csv');
        $('#download_queue_form').submit();
      });
      $(this.el).find("#download_type_kml").button( { icons: { primary: "ui-icon-circle-arrow-s" }, label:'Google Earth (.kml)'} ).click( function() {
        $('#format_specifier').val( 'kml');
        $('#download_queue_form').submit();
      });

      $(this.el).find('img').error( function() { $(this).remove(); });

    } else {

      $(this.el).html(
        _.template('\
<div class="ui-widget">\
        <div class="ui-state-highlight ui-corner-all" style="margin-top: 20px; padding: 0pt 0.7em;">\
          <p style="padding: 1em"><span class="ui-icon ui-icon-info" style="float: left; margin-right: 0.3em;"></span>\
          Your download queue is currently empty.</p>\
        </div>\
      </div>\
')
      );  
    }
   
    $(this.el).dialog(
      {
        modal: true,
        width: 800,
        draggable: false,
        resizable: false,
        title: _.template("Download queue (<%= summary %>)", { 'summary':this.collection.getTextSummary() }),
        position: "top"
      }
    );
  
    return this;
    
  }
}
);
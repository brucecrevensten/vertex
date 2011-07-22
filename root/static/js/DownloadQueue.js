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
<td>\
<img src="<%= thumbnail %>" title="<%= productId %>" />\
<input type="hidden" name="filename[]" value="<%= filename %>" />\
</td>\
<td><%= processingTypeDisplay %></td>\
<td><%= platform %></td>\
<td><%= acquisitionDate %></td>\
<td><%= sizeText %></td>\
<td><a product_file_id="<%= id %>" product_id="<%= productId %>" class="remove">Remove from queue</a>\
</tr>\
', m.toJSON());
      });

      $(this.el).html(
        _.template('\
<form id="download_queue_form" action="<%= url %>">\
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
<div class="footer_controls">\
<button type="submit" id="do_queue_download" class="tool_download" name="Download">Download</button>\
<div id="download_queue_formats">\
<input checked="checked" type="radio" name="format" value="metalink" id="download_type_metalink" /><label for="download_type_metalink">Bulk Download (.metalink)</label>\
<input type="radio" name="format" value="csv" id="download_type_csv" /><label for="download_type_csv">Spreadsheet (.csv)</label>\
<input type="radio" name="format" value="kml" id="download_type_kml" /><label for="download_type_kml">Google Earth (.kml)</label>\
</div>\
</div>\
</form>\
', { table: table, url: AsfDataportalConfig.apiUrl } ));

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
      });

      $(this.el).find("#download_queue_table").dataTable(
        {
        "bFilter" : false,
        "bLengthChange" : false,
        "bPaginate" : false,
        "bJQueryUI": true
      });

      $(this.el).find("#download_queue_formats").buttonset();
      $(this.el).find("#do_queue_download").button( { icons: { primary: "ui-icon-circle-arrow-s" }}).focus();

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

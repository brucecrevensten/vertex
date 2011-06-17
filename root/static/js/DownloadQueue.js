var DownloadQueue = Backbone.Collection.extend(
  {
  url: AsfDataportalConfig.apiUrl,
  model:DataProduct,

  getSizeInBytes:function() {
    return _.reduce(
      this.pluck("BYTES"),
      function(memo, size) {
        return memo + size;
      },
      0
    );
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

    var t; // will identify text fragment in summary button
    var c; // will store class for styling nonempty queue button
    if ( 0 == this.collection.length ) {
      t = 'empty';
      c = 'empty';
    } else {
      c = 'nonempty';
      t = this.collection.length.toString();
      if ( 1 == this.collection.length ) {
        t = t + ' item';
      } else {
        t = t + ' items';
      }
      t = t + ', ' + AsfUtility.bytesToString( this.collection.getSizeInBytes() ); 
    }

    $(this.el).button(
      {
      disabled: ( 0 == this.collection.length ) ? true : false,
      icons: {
        primary: 'ui-icon-folder-open'
      },
      label: _.template('Download queue <span class="<%= class %>">(<%= summary %>)</span>', { summary: t, class: c })
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
  },

  // Renders the main download queue
  render: function() {

    var table = '';
    this.collection.each( function(m) {
      table = table + _.template('\
<tr>\
<td>\
<%= GRANULENAME %>\
<input type="hidden" name="granule_list[]" value="<%= GRANULENAME %>" />\
</td>\
<td><%= PROCESSINGTYPE %></td>\
<td><%= PLATFORM %></td>\
<td><%= ACQUISITIONDATE %></td>\
<td><%= sizeText %></td>\
</tr>\
', m.toJSON());
    });

    $(this.el).html(
      _.template('\
<form id="download_queue_form" action="<%= url %>">\
<table class="datatable" id="download_queue_table">\
<thead>\
<tr>\
<th>Granule Name</th>\
<th>Processing</th>\
<th>Platform</th>\
<th>Acquisition Date</th>\
<th>Size</th>\
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

      $(this.el).find("#download_queue_table").dataTable(
        {
        "bFilter" : false,
        "bLengthChange" : false,
        "bPaginate" : false,
        "bJQueryUI": true
      });

      $(this.el).find("#download_queue_formats").buttonset();
      $(this.el).find("#do_queue_download").button( { icons: { primary: "ui-icon-circle-arrow-s" }}).focus();

      return this;
    }
  }
);

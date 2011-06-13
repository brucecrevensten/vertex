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
    },
  
    getSizeAsText:function() {

      var bytes = this.getSizeInBytes();
      var kilobyte = 1024;
      var megabyte = kilobyte * 1024;
      var gigabyte = megabyte * 1024;
      var terabyte = gigabyte * 1024;
      var precision = 2;
     
      if (bytes < kilobyte) {
          return bytes + ' B';
      } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
          return (bytes / kilobyte).toFixed(precision) + ' KB';
   
      } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
          return (bytes / megabyte).toFixed(precision) + ' MB';
   
      } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
          return (bytes / gigabyte).toFixed(precision) + ' GB';
   
      } else if (bytes >= terabyte) {
          return (bytes / terabyte).toFixed(precision) + ' TB';
   
      } 
    },
  
  }
);

var DownloadQueueSummaryView = Backbone.View.extend(
  {
    initialize: function() {
      _.bindAll(this, "render");
      this.collection.bind("add", this.render);
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
        t = t + ', ' + this.collection.getSizeAsText(); 
      }

      $(this.el).button(
        {
          icons: {
            primary: 'ui-icon-folder-open'
          },
          label: _.template('Download queue <span class="<%= class %>">(<%= summary %>)</span>', { summary: t, class: c })
        }
      );

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

      var list = this.collection.reduce( 
        function(memo, dp)
        {
          return memo + _.template('\
<li>\
<input type="hidden" name="granule_list" value="<%= GRANULENAME %>" />\
<%= GRANULENAME %>\
</li>\
', dp.toJSON() )
        },
        ''
      );
      $(this.el).html(
        _.template('\
<form id="download_queue_form" action="<%= url %>">\
<ul><%= queue %></ul>\
<div id="download_queue_formats">\
<input checked="checked" type="radio" name="format" value="metalink" id="download_type_metalink" /><label for="download_type_metalink">Bulk Download (.metalink)</label>\
<input type="radio" name="format" value="csv" id="download_type_csv" /><label for="download_type_csv">Spreadsheet (.csv)</label>\
<input type="radio" name="format" value="kml" id="download_type_kml" /><label for="download_type_kml">Google Earth (.kml)</label>\
</div>\
<button type="submit" id="do_queue_download" name="Download">Download</button>\
</form>\
', { queue: list, url: AsfDataportalConfig.apiUrl } ));

      $(this.el).find("#download_queue_formats").buttonset();

      $(this.el).find("#do_queue_download").button( { icons: { primary: "ui-icon-circle-arrow-s" }}).focus();

      return this;
    }

  }
);

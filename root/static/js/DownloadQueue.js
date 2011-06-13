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

var DownloadQueueView = Backbone.View.extend(
  {
    // this div is already present in the static DOM upon page load
    id: "download_queue",

    initialize: function() {
      _.bindAll(this, "render");
      this.collection.bind("change", this.renderSummaryButton);
    },

    // Creates a button that can pop the real DownloadQueue
    renderSummaryButton:function() {

      var t; // will identify text fragment in summary button
      var c = '';
      if ( 0 == this.collection.length ) {
        t = 'empty';
      } else {
        t = this.collection.length.toString();
        if ( 1 == this.collection.length ) {
          t = t + ' item';
        } else {
          t = t + ' items';
        }
        c = ' class="nonempty"';
        t = t + ', ' + this.collection.getSizeAsText(); 
      }

      return _.template('\
<div id="queue_button">\
Download queue <span<%= class %>>(<%= summary %>)</span>\
</div>\
', { summary: t, class: c });
    },

    // Renders the main download queue
    render: function() {

      var list = this.collection.reduce( 
        function(memo, dp)
        {
          return memo + _.template('<li><%= GRANULENAME %></li>', dp.toJSON() )
        },
        ''
      );
      $(this.el).append( '<ul>'+list+'</ul>' );
      $(this.el).append(
        _.template('\
<input type="radio" name="download_type" value="metalink" id="download_type_metalink" /><label for="download_type_metalink">Bulk Download (.metalink)</label>\
<input type="radio" name="download_type" value="csv" id="download_type_csv" /><label for="download_type_csv">Spreadsheet (.csv)</label>\
<input type="radio" name="download_type" value="kml" id="download_type_kml" /><label for="download_type_kml">Google Earth (.kml)</label>\
<input type"button" id="do_queue_download" name="Download"/>\
'));
      /*
      $(this.el).dialog(
        {
          modal: true,
          width: 800,
          draggable: false,
          resizable: false,
          title: "Download queue",
          position: "top"
        }
      );
*/
      return this;
    }

  }
);

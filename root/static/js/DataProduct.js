var DataProduct = Backbone.Model.extend(
  {
  initialize: function() {
    this.set( {sizeText: AsfUtility.bytesToString(this.get('BYTES'))} );
  }
}
);

var DataProductView = Backbone.View.extend(
  {
    render: function() {
      $(this.el).html(
        _.template('\
<img src="<%= BROWSE %>" />\
<a class="tool_download" style="float: right;" href="<%= URL %>">Download</a>\
<ul>\
<li>Processing type: <%= PROCESSINGTYPE %></li>\
<li>Beam mode: <%= BEAMMODEDESC %></li>\
<li>Frame: <%= FRAMENUMBER %></li>\
<li>Path/Orbit: <%= PATHNUMBER %> / <%= ORBIT %></li>\
<li>Start time: <%= STARTTIME %></li>\
<li>End time: <%= ENDTIME %></li>\
<li>Faraday rotation: <%= FARADAYROTATION %></li>\
<li>Ascending/Descending: <%= ASCENDINGDESCENDING %></li>\
<li>Off Nadir Angle: <%= OFFNADIRANGLE %></li>\
<li>Size: <%= sizeText %></li>\
</ul>\
        ', this.model.toJSON())
      );
      $(this.el).find('a').button(
      {
        icons: {
          primary: "ui-icon-circle-arrow-s"
        },
        text: 'Download' 
      }
      );

      return this;

    }
  }
);

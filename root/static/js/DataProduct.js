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
<div id="hanger">\
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
<a class="tool_download" href="<%= URL %>">Download</a>\
</div>\
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

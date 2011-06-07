var DataProduct = Backbone.Model.extend();

var DataProductView = Backbone.View.extend(
  {
    render: function() {
      $(this.el).html(
        _.template('\
<img src="<%= BROWSE %>" />\
<ul>\
<a style="float: right;" href="<%= URL %>">Download</a>\
<li>Processing type: <%= PROCESSINGTYPE %></li>\
<li>Beam mode: <%= BEAMMODEDESC %></li>\
<li>Frame: <%= FRAMENUMBER %></li>\
<li>Path/Orbit: <%= PATHNUMBER %> / <%= ORBIT %></li>\
<li>Start time: <%= STARTTIME %></li>\
<li>End time: <%= ENDTIME %></li>\
<li>Faraday rotation: <%= FARADAYROTATION %></li>\
<li>Ascending/Descending: <%= ASCENDINGDESCENDING %></li>\
<li>Off Nadir Angle: <%= OFFNADIRANGLE %></li>\
</ul>\
        ', this.model.toJSON())
      );
      $(this.el).find('a').button();
      return this;
    }
  }
);

var DataProductController = Backbone.Controller.extend(
  {
    download: function() {
    
    },
    displayOnMap: function() {
    
    }
  }
);

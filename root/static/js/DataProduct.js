var DataProductFile = Backbone.Model.extend( {} );

var DataProductFiles = Backbone.Collection.extend( { 
  model: DataProductFile
});

var DataProduct = Backbone.Model.extend({
  initialize: function() {
    this.name = 'DataProduct';
    this.files = new DataProductFiles();
  }
});

var DataProductView = Backbone.View.extend(
  {
    width: 500, // width of the rendered Product Profile; will be changed depending on missing image, etc
    getTemplate: function() {
      switch(this.model.PLATFORM) {
        case 'ALOS': return '\
<ul class="metadata">\
<li><span>Processing type</span>: <%= PROCESSINGTYPE %></li>\
<li><span>Beam mode</span>: <%= BEAMMODEDESC %></li>\
<li><span>Frame</span>: <%= FRAMENUMBER %></li>\
<li><span>Path</span>: <%= PATHNUMBER %></li>\
<li><span>Start time</span>: <%= STARTTIME %></li>\
<li><span>End time</span>: <%= ENDTIME %></li>\
<li><span>Faraday rotation</span>: <%= FARADAYROTATION %></li>\
<li><span>Ascending/Descending</span>: <%= ASCENDINGDESCENDING %></li>\
<li><span>Off Nadir Angle</span>: <%= OFFNADIRANGLE %></li>\
</ul>\
';
        case 'UAVSAR': return '\
<ul class="metadata">\
<li><span>Processing type</span>: <%= PROCESSINGTYPE %></li>\
<li><span>Beam mode</span>: <%= BEAMMODEDESC %></li>\
<li><span>Start time</span>: <%= STARTTIME %></li>\
<li><span>End time</span>: <%= ENDTIME %></li>\
</ul>\
';

        default: return '\
<ul class="metadata">\
<li><span>Processing type</span>: <%= PROCESSINGTYPE %></li>\
<li><span>Beam mode</span>: <%= BEAMMODEDESC %></li>\
<li><span>Frame</span>: <%= FRAMENUMBER %></li>\
<li><span>Orbit</span>: <%= ORBIT %></li>\
<li><span>Start time</span>: <%= STARTTIME %></li>\
<li><span>End time</span>: <%= ENDTIME %></li>\
<li><span>Faraday rotation</span>: <%= FARADAYROTATION %></li>\
<li><span>Ascending/Descending</span>: <%= ASCENDINGDESCENDING %></li>\
</ul>\
';

      }
    },
    render: function() {

      var ur = SearchApp.user.getWidgetRenderer();
      $(this.el).html( ur.ppBrowse( this.model ));
      this.width = ur.ppWidth;
      $(this.el).append( _.template( this.getTemplate(), this.model.toJSON()));      
      $(this.el).append( ur.ppFileList( this.model ));
      return this;

    }
  }
);

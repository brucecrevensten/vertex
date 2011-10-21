var PathFrameWidgetComponent = BaseWidget.extend({
  initialize: function() {

  },
  events: {
    "change input" : "changed"
  },
  changed: function(evt){
    var target = $(evt.currentTarget),
    data = {};
    data[target.attr('name')] = target.attr('value');
    this.model.set(data);
  },

  // A gotcha!  For ALOS this is correctly named (path) but for other platforms you expect 'orbit'.
  // since the GUI is flexible (displays correctly), the functionality is OK
  render: function(){
    
    var rowData = this.model.toJSON();
    rowData.legend = this.legend;
    rowData.pathLabel = this.pathLabel;

    $(this.el).addClass('pathFrameSelector').html(
      _.template('<fieldset><legend><%= legend %></legend>\
      <label style="width: 3em; display: inline-block; text-align: right; padding-right: 1ex;"><%= pathLabel %></label><input type="text" size="10" name="path" value="<%= path %>"><br/>\
      <label style="width: 3em; display: inline-block; text-align: right; padding-right: 1ex;">Frame</label><input type="text" size="10" name="frame" value="<%= frame %>">\
      </div>', rowData)
    );
    return this;
  }

});

var DirectionWidgetComponent = BaseWidget.extend(
  {

    title: "Direction",
    titleId: "direction_widget_title",
    tagName: "div",
    directionTypes: {
      // value : display name
      "any":"Any",
      "ASCENDING":"Ascending", // key must match value returned by API
      "DESCENDING":"Descending" // key must match value returned by API
    },
    initalize: function() {

    },
    events : {
      "change input" : "changed",
    },

    changed: function(evt) {
      this.model.set( { direction: evt.currentTarget.value },
        { silent: true } );
    },

    render: function() {
      var f = "";
      var checked = this.model.toJSON()["direction"];
      var rowData;
      for( var key in this.directionTypes ) {
         rowData = {
          id: this.model.cid,
          name: this.directionTypes[key],
          value: key,
          ifChecked: ( checked == key ) ? 'checked="checked"' : ''
         };
         f = f + _.template('<label for="filter_direction_<%= name %>_<%= id %>"><%= name %></label><input type="radio" id="filter_direction_<%= name %>_<%= id %>" value="<%= value %>" name="direction" <%= ifChecked %>>', rowData);
      }
      $(this.el).addClass('directionSelector').html( '<ul>'+f+'</ul>' ).buttonset();
    
      return this;
    }
  }
);

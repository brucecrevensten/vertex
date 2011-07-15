var PathFrameWidgetComponent = BaseWidget.extend({
  events: {
    "change input" : "changed"
  },
  changed: function(evt){
    var target = $(evt.currentTarget),
    data = {};
    data[target.attr('name')] = target.attr('value');
    this.model.set(data);
  },
  render: function(){
    
    var rowData = this.model.toJSON();
    rowData.legend = this.legend;
    rowData.pathLabel = this.pathLabel;

    $(this.el).html(
      _.template('<fieldset><legend><%= legend %></legend>\
      <label style="width: 3em; display: inline-block; text-align: right;"><%= pathLabel %>&nbsp;</label><input type="text" size="10" name="path" value="<%= path %>"><br/>\
      <label style="width: 3em; display: inline-block; text-align: right;">Frame&nbsp;</label><input type="text" size="10" name="frame" value="<%= frame %>">\
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
      "ascending":"Ascending",
      "descending":"Descending"
    },

    events : {
      "change input" : "changed",
    },

    changed: function(evt) {
      this.model.set( { direction: evt.currentTarget.value } );
    },

    render: function() {
      var f = "";
      var checked = this.model.toJSON()["direction"];
      for( var key in this.directionTypes ) {
         rowData = {
          name: this.directionTypes[key],
          value: key,
          ifChecked: ( checked == key ) ? 'checked="checked"' : ''
         };
         f = f + _.template('<label for="filter_direction_<%= name %>"><%= name %></label><input type="radio" id="filter_direction_<%= name %>" value="<%= value %>" name="filter_direction" <%= ifChecked %>>', rowData);
      }
      $(this.el).html( '<ul>'+f+'</ul>' );
      $(this.el).buttonset();
    
      return this;
    }
  }
);
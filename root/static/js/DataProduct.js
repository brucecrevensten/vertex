var DataProduct = Backbone.Model.extend();

var DataProductView = Backbone.View.extend(
  {
    render: function() {
      $(this.el).html(
        _.template('<span><%= name %></span>', this.model.toJSON())
      );
      return this.el;
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

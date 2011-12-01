var WCSFormModel = Backbone.Model.extend({
	defaults: {
		paramName: "",
		selected: ""
	},

	getURLParameters: function() {
		var v = {};
		v[this.get("paramName")] = this.get("selected");
		return v;
	}
});

var DataSetModel = WCSFormModel.extend({
	initialize: function() {
		this.set({"paramName": "Dataset"});
	}
});

var OutputProjectionModel = WCSFormModel.extend({
	initialize: function() {
		this.set({"paramName": "OutputProjection"});
	}
});

var ImageFormatModel = WCSFormModel.extend({
	initialize: function() {
		this.set({"paramName": "ImageFormat"});
	}
});

var ImageHeightModel = WCSFormModel.extend({
	initialize: function() {
		this.set({"paramName": "ImageHeight"});
	}
});

var ImageWidthModel = WCSFormModel.extend({
	initialize: function() {
		this.set({"paramName": "ImageWidth"});
	}
});

var InterpolationMethodModel = WCSFormModel.extend({
	initialize: function() {
		this.set({"paramName": "InterpolationMethod"});
	}
});

var WCSFormView = Backbone.View.extend({
	intialize: function() {
		this.enabled = true;	
	}
});

var DataSetView = WCSFormView.extend({	
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});

            console.log(this.model);
		},this));
	}
});

var OutputProjectionView = WCSFormView.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});

            console.log(this.model);
		},this));
	}
});

var ImageFormatView = WCSFormView.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});

            console.log(this.model);
		},this));
	}
});

var ImageHeightView = WCSFormView.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});

            console.log(this.model);
		},this));
	}
});

var ImageWidthView = WCSFormView.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});

            console.log(this.model);
		},this));
	}
});

var InterpolationMethodView = WCSFormView.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});

            console.log(this.model);
		},this));
	}
});

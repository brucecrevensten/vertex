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
});

var OutputProjectionView = WCSFormView.extend({
});

var ImageFormatView = WCSFormView.extend({
});

var ImageHeightView = WCSFormView.extend({
});

var ImageWidthView = WCSFormView.extend({
});

var InterpolationMethodView = WCSFormView.extend({
});

/**** Form Element Models *****************************/
// The purpose of these models are to store metadata
////
var DataSetM = new Backbone.Model.extend({
	defaults: {
		url: "",		
		name: "",	// Name of the Dataset that will be displayed in a dropdownish menu
		selectedLayer: "",	// Name of the layer that is selected
		layers: null		// list of layers that will populate a dropdownish menu
	}, 
	intialize: function() {
		
	}
});

var DataSetLayerM = new Backbone.Model.extend({
	defaults: {
		name: ""

	},
	initialize: function() {
		
	}
});

var OutputProjectionM = Backbone.Model.extend({
	defaults: {
		name: ""
	},
	initialize: function() {
	}
});

var InterpolationMethodM = Backbone.Model.extend({
	defaults: {
		name: ""	
	},
	initialize: function() {
	}
});

var ImageFormatM = Backbone.Model.extend({
	defaults: {
		name: ""
	},
	initialize: function() {
	}
});

/*** Form Models ********************************/
// The purpose of a form model is to persist data associated with user input
// It also associates the user input data with internal meta data (Form element models)
/**** */
var WCSFormM = Backbone.Model.extend({
	defaults: {
		paramName: "",
		selected: "", 
	},

	getURLParameters: function() {
		var v = {};
		v[this.get("paramName")] = this.get("selected");
		return v;
	}
});

var DataSetFormLayerM = WCSFormM.extend({
	defaults: {
//		dataSetLayerM: new DataSetLayerM()	
	},
	initialize: function() {
		this.set({"paramName": "COVERAGE" });
		//this.dataSetLayerM = new DataSetLayerM();

	},
	validate: function(attrs) {
		if (attrs.selected != "") {
			
		}
	}
});

var DataSetFormM = WCSFormM.extend({
	defaults: {
	//	dataSetM: null
	},

	initialize: function() {
		this.set({"paramName": "Dataset"});
		this.dataSetMCollection = new Backbone.Collection();
	}
});

var OutputProjectionaFormM = WCSFormM.extend({
	defaults: {
		//outputProjectionM: null
	},
	initialize: function() {
		this.set({"paramName": "OutputProjection"});

	}
});

var InterpolationMethodFormM = WCSFormM.extend({
	defaults: {
		interpolationMethodM: null	
	},
	initialize: function() {
		this.set({"paramName": "InterpolationMethod"});
	}
});

var ImageFormatFormM = WCSFormM.extend({
	initialize: function() {
		this.set({"paramName": "ImageFormat"});
	}
});

var ImageHeightFormM = WCSFormM.extend({
	initialize: function() {
		this.set({"paramName": "ImageHeight"});
	}
});

var ImageWidthFormM = WCSFormM.extend({
	initialize: function() {
		this.set({"paramName": "ImageWidth"});
	}
});


/**** Form Views ******************************/
// The purpose of the form views is to update the form models 
// with user input and render html elements representing the form models
var WCSFormV = Backbone.View.extend({
	intialize: function() {
		this.enabled = true;	
	}
});

var DataSetFormV = WCSFormV.extend({	
	initialize: function() {
		this.dataSetOptions = new Backbone.Collection();
		
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var OutputProjectionFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var ImageFormatFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var ImageHeightFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var ImageWidthFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var InterpolationMethodFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = true;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

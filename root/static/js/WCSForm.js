/**** Form Element Models *****************************/
// The purpose of these models are to store metadata
////
var DataSetM = Backbone.Model.extend({
	defaults: {		
		name: "",	// Name of the Dataset that will be displayed in a dropdownish menu
		selectedLayer: "",	// Name of the layer that is selected
		layers: null,		// list of layers that will populate a dropdownish menu,
		imageFormats: null
	}, 
	intialize: function() {
		
	}
});

var LayerM = Backbone.Model.extend({
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
	},

	validate: function(attrs) {
		if (attrs.selected != undefined) {
			if (this.selectable != undefined && this.selectable != null) {
					var hasAttr = false;
					
					this.selectable.each(function(m) {
						if (m.get("name") == attrs.selected) {
							hasAttr = true;
						}
					});
					if (hasAttr == false) {
						return "Unavailable option";
					}
					
			}
		}
		
	}
});

var LayerFormM = WCSFormM.extend({
	defaults: {
	},
	initialize: function() {
		this.set({"paramName": "COVERAGE" });
		this.selectable = new Backbone.Collection();
	}
	
});

var DataSetFormM = WCSFormM.extend({
	initialize: function() {
		this.set({"paramName": "Dataset"});
		this.selectable = new Backbone.Collection();
	}
});

var OutputProjectionFormM = WCSFormM.extend({
	initialize: function() {
		this.set({"paramName": "OutputProjection"});

	}
});

var InterpolationMethodFormM = WCSFormM.extend({
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
// The purpose of the form views are to update the form models 
// with user input and render html elements representing the form models
var WCSFormV = Backbone.View.extend({
	intialize: function() {
		this.enabled = false;	
	}
});

var DataSetFormV = WCSFormV.extend({	
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var LayerFormV = WCSFormV.extend({	
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});


var OutputProjectionFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var ImageFormatFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var ImageHeightFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var ImageWidthFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

var InterpolationMethodFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
		},this));
	}
});

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

	initialize: function() {
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

		this.get("dataSet").bind("paintChildren", jQuery.proxy(function() {
			this.get("dataSet").trigger('paint');
		},this));

		this.bind('change', jQuery.proxy(function() {	
			this.selectable.each(jQuery.proxy(function(m) {
				if (m.get("name") == this.get("selected")) {
					m.trigger('paint');
				}
			},this));
		},this));
	}
	
});

var DataSetFormM = WCSFormM.extend({
	initialize: function() {
		this.set({"paramName": "Dataset"});
		this.selectable = new Backbone.Collection();

		this.bind('change', function() {
			this.selectable.each(jQuery.proxy(function(m) {
				if (m.get("name") == this.get("selected")) {
					m.trigger('paint');
					m.trigger('paintChildren');
				}
			},this));
		});
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

		this.get("dataSet").bind("paintChildren", jQuery.proxy(function() {
			this.get("dataSet").trigger('paint');
		},this));

		this.bind('change', jQuery.proxy(function() {
			this.selectable.each(jQuery.proxy(function(m) {
				if (m.get("name") == this.get("selected")) {
					m.trigger('paint');
				}
			},this));
			//this.selectable.get(this.get("selected")).trigger('paint');
		},this));
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
	},

	// Change this to be an actual set function that uses a hash parameter
	set: function(el) {
			this.el = el;	
			$(this.el).bind('change', jQuery.proxy(function(e) {
				if (this.enabled) {
					var value = $(this.el).find('select').val();
					this.model.set({selected: value});
				}
			},this));
		},

	disable: function() {
		this.enabled = false;
	}
});

var DataSetFormV = WCSFormV.extend({	
	initialize: function() {
		this.enabled = false;	
		
	},

	render: function() {
		if (this.enabled) {
			$(this.el).empty();

			var html ="<select>";

			this.model.selectable.each(jQuery.proxy(function(m) {
				if (this.model.get("selected") == m.get("name")) {
					html += "<option value="+'"'+m.get("name")+'"'+ "selected="+'"selected"' +  ">"+m.get("name")+"</option>";
				} else {
					html += "<option value="+'"'+m.get("name")+'"'+  ">"+m.get("name")+"</option>";
				}
			},this));
			html += "</select>";
			$(this.el).html(html);
		}
	}
});

var LayerFormV = WCSFormV.extend({	
	initialize: function() {
		this.enabled = false;	

		this.model.get("dataSet").bind('paint', jQuery.proxy(function() {
			console.log(this.viewGroup);
			this.viewGroup.disable();
			this.enabled = true;
			this.viewGroup.clear();
			this.render();
		},this));

		
	},

	render: function() {
		if (this.enabled) {
			$(this.el).empty();

			var html ="<select>";

			this.model.selectable.each(jQuery.proxy(function(m) {
				
				if (this.model.get("selected") == m.get("name")) {
					html += "<option value="+'"'+m.get("name")+'"'+ "selected="+'"selected"' +  ">"+m.get("name")+"</option>";
				} else {
					html += "<option value="+'"'+m.get("name")+'"'+  ">"+m.get("name")+"</option>";
				}
			},this));
			html += "</select>";
			$(this.el).html(html);
		}
	}
});

var OutputProjectionFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		$(this.el).bind("input", jQuery.proxy(function(e) {
		if (this.enabled) {
			var el = $(e.currentTarget);
            this.model.set({"selected":el.val()});
        }
		},this));
	}
});

var ImageFormatFormV = WCSFormV.extend({
	initialize: function(attrs) {
		_.bindAll(this);
		if (attrs.el) {
			this.set(el);
		}

		this.model.get("dataSet").bind('paint', jQuery.proxy(function() {
			console.log(this.viewGroup);
			this.viewGroup.disable();
			this.enabled = true;
			this.viewGroup.clear();
			this.render();
		},this));

		this.enabled = false;	
		
	},

	render: function() {
		if (this.enabled) {
			$(this.el).empty();

			var html ="<select>";

			this.model.selectable.each(jQuery.proxy(function(m) {
								
				if (this.model.get("selected") == m.get("name")) {
					html += "<option value="+'"'+m.get("name")+'"'+ "selected="+'"selected"' +  ">"+m.get("name")+"</option>";
				} else {
					html += "<option value="+'"'+m.get("name")+'"'+  ">"+m.get("name")+"</option>";
				}
			},this));
			html += "</select>";
			$(this.el).html(html);
		}
	}, 

	
	

	
});

var ImageHeightFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		
			$(this.el).bind("input", jQuery.proxy(function(e) {
				if (this.enabled) {
				var el = $(e.currentTarget);
            	this.model.set({"selected":el.val()});
            }
			},this));
			

	}
});

var ImageWidthFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		
			$(this.el).bind("input", jQuery.proxy(function(e) {
				if (this.enabled) {
				var el = $(e.currentTarget);
       	     this.model.set({"selected":el.val()});
       	 }
			},this));
		
	}
});

var InterpolationMethodFormV = WCSFormV.extend({
	initialize: function() {
		this.enabled = false;	
		
			$(this.el).bind("input", jQuery.proxy(function(e) {
				if (this.enabled) {
				var el = $(e.currentTarget);
           	 	this.model.set({"selected":el.val()});
           	 }
			},this));
		
	}
});

var ViewGroupC = Backbone.Collection.extend({
	disable: function(v1) {
		console.log("ASLDKJASDLKJASD");
		this.each(function(v) {
			if (v != v1) {
				console.log(v);
				v.attributes.disable(); 
			}
		});
	},

	clear: function() {
		this.each(function(v) {
			$(v.attributes.el).empty();
		});
	}
});

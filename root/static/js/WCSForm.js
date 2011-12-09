/**** Form Element Models *****************************/
// The purpose of these models are to store metadata
////

var DataSetM = Backbone.Model.extend({
	defaults: { name: "" }, 
});

var LayerM = Backbone.Model.extend({ 
	defaults: { name: "" },
});

var OutputProjectionM = Backbone.Model.extend({
	defaults: { name: "" },
});

var InterpolationMethodM = Backbone.Model.extend({
	defaults: { name: "" },
});

var ImageFormatM = Backbone.Model.extend({
	defaults: { name: "" },
});

/*** Form Models ********************************/
// The purpose of a form model is to persist data associated with user input
// It also associates the user input data with internal meta data (Form element models)
/**** */

// Expects a menuModel
var MenuToggleFormM = Backbone.Model.extend({
	defaults: {
		paramName: "",
		selected: "", 
		selectable: new Backbone.Collection(),
		menuModel: null
	},

	initialize: function(attrs) {
		//this.selectable = new Backbone.Collection();

		this.bindMenuModel(attrs);

		this.bind('change', jQuery.proxy(function() {	
			this.selectable.each(jQuery.proxy(function(m) {
				if (m.get("name") == this.get("selected")) {
					
					this.menuModel.trigger('paint');

					
				//	m.trigger('paint');
				}
			},this));
		},this));
	},

	getURLParameters: function() {
		var v = {};
		v[this.get("paramName")] = this.get("selected");
		return v;
	},

	validate: function(attrs) {
		this.bindMenuModel(attrs);
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
		
	},

	bindMenuModel: function(attrs) {
		if (attrs.menuModel) {
			this.menuModel = attrs.menuModel;
			this.menuModel.bind("paintChildren", jQuery.proxy(function() {
				console.log("Menu Form Trigger paint");
				this.get("menuModel").trigger('paint');
			},this));
		}
	}
});


var MenuToggleSwitchM = Backbone.Model.extend({
	initialize: function() {
		//this.set({"paramName": "Dataset"});
		this.selectable = new Backbone.Collection();

		this.bind('change', function() {
			this.selectable.each(jQuery.proxy(function(m) {
				if (m.get("name") == this.get("selected")) {
					console.log("Triggering paint on " + m.get("name"));
					m.trigger('paint');
					m.trigger('paintChildren');
				}
			},this));
		});
	}
});

var DataSetFormM = MenuToggleSwitchM.extend({
	defaults: {"paramName": "Dataset"}
	
});

var LayerFormM = MenuToggleFormM.extend({
	defaults: { "paramName": "COVERAGE" }
	
});

var OutputProjectionFormM = MenuToggleFormM.extend({
	defaults: {"paramName": "OutputProjection"}
});

var InterpolationMethodFormM = MenuToggleFormM.extend({
	defaults: {"paramName": "InterpolationMethod"},
	
});

var ImageFormatFormM = MenuToggleFormM.extend({
	defaults: {"paramName": "ImageFormat"}
});

var ImageHeightFormM = MenuToggleFormM.extend({
	defaults: {"paramName": "ImageHeight"}
});

var ImageWidthFormM = MenuToggleFormM.extend({
	defaults: {"paramName": "ImageWidth"}
});

/**** Form Views ******************************/
// The purpose of the form views are to update the form models 
// with user input and render html elements representing the form models


//// Menu Toggle Views ////////////
var MenuToggleViewV = Backbone.View.extend({
	initialize: function(attrs) {
		this.enabled = false;	
		//console.log("INIT VIEW");
		this.bindMenuModel(attrs);
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
	},

	validate: function(attrs) {
		this.bindMenuMode(attrs);
	},

	bindMenuModel: function(attrs) {
		if (attrs.menuModel) {
			this.menuModel = attrs.menuModel;
			
			this.menuModel.bind('paint', jQuery.proxy(function() {
				console.log("paint view");
				this.viewGroup.disable();
				this.enabled = true;
				this.viewGroup.clear();
				this.render();
			},this));
		}
	}
});

var MenuToggleSelectViewV = MenuToggleViewV.extend({
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

var DataSetFormV = MenuToggleSelectViewV.extend({	
});


var LayerFormV = MenuToggleSelectViewV.extend({
	/*initialize: function() {
		MenuToggleViewV.prototype.initialize.call(this);
		this.render = MenuToggleSelectViewV.prototype.render;	
	}*/
});

var OutputProjectionFormV = MenuToggleSelectViewV.extend({
	/*initialize: function() {
		MenuToggleViewV.prototype.initialize.call(this);
		//this.render = MenuToggleSelectViewV.prototype.render;	
	}*/
});

var ImageFormatFormV = MenuToggleSelectViewV.extend({
	/*initialize: function() {
		MenuToggleViewV.prototype.initialize.call(this);
		this.render = MenuToggleSelectViewV.prototype.render;	
	}*/
});

var InterpolationMethodFormV = MenuToggleSelectViewV.extend({
	/*initialize: function() {
		MenuToggleViewV.prototype.initialize.call(this);
		this.render = MenuToggleSelectViewV.prototype.render;	
	}*/
});

var ViewGroupC = Backbone.Collection.extend({
	disable: function(v1) {
		this.each(function(v) {
			if (v != v1) {
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

// Requires that menuForm, menuModel, and menuView are supplied
var MenuToggle = Backbone.Model.extend({
	initialize: function(attrs) {
		this.menuForm = attrs.menuForm;
		this.menuModel = attrs.menuModel;
		this.menuView = attrs.menuView;
		this.selectable = attrs.selectable;
		this.menuForm.selectable = this.selectable;
	},

});

var CombinantMenuToggle = Backbone.Model.extend({
	initialize: function(attrs) {
		this.setupGroup(attrs);
	},

	validate: function(attrs) {
		this.setupGroup(attrs);
	},

	setupGroup: function(attrs) {
		if (attrs.menuToggleList) {
			this.menuToggleList = attrs.menuToggleList;
		
			var group = new ViewGroupC();
	
			for (name in this.menuToggleList) {
				group.add(this.menuToggleList[name].menuView);
				this.menuToggleList[name].menuView.viewGroup = group;
			}
		}
	}
});

/** Not sure about these ones yet ***/
/*
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
*/
/*****************************/


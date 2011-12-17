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
		this.bindMenuModel(attrs);
		console.log("Menu toggle init");
		//this.set({'selected': this.selectable.get(0)}); // initialize selected to be first element from selected list
		this.bind('change', jQuery.proxy(function() {	
		this.menuModel.trigger('paint');
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
			this.urlList = attrs.menuModel.get("urlList");
			this.menuModel.bind("paintChildren", jQuery.proxy(function() {
				this.get("menuModel").trigger('paint');
			},this));
		}
	}
});


var MenuToggleSwitchM = Backbone.Model.extend({
	initialize: function() {
		this.selectable = new Backbone.Collection();

		this.bind('change', function() {
			this.selectable.each(jQuery.proxy(function(m) {
				if (m.get("name") == this.get("selected")) {
					m.trigger('paint');
				}
			},this));
		});
	}
});

var DataSetFormM = MenuToggleSwitchM.extend({
	//defaults: {"paramName": "Dataset"}
	
});

var LayerFormM = MenuToggleFormM.extend({
	//defaults: { "paramName": "COVERAGE" }
	
});

var OutputProjectionFormM = MenuToggleFormM.extend({
	//defaults: {"paramName": "OutputProjection"}
});

var InterpolationMethodFormM = MenuToggleFormM.extend({
	//defaults: {"paramName": "InterpolationMethod"},
	
});

var ImageFormatFormM = MenuToggleFormM.extend({
	//defaults: {"paramName": "ImageFormat"}
});

var ImageHeightFormM = MenuToggleFormM.extend({
	//defaults: {"paramName": "ImageHeight"}
});

var ImageWidthFormM = MenuToggleFormM.extend({
	//defaults: {"paramName": "ImageWidth"}
});

/**** Form Views ******************************/
// The purpose of the form views are to update the form models 
// with user input and render html elements representing the form models


//// Menu Toggle Views ////////////
var MenuToggleViewV = Backbone.View.extend({
	initialize: function(attrs) {
		this.enabled = false;	
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

var ViewGroupM = Backbone.Model.extend({
	initialize: function() {
		this.group = [];
	},

	disable: function() {	
		for (i in this.group) {
				this.group[i].disable();
		}
	},

	clear: function() {
		for ( i in this.group) {
			$(this.group[i].el).empty();
		}
	},

	add: function(o) {
		this.group.push(o);
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
		this.menuForm.view = this.menuView;

		// Might move this somewhere else
		try { 
			this.menuForm.set({"selected": this.selectable.toArray()[0].get("name")});
			} catch(e) {
				console.log("Exception: " + e.toString());
			}
	//	this.menuForm.set({"selected": this.selectable.get(0)});
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
		
			var group = new ViewGroupM();
	
			for (name in this.menuToggleList) {
				group.add(this.menuToggleList[name].menuView);
				this.menuToggleList[name].menuView.viewGroup = group;
			}
		}
	},
	printEnabled: function() {
		for (name in this.menuToggleList) {
			console.log(this.menuToggleList[name].menuModel.get("name") +  " " +  this.menuToggleList[name].menuView.enabled);		
		}
	}
});

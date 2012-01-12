/**** Form Element Models *****************************/
// The purpose of these models are to store metadata
////
var MapEvent = Backbone.Model.extend();

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

var ProjectionM = Backbone.Model.extend({
	defaults: { name: "" },
});

var ImageWidthM = Backbone.Model.extend({
	defaults: { name: "" },
});

var ImageHeightM = Backbone.Model.extend({
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
		//console.log("Menu toggle init");
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
			//console.log(attrs);
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
					m.trigger('updated');
				}
			},this));
		});
	}
});

// The map form 
var BboxM = MenuToggleFormM.extend({
	
});
//

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
		set2: function(el) {
			this.el = el;
			this.bindFunc(this.eventName);
			//this.bindFunc()	
			/*$(this.el).bind('change', jQuery.proxy(function(e) {

				if (this.enabled) {
				//	console.log("CHANGE CHANGE CHANGE");
					// IM HERE
					//console.log($(this.el));
					var value = $(this.el).find('select').val();
					console.log("The value is: " + value);
					this.model.set({selected: value});
				}
			},this));*/
		},
		set3: function(elList) {
			this.elList = elList;
			this.bindFunc(this.eventName);
			//this.bindFunc()	
			/*$(this.el).bind('change', jQuery.proxy(function(e) {

				if (this.enabled) {
				//	console.log("CHANGE CHANGE CHANGE");
					// IM HERE
					//console.log($(this.el));
					var value = $(this.el).find('select').val();
					console.log("The value is: " + value);
					this.model.set({selected: value});
				}
			},this));*/
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
			
			this.menuModel.bind('updated', jQuery.proxy(function() {
				$(this.el).trigger('change');
			},this));

			this.menuModel.bind('paint', jQuery.proxy(function() {
				//console.log("paint detected");
				this.viewGroup.disable();
				this.enabled = true;
				this.viewGroup.clear();
				this.render();

			},this));
		}
	},

	bindSelect: function(ev) {
		//console.log("INVOKING BINDSELECT");
		$(this.el).bind(ev, jQuery.proxy(function(e) {
		//	console.log("bindSelect()");
				if (this.enabled) {
					var value = $(this.el).find('select').val();
					this.model.set({selected: value});
				}
			},this));
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

var MenuToggleInputViewV = MenuToggleViewV.extend({
	render: function() {
		if (this.enabled) {
			var html="";
          if (this.model.get("selected") != null) {
            html = "<input value="+'"'+this.model.get("selected") +'"'+"></input>";
          } else {
           // console.log("EMPTY INPUT");
            html="<input></input>"
          }
           $(this.el).html(html);
		}
	}
});



/*var DataSetFormV = MenuToggleSelectViewV.extend({	
});
*/

var DataSetFormV = MenuToggleViewV.extend({
	render: function() {
		if (this.enabled) {
			$(this.el).empty();

			var html = '<div id="accordion">';
			var idx=0;
			this.model.selectable.each(jQuery.proxy(function(m) {

				html+= '<h3><a href="#'+ " idx="+idx+'" selectedName="'+m.get("name")+'">'+ m.get("name") +'</a></h3>';
				html+= '<div id='+'layer_'+idx+'>'+ 
			
				'<div name="layer" class="WCSfields"></div>'+'</div>';

				idx++;
			},this));
			html += "</div>";
			$(this.el).html(html);
			
			if (!this.rendered) {
			idx=0;
			this.model.selectable.each(jQuery.proxy(function(m) {
				var layers = this.model.get("layers");
				var layer = layers[m.get("name")];

				var layerElement = $('#layer_'+idx);
				layer.menuView.set2(layerElement);
				idx++;

			},this));

			}

			this.rendered=1;


			$( "#accordion" ).accordion({ fillSpace: true });
		}
	},

	bindAccordion: function(el) {
		$(el).bind('accordionchange', jQuery.proxy(function(event, ui) {

			var selectedHeader = $(event.target).find('h3[aria-selected="true"]');
			var selectedName = selectedHeader.find('a').attr('selectedName');

			var layer_id = selectedHeader.find('a').attr('idx');

			layer_id = "layer_"+layer_id;

			this.model.set({"selected":selectedName});

		},this));
	}
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
				//console.log("Exception: " + e.toString());
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

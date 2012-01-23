// Purpose: Handle generation of request. Does not actually submit the request
//          it only packages up the request and acts as a broker between the form 
//          and the ajax request
var RequestGenerator = Backbone.Collection.extend(
  {
      merge: function(json1, json2) {
        for (var key in json2) {
          json1[key] = json2[key]
        }
        return json1;
      },

   		// Merge the form parameters into a single JSON request
  		getJSONRequestParameters: function() {
  			if (this.length == 0) {
  				return null;
  			}

  			var json={};
  			this.each(jQuery.proxy(function(f) {
          
         if (f.view != undefined && f.view != null) {
            if (f.view.enabled) {
            }
  				  if (f.view.enabled && f.get("selected") != "" && f.get("selected") != null
            && f.get("selected") != undefined) { 
                _.extend(json, f.getURLParameters());
  				  }
          } else {
              _.extend(json, f.getURLParameters());
          }
  			},this));

  			if (JSON.stringify(json) == "{}") {
  				return null;
  			}

  			return json;
  		},

      getStrRequestFromJSON: function(json) {
        var paramArray = [];
        for (paramName in json) {
          paramArray.push(paramName + '='+ json[paramName]);
        } 
        var strReq = paramArray.join('&');
        return strReq;
      } 
  });



  var FormSubmitter = Backbone.Model.extend(
  {
      defaults: {
        requestURL: "",
      },

      // We make the collection of all forms into a Dictionary 
      // so that we do not have to refer to certain search parameter objects
      // through array index notation but can refer directly by name while still
      // maintaining a collection-like appearence of the form objects. 
      initialize: function() {
        this.requestGenerator = new RequestGenerator();
        this.formList = new Dictionary();
        $('#hifrm').contents().find('body').find('form').unbind();
        $('#hifrm').contents().find('body').empty();

        $('#hifrm').contents().find('body').append('<form id="formSub" action="" method="post" target="_blank"></form>')

        $('#hifrm').contents().find('body').find('form').submit(jQuery.proxy(function() {
            this.trigger('submitForm');
         },this));
      },

      submitRequestAJAX: function() {
          // Find the first enabled form's url to submit to
          if (this.get("urlParam")) {
            
            this.formList.values().each(jQuery.proxy(function(form) {
              if (form.view.enabled) {
                this.set({"requestURL": form.urlList[this.get("urlParam")]  } );
                return false; // break out of anonymous function by returning false
              }
            },this));
          }

        this.requestGenerator.reset();

        var formCollection = this.formList.values();
        formCollection.each(jQuery.proxy(function(form) {
            this.requestGenerator.add(form);
        },this));

        var paramJSON = this.requestGenerator.getJSONRequestParameters();

        var paramStr = this.requestGenerator.getStrRequestFromJSON(paramJSON);

        var requestURL = this.get("requestURL");

        // Accessing an iframe 
        $('#hifrm').contents().find('body').find('form').attr('action', requestURL);
        $('#hifrm').contents().find('body').find('form').trigger('submit');
      },


      submitRequestForm: function() {
          // Find the first enabled form's url to submit to
          if (this.get("urlParam")) {
            
            this.formList.values().each(jQuery.proxy(function(form) {
              if (form.view.enabled) {
                this.set({"requestURL": form.urlList[this.get("urlParam")]  } );
                return false; // break out of anon
              }
            },this));
          }
           
        this.requestGenerator.reset();

        var formCollection = this.formList.values();
        formCollection.each(jQuery.proxy(function(form) {
            this.requestGenerator.add(form);
        },this));
        var paramJSON = this.requestGenerator.getJSONRequestParameters();
        var paramStr = this.requestGenerator.getStrRequestFromJSON(paramJSON);

        var requestURL = this.get("requestURL");

        $('#hifrm').contents().find('body').find('form').attr('action', requestURL + paramStr);
        $('#hifrm').contents().find('body').find('form').trigger('submit');

      },

      enable: function(formName) {
        this.formList.dictionary[formName].view.enabled = true;
      },
      disable: function(formName) {
        this.formList.dictionary[formName].view.enabled = false;
      }  
  });

var StateInflator = Backbone.Model.extend({
    initialize: function() {
      _.bindAll(this);
      this.menuToggleList = {};
      window.menuToggleList = {};
      this.menu = {};
      window.menu = {};

    },
    inflate: function(requestURL) {
        var xhr = $.ajax(
        {
          type: "POST",
          url: requestURL,
          context: this,
          success: jQuery.proxy(function(data, textStatus, jqXHR) {
            this.trigger('request_success');
            this.process(data);         
          },this),
          error: jQuery.proxy( function(jqXHR, textStatus, errorThrown) {
            this.trigger('request_error');
      
          }, this)
      } );
    }, 

    process: function(responseData) {
      try {
      this.generateMetadataPersistenceState(responseData);
      } catch(e) {}
      this.generateUserInputPersistenceState();
      this.generateUserInputViews();
      this.generateCombinantMenu();
    },

    generateMetadataPersistenceState: function(responseData) {
      var dataSetDict = {};

      this.generateMap();

      for (dataSetName in responseData["DataSet"]) {
        ds = responseData["DataSet"][dataSetName];

        var dataSetM = new DataSetM();
        
        // Construct the layers
        var layerCollection = new Backbone.Collection();
        for (layerIndex in ds["layers"]) {
          var layer = new LayerM({name: ds["layers"][layerIndex]});
          layerCollection.add(layer);
        }

        // Construct the Image formats
        var imageFormatCollection = new Backbone.Collection();
        for (imageFormatIndex in ds["ImageFormat"]) {
          var imageFormat = new ImageFormatM({name: ds["ImageFormat"][imageFormatIndex]});
          imageFormatCollection.add(imageFormat);
        }

        // Construct the Interpolation Methods
        var interpolationMethodCollection = new Backbone.Collection();
        for (interpolationMethodIndex in ds["InterpolationMethod"]) {
          var interpolation = new InterpolationMethodM({name: ds["InterpolationMethod"][interpolationMethodIndex]});
          interpolationMethodCollection.add(interpolation);
        }

        // Construct the Projection Methods
        var projectionCollection = new Backbone.Collection();
        for (projectionIndex in ds["Projection"]) {
          var projection = new ProjectionM({name: ds["Projection"][projectionIndex]});
          projectionCollection.add(projection);
        }

        // Initialize the Dataset
        dataSetM.set({
            name:dataSetName,
            layers:layerCollection,
            // andy - add spatial extent retrieval here.
            urlList: { WCSURL:ds["wcsUrl"], WMSURL:ds["wmsUrl"] },
            imageFormats:imageFormatCollection,
            interpolationMethod:interpolationMethodCollection,
            projection: projectionCollection,
            boundsLeft: ds["boundsLeft"],
            boundsBottom: ds["boundsBottom"],
            boundsRight: ds["boundsRight"],
            boundsTop: ds["boundsTop"]
        });
        dataSetDict[dataSetName] = dataSetM;
      }

      // Attach the Dictionary of Datasets to the window
      this.dataSetDict = dataSetDict;
      window.dataSetDict = dataSetDict;

    },

       generateMap: function() {
        this.mapEvent = new MapEvent();
        window.mapEvent = this.mapEvent;

        var boxlayer;

        var map = new OpenLayers.Map('map', { 
          projection: "EPSG:4326",            // FIXME: pull from json return?
        });

        // used to display bounding box control
        var control = new OpenLayers.Control();
        OpenLayers.Util.extend(control, {
          draw: function () {
            // this Handler.Box will intercept the shift-mousedown
            // before Control.MouseDefault gets to see it
            this.box = new OpenLayers.Handler.Box( control,
              {"done": this.retain},
              {keyMask: OpenLayers.Handler.MOD_SHIFT});
            this.box.activate();
          },
          retain: jQuery.proxy(function (bounds) {
            var ll = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.left, bounds.bottom));
            var ur = map.getLonLatFromPixel(new OpenLayers.Pixel(bounds.right, bounds.top));
            var bbox = new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
            var feature = new OpenLayers.Feature.Vector(bbox.toGeometry(), null, { 
              strokeColor: "#4040FF",
              strokeOpacity: 1.0,
              strokeWidth: 2,
              fillOpacity: 0.5,
              fillColor: "#8080FF"
            });
            boxlayer.removeAllFeatures();
            boxlayer.addFeatures(feature);



            window.mapEvent.trigger('update_openlayers_bbox');

          },this)
        });
        map.addControl(control);

        
        boxlayer = new OpenLayers.Layer.Vector("Bounding Box");
        map.addLayer(boxlayer);
        // Andy - get the bounding box to stay on top 
        // boxlayer.moveLayerToTop();


        map.addLayers([new OpenLayers.Layer.WMS()]);
        // map.zoomToMaxExtent();
        
        this.map = map;
        window.map = map;

    },

    createMenuSelectable: function(dictionary, selectableKey,  defaults, renderHandle, binding) {
        var menuToggleList = {};
      
        for (key in dictionary) {
  

          var formM = new MenuToggleFormM(_.extend({menuModel: dictionary[key]}, defaults));
         
          var formV = new MenuToggleSelectViewV({model: formM, menuModel: dictionary[key] });
          
          if (renderHandle != null && typeof(renderHandle == "function")) {
            formV.render = renderHandle;
          }

          if (binding != null && binding["name"] != null && 
              binding["callback"] != null && 
              typeof(binding["callback"]) == "function") {
              formV.bindFunc = binding["callback"];
              formV.eventName = binding["name"];        
          }

          var menuToggle = new MenuToggle({
            name: key,
            selectable: dictionary[key].get(selectableKey),
            menuModel:  dictionary[key],
            menuForm:   formM,
            menuView:   formV,
          });

            menuToggleList[key] = menuToggle;
        }
          
        var menu = new CombinantMenuToggle({
            "menuToggleList": menuToggleList,
            menuModel: dictionary[key]
        });

        return menu
    },

    createMenu: function(dictionary, defaults, renderHandle, binding) {
        var menuToggleList = {};
      
        for (key in dictionary) {
          var formM = new MenuToggleFormM(_.extend({menuModel: dictionary[key]}, defaults));
         
          var formV = new MenuToggleViewV({model: formM, menuModel: dictionary[key] });

          if (renderHandle != null && typeof(renderHandle == "function")) {
            formV.render = renderHandle;
          }

          if (binding != null && binding["name"] != null && 
              binding["callback"] != null && 
              typeof(binding["callback"]) == "function") {
    
              formV.bindFunc = binding["callback"];
              formV.eventName = binding["name"];        
          }


          var menuToggle = new MenuToggle({
            name: key,
            selectable: null,
            menuModel:  dictionary[key],
            menuForm:   formM,
            menuView:   formV,
          });

            menuToggleList[key] = menuToggle;
        }
          
        var menu = new CombinantMenuToggle({
            "menuToggleList": menuToggleList,
            menuModel: dictionary[key]
        });


        return menu
    },

    generateCombinantMenu: function() {
        var bindInput = function(event) {
          $(this.el).bind(event, jQuery.proxy(function(e) {
              if (this.enabled) {
                var value = $(this.el).find('input').val();
                this.model.set({selected: value}, {silent:true});
              }
            },this));
        }

      this.menuFactory('LAYERS', this.dataSetDict, "layers", {"paramName":"COVERAGE"},"selectable", 
      function() {
          if (this.enabled) {
            var divId = this.menuModel.get("name").replace(/\s/g, "") + "_check";

            var html='<div id="'+divId+'">';

            this.model.selectable.each(jQuery.proxy(function(m) {
                var str = '<input type="radio" name="'+divId+ '" '  +'id="'+m.get("name")+'"'+" value="+'"'+m.get("name")+'" / >'+'<label for="'+m.get("name") +'">'+m.get("name")+'</label><br /><br />';
                html += str;
            },this));
            html+="</div>"+"</div>"

           $(this.el).html(html);

           $('#'+divId).buttonset();
            
           $('#'+divId).find('input').change( jQuery.proxy(function(event) {
                var name = $(event.currentTarget).attr('name');

                var list = $('input[name="'+name+'"]');

                for (var i=0; i<list.length; i++) {
                  $(list[i]).attr({'checked':false});
                }
                $(event.currentTarget).attr({'checked':true});
                
                $(event.currentTarget.parentNode.parentNode).trigger('changeThis');

            },this) );  
              
             // Check the first Layer 
             try {
              $('#'+divId).find('input')[0].click();
             } catch(e) { }
            

        }
      }, 
        {
          // this changes the layer being displayed
          name: "changeThis",
          callback: function(event) {
              $(this.el).bind(event, jQuery.proxy(function(e) {

                if (this.enabled) {
                  var selectedElement = $(this.el).children().find('input[checked="checked"]');

                  try {
                    var wmsUrl = this.menuModel.get("urlList")["WMSURL"];
                    var layerVal = $(selectedElement).val();
                    var boundsLeft = this.menuModel.get("boundsLeft");
                    var boundsBottom = this.menuModel.get("boundsBottom");
                    var boundsRight = this.menuModel.get("boundsRight");
                    var boundsTop = this.menuModel.get("boundsTop");
                    this.model.set({"selected":layerVal},{silent:true});
                    
                    // iterate through all layers and destroy them
                    for (var i=0; i<map.layers.length; i++) {
                      if (window.map.layers[i].name != "Bounding Box") {
                        window.map.layers[i].destroy();
                      } 
                    }
                      
                      var worldMap = new OpenLayers.Layer.WMS(
                        "OpenLayers WMS",
                        "http://vmap0.tiles.osgeo.org/wms/vmap0",
                        {'layers':'basic'},
                        {isBaseLayer: true} );
                      window.map.addLayer(worldMap);
                      
                      // create a new layer which will be displayed
                      // this should be based upon the
                      var newLayer = new OpenLayers.Layer.WMS(
                                            layerVal,
                                            wmsUrl,
                                            {layers: layerVal, CRS: "EPSG:4326", transparent: "true"},
                                            {isBaseLayer: false}  
                                      );

                      // add our new layer and display it
                      window.map.addLayer(newLayer);

                      window.map.zoomToMaxExtent();
                      // var newLayerExtent = new OpenLayers.Bounds(121.00088135454, -19.99984094179, 147.501182236066, -9.99937503771669);
                      var newLayerExtent = new OpenLayers.Bounds(boundsLeft, boundsBottom, boundsRight, boundsTop);
                      window.map.zoomToExtent(newLayerExtent);

                      // map.setBaseLayer(worldMap); 
                      // map.setBaseLayer(newLayer); 
        
                  } catch(e){
                  }

              }
            },this));

          }
        }
      );

        this.menuFactory('IMAGEFORMATS', this.dataSetDict, "imageFormats", {"paramName":"format"},"selectable",null,
        {
          name: "change",
          callback: MenuToggleViewV.prototype.bindSelect
        }
        );
        this.menuFactory('INTERPOLATION', this.dataSetDict, "interpolationMethod", {"paramName":"InterpolationMethod"},"selectable",null,
        {
          name: "change",
          callback: MenuToggleViewV.prototype.bindSelect
        });
        this.menuFactory('PROJECTION', this.dataSetDict, "projection", {"paramName":"CRS"}, "selectable",null,
        {
          name: "change",
          callback: MenuToggleViewV.prototype.bindSelect
        });
        
        this.menuFactory('IMAGEWIDTH', this.dataSetDict, null, {"paramName": "width"}, "default", 
        //MenuToggleInputViewV.prototype.render, 
        function() {
            if (this.enabled) {
              var html="";
                  if (this.model.get("selected") != null) {
                    html = "<input value="+'"'+this.model.get("selected") +'"'+"></input>";
                  } else {
                 
                    html="<input></input>"
                  }
                   $(this.el).html(html);
            }
        },

        {
            name: "change",
            callback: bindInput
        });
        this.menuFactory('IMAGEHEIGHT', this.dataSetDict, null, {"paramName": "height"}, "default", 
  
        function() {
            if (this.enabled) {
              var html="";
                  if (this.model.get("selected") != null) {
                    html = "<input value="+'"'+this.model.get("selected") +'"'+"></input>";
                  } else {
                    html="<input></input>"
                  }
                   $(this.el).html(html);
            }
        },
        {
            name: "change",
            callback: bindInput
        });

       this.menuFactory('BBOX', this.dataSetDict, null, {"paramName":"bbox"}, "default", 
        function() {
            if (this.enabled) {
              try {
                    var html="";
                      // We're going to draw each of the input boxes for a given bbox
                        if (this.model.get("selected") != null && this.model.get("selected") != undefined
                            && this.model.get("selected") != "") {
                          $(this.elList[index]).empty();
                          var html="";
                            
                          // By convention the indices of the valueArray map 1-to-1 to the indices of the elList.
                          var valueArray = this.model.get("selected").split(',');

                          // Each box has an associated set of element id's that's set by the client (interface sense, not web)
                          // so we need to grab each id and use it to render the html
                          for (var index=0; index<this.elList.length; index++) {
                            var id = $(this.elList[index]).attr('id');
                            id += "_input";
                            html = "<input value="+'"'+ valueArray[index] +'"'+' id="'+ id +'"' +"></input>";
                            $(this.elList[index]).html(html);
                          }
                        } else {
                          for (var index=0; index<this.elList.length; index++) {
                            var id = $(this.elList[index]).attr('id');
                            id += "_input";
                            html="<input id="+'"'+id+'"'+"></input>";
                            $(this.elList[index]).html(html);
                          }
                        }
                } catch (e) {
                }
              }
            },
            {
              name: "update_openlayers_bbox",
              callback: function(event) {

                    window.mapEvent.bind(event, jQuery.proxy(function(e) {
                      if (this.enabled) {
                        var value = window.map.layers[0].features[0].geometry.bounds.toString();
                        this.model.set({selected: value}, {silent:true});
                        this.render();
                      }
                    },this));
                    
              } 
            }
        );
    },

    // The type parameter is used to decide which View to render
    menuFactory: function(menuName, dictionary, selectableKey, defaults, type, renderHandle, binding) {
      var menu;
      if (type == "selectable") {
          menu = this.createMenuSelectable(dictionary, selectableKey, defaults, renderHandle, binding);
      }
      if (type == "default") {
          menu = this.createMenu(dictionary, defaults, renderHandle,binding);
      }
      this.menu[menuName] = menu;
      this.menuToggleList[menuName] = menu.get("menuToggleList");
      window.menuToggleList[menuName] = this.menuToggleList[menuName];
      window.menu = this.menu; 
    },

    generateUserInputPersistenceState: function() {
      // Add each of the DataSet models to the DataSetForm 
      var dataSetFormM = new DataSetFormM();
      for (dataSetName in this.dataSetDict) {
        dataSetFormM.selectable.add( this.dataSetDict[dataSetName] );
      }
      this.dataSetFormM = dataSetFormM;
      window.dataSetFormM = dataSetFormM;
    },

    generateUserInputViews: function() {
      var dataSetFormV = new DataSetFormV({model: this.dataSetFormM });
      this.dataSetFormM.view = dataSetFormV;
      this.dataSetFormV = dataSetFormV;
      window.dataSetFormV = dataSetFormV;
    }

});




















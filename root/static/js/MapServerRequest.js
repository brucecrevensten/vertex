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
             // console.log(f);
            }
  				  if (f.view.enabled && f.get("selected") != "" && f.get("selected") != null
            && f.get("selected") != undefined) { 
                
  					   // json=this.merge(json,f.getURLParameters());
              _.extend(json, f.getURLParameters());
  				  }
          } else {
              //json=this.merge(json,f.getURLParameters());
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
       // if (this.get("requestURL") == "") {
          // Find the first enabled form's url to submit to
          if (this.get("urlParam")) {
            
            this.formList.values().each(jQuery.proxy(function(form) {
              if (form.view.enabled) {
                this.set({"requestURL": form.urlList[this.get("urlParam")]  } );
                return false; // break out of anon
              }
            },this));
          }
           
       // }


  //      console.log("Submitting to " + this.get("requestURL"));
        this.requestGenerator.reset();

        var formCollection = this.formList.values();
        formCollection.each(jQuery.proxy(function(form) {
            this.requestGenerator.add(form);
        },this));

        var paramJSON = this.requestGenerator.getJSONRequestParameters();

        var paramStr = this.requestGenerator.getStrRequestFromJSON(paramJSON);

        var requestURL = this.get("requestURL");


      //  console.log(requestURL);
      //  console.log(paramStr);
       // $('#formSub').attr('action', requestURL);
        
       /* var formHTML = '<form id="formSub" action=' + '"'+ requestURL +'"' + ' method="post"> \
                        <input type="submit" value="Submit Comment" /> \
                        </form>';

        $('#formContainer2').empty();
        $('#formContainer2').append(formHTML);*/

        //console.log($('#formSub'));

       
      // $('#formSub').trigger('submit');
        
         $('#hifrm').contents().find('body').find('form').attr('action', requestURL);
        $('#hifrm').contents().find('body').find('form').trigger('submit');

        //$()
          
        

   //     var xhr = $.ajax(
   //     {
    //      type: "GET",
      //    url: requestURL,
        //  data: paramJSON,
     //     dataType: "jsonp",
        //  context: this,
          /*success: jQuery.proxy(function(data, textStatus, jqXHR) {
            this.trigger('request_success');
            console.log("AJAX SUCCESS");
          },this),
          error: jQuery.proxy( function(jqXHR, textStatus, errorThrown) {
            this.trigger('request_error');
            console.log("AJAX FAILURE");
          }, this)*/
   //   } );

    //  return xhr;
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

      //    console.log(requestURL);
      //  console.log(paramStr);

      //  console.log("ASdlkfjds");
        
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
      } catch(e) {
       // console.log("Exception");
      //  console.log(e);
      }
      this.generateUserInputPersistenceState();
      this.generateUserInputViews();
      this.generateCombinantMenu();
    },

    generateMetadataPersistenceState: function(responseData) {
      var dataSetDict = {};

      //this.generateMap();
      this.generateMap2();

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

        // Construct the Interpolation Methods
        var projectionCollection = new Backbone.Collection();
        for (projectionIndex in ds["Projection"]) {
          var projection = new ProjectionM({name: ds["Projection"][projectionIndex]});
          projectionCollection.add(projection);
        }

    /*    var boxlayer;
        var map = new OpenLayers.Map('map', { // FIXME: This call is causing the state inflator to choke somehow
          projection: "EPSG:3031",                                                              // FIXME: pull from json return?
          units: "m",                                                                           // FIXME: pull from json return?
          maxExtent: new OpenLayers.Bounds(-3174450,-2815950,2867150,2406450),                  // FIXME: pull from json return?
          maxResolution: 15000                                                                  // FIXME: pull from json return?
        });

        var datasetLayer = new OpenLayers.Layer.WMS(dataSetName,
          //ds["wmsUrl"],
          "http://testmapserver.daac.asf.alaska.edu/wms/amm1",
          {layers: 'Antarctic 100m Backscatter Coefficient Mosaic (16-bit)', CRS: "EPSG:3031"}  // FIXME: pull from json return?
        );

        map.addLayers([datasetLayer]);
        map.addControl(new OpenLayers.Control.LayerSwitcher());
        map.zoomToMaxExtent();
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
          retain: function (bounds) {
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
          }
        });
        map.addControl(control);
      
        boxlayer = new OpenLayers.Layer.Vector("Bounding Box");
        map.addLayer(boxlayer);
        */
        // Initialize the Dataset
        dataSetM.set({
            name:dataSetName,
            layers:layerCollection,
            urlList: { WCSURL:ds["wcsUrl"], WMSURL:ds["wmsUrl"] },
            imageFormats:imageFormatCollection,
            interpolationMethod:interpolationMethodCollection,
            projection: projectionCollection,
           // map: map
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

        var map = new OpenLayers.Map('map', { // FIXME: This call is causing the state inflator to choke somehow
          projection: "EPSG:4326",                                                              // FIXME: pull from json return?
                                                                                     // FIXME: pull from json return?
          maxExtent: new OpenLayers.Bounds(121, -20, 147.5, -10),                  // FIXME: pull from json return?
          //maxResolution: 15000                                                                  // FIXME: pull from json return?
        });

      //  console.log(map);

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

            //this.setStroke();
        //    console.log("THE BOUNDING BOX IS " );
        //    console.log(bbox);

            window.mapEvent.trigger('update_openlayers_bbox');

          },this)
        });
        map.addControl(control);
      
        boxlayer = new OpenLayers.Layer.Vector("Bounding Box");
        map.addLayer(boxlayer);
        //http://mapserver.daac.asf.alaska.edu/wms/GRFMP/australia

        var datasetLayer = new OpenLayers.Layer.WMS("Australia (EPSG: 4326)",
          //ds["wmsUrl"],
          "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/australia",
          {layers: 'Northern Australia - October - November 1996', CRS: "EPSG:4326"}  // FIXME: pull from json return?
        );

        var datasetLayer2 = new OpenLayers.Layer.WMS("TEST2",
          //ds["wmsUrl"],
          "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/australia",
          {layers: 'Northern Australia - October - November 1996', CRS: "EPSG:4326"}  // FIXME: pull from json return?
        );

    //    map.addLayers([datasetLayer, datasetLayer2]);
        map.addControl(new OpenLayers.Control.LayerSwitcher());
        map.zoomToMaxExtent();
        
        this.map = map;
        window.map = map;

    },

       generateMap2: function() {
        this.mapEvent = new MapEvent();
        window.mapEvent = this.mapEvent;

        var boxlayer;

        var map = new OpenLayers.Map('map', { // FIXME: This call is causing the state inflator to choke somehow
          projection: "EPSG:4326",                                                              // FIXME: pull from json return?
                                                                                     // FIXME: pull from json return?
         // maxExtent: new OpenLayers.Bounds(121, -20, 147.5, -10),                  // FIXME: pull from json return?
          //maxResolution: 200                                                                  // FIXME: pull from json return?
        });

     //   console.log(map);

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

            //this.setStroke();
       //     console.log("THE BOUNDING BOX IS " );
       //     console.log(bbox);

            window.mapEvent.trigger('update_openlayers_bbox');

          },this)
        });
        map.addControl(control);
      
        boxlayer = new OpenLayers.Layer.Vector("Bounding Box");
        map.addLayer(boxlayer);
        //http://mapserver.daac.asf.alaska.edu/wms/GRFMP/australia

        var datasetLayer2 = new OpenLayers.Layer.WMS("Australia Test Map",
          //ds["wmsUrl"],
          "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/australia",
          {layers: 'au-1', CRS: "EPSG:4326"}  // FIXME: pull from json return?
        );

        map.addLayers([datasetLayer2]);
        map.addControl(new OpenLayers.Control.LayerSwitcher());
        map.zoomToMaxExtent();
        
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
              //console.log("SETTING UP THE BINDING CALLBACK");
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
      // this is a test
        var bindInput = function(event) {

          $(this.el).bind(event, jQuery.proxy(function(e) {
              if (this.enabled) {
                var value = $(this.el).find('input').val();
                this.model.set({selected: value});
              }
            },this));
        }

        this.menuFactory('LAYERS', this.dataSetDict, "layers", {"paramName":"COVERAGE"}, "selectable");

        /*
            The menuFactory is still being worked on. 
        */
     /*   this.menuFactory('LAYERS', this.dataSetDict, "layers", {"paramName":"COVERAGE"},"selectable", null, 
        {
          name: "change",
          callback: function(event) {
            //console.log("LAYER CHANGED");
              $(this.el).bind(event, jQuery.proxy(function(e) {
              if (this.enabled) {
                console.log("LAYER CHANGE DETECTED");
                var value = $(this.el).find('select').val();
                this.model.set({selected: value});
                
                var wmsUrl = this.menuModel.get("urlList")["WMSURL"];
                var layerVal = this.model.get("selected");
                console.log(wmsUrl);

                console.log(layerVal);

                var ds = new OpenLayers.Layer.WMS(wmsUrl + ","+layerVal,
                  //ds["wmsUrl"],
                  //"http://mapserver.daac.asf.alaska.edu/wms/GRFMP/australia",
                  wmsUrl,
                  {layers: layerVal, CRS: "EPSG:4326"}  // FIXME: pull from json return?
                );

                window.map.addLayer(ds);
                window.map.setBaseLayer(ds);

              }
            },this));

          }
        }
      );*/

      this.menuFactory('LAYERS', this.dataSetDict, "layers", {"paramName":"COVERAGE"},"selectable", 
      function() {
          if (this.enabled) {
            var divId = this.menuModel.get("name").replace(/\s/g, "") + "_check";

            var html='<div id="'+divId+'">';

            this.model.selectable.each(jQuery.proxy(function(m) {
                var str = '<input type="radio" name="'+divId+ '" '  +'id="'+m.get("name")+'"'+" value="+'"'+m.get("name")+'" / >'+'<label for="'+m.get("name") +'">'+m.get("name")+'</label>';
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

            
        
              
             try {
              //console.log("Clicking!")
              $('#'+divId).find('input')[0].click();
             } catch(e) {/* console.log("Caught exception while clicking" + e.toString()); */ }
            

        }
      }, 
        {
          name: "changeThis",
          callback: function(event) {
              //console.log(this.el);
              $(this.el).bind(event, jQuery.proxy(function(e) {

                if (this.enabled) {
                  console.log(e);
                  var selectedElement = $(this.el).children().find('input[checked="checked"]');

                  try {
                    var wmsUrl = this.menuModel.get("urlList")["WMSURL"];
                    var layerVal = $(selectedElement).val();
                    this.model.set({"selected":layerVal},{silent:true});
                    
                    //console.log("RUN!");
                  
                    for (var i=0; i<window.map.layers.length; i++) {
                      if (window.map.layers[i].name != "Bounding Box") {
                        window.map.layers[i].destroy();
                      } 
                    }
                      
                      var newLayer = new OpenLayers.Layer.WMS(
                                            layerVal,
                                            wmsUrl,
                                            {layers: layerVal, CRS: "EPSG:4326"}  
                                      );
                        // and set the base layer of the map to the newLayer 
                      window.map.addLayer(newLayer);
                      window.map.setBaseLayer(newLayer); 
        
                  } catch(e){
                    console.log("Caught Exception while changing map ");
                    console.log(e);
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
                  //  console.log("EMPTY INPUT");
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
        //MenuToggleInputViewV.prototype.render, 
        function() {
            if (this.enabled) {
              var html="";
                  if (this.model.get("selected") != null) {
                    html = "<input value="+'"'+this.model.get("selected") +'"'+"></input>";
                  } else {
                  //  console.log("EMPTY INPUT");
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
                     //     console.log(valueArray);

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
                //  console.log(e);
                }
              }
            },
            {
              name: "update_openlayers_bbox",
              callback: function(event) {

                    window.mapEvent.bind(event, jQuery.proxy(function(e) {
                      if (this.enabled) {
                        var value = window.map.layers[0].features[0].geometry.bounds.toString();
                        console.log(this.model);
                        this.model.set({selected: value}, {silent:true});
                        this.render();
                      }
                    },this));
                    // iterate across each element and bind it's event to a function call
              } 
            }
        );

        //this.menuFactory('IMAGEWIDTH', this.dataSetDict, null, {"paramName: width"});

    },

    // The type parameter is used to decide which View to render
    menuFactory: function(menuName, dictionary, selectableKey, defaults, type, renderHandle, binding) {
      var menu;
      if (type == "selectable") {
          menu = this.createMenuSelectable(dictionary, selectableKey, defaults, renderHandle, binding);
      }
      if (type == "default") {
          if (menuName == "BBOX") {
          //  console.log("Creating BBOX");
          }
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
      // Generate a View for each dataset
    
      var dataSetFormV = new DataSetFormV({model: this.dataSetFormM });
   
     // console.log("The datasetFormV: ");
     // console.log(dataSetFormV);
      this.dataSetFormM.view = dataSetFormV;
      this.dataSetFormV = dataSetFormV;
      window.dataSetFormV = dataSetFormV;
    }

});




















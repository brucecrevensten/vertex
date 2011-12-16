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
      },


      submitRequest: function() {
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


        console.log("Submitting to " + this.get("requestURL"));
        this.requestGenerator.reset();

        var formCollection = this.formList.values();
        formCollection.each(jQuery.proxy(function(form) {
            this.requestGenerator.add(form);
        },this));
        var paramJSON = this.requestGenerator.getJSONRequestParameters();
        
        var requestURL = this.get("requestURL");
        
        var xhr = $.ajax(
        {
          type: "POST",
          url: requestURL,
          data: paramJSON,
          dataType: "json",
          context: this,
          success: jQuery.proxy(function(data, textStatus, jqXHR) {
            this.trigger('request_success');
          },this),
          error: jQuery.proxy( function(jqXHR, textStatus, errorThrown) {
            this.trigger('request_error');
          }, this)
      } );

      return xhr;
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
        console.log("Exception");
        console.log(e);
      }
      this.generateUserInputPersistenceState();
      this.generateUserInputViews();
      this.generateCombinantMenu();
    },

    generateMetadataPersistenceState: function(responseData) {
      var dataSetDict = {};

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

        var boxlayer;
        var map = new OpenLayers.Map({ // FIXME: This call is causing the state inflator to choke somehow
          projection: "EPSG:3031",                                                              // FIXME: pull from json return?
          units: "m",                                                                           // FIXME: pull from json return?
          maxExtent: new OpenLayers.Bounds(-3174450,-2815950,2867150,2406450),                  // FIXME: pull from json return?
          maxResolution: 15000                                                                  // FIXME: pull from json return?
        });

        var datasetLayer = new OpenLayers.Layer.WMS(dataSetName,
          ds["wmsUrl"],
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
        
        // Initialize the Dataset
        dataSetM.set({
            name:dataSetName,
            layers:layerCollection,
            urlList: { WCSURL:ds["wcsUrl"], WMSURL:ds["wmsUrl"] },
            imageFormats:imageFormatCollection,
            interpolationMethod:interpolationMethodCollection,
            map: map
        });
        dataSetDict[dataSetName] = dataSetM;
      }
      
      // Attach the Dictionary of Datasets to the window
      this.dataSetDict = dataSetDict;
      window.dataSetDict = dataSetDict;

    },

    createMenu: function(dictionary, selectableKey,  defaults) {
        var menuToggleList = {};
      
        for (key in dictionary) {
  

          var formM = new MenuToggleFormM(_.extend({menuModel: dictionary[key]}, defaults));
         
          var formV = new MenuToggleSelectViewV({model: formM, menuModel: dictionary[key] });
          
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

    generateCombinantMenu: function() {
        this.menuFactory('LAYERS', this.dataSetDict, "layers", {"paramName":"COVERAGE"});
        this.menuFactory('IMAGEFORMATS', this.dataSetDict, "imageFormats", {"paramName":"ImageFormat"});
        this.menuFactory('INTERPOLATION', this.dataSetDict, "interpolationMethod", {"paramName":"InterpolationMethod"});
    },

    menuFactory: function(menuName, dictionary, selectableKey, defaults) {
      var menu = this.createMenu(dictionary, selectableKey, defaults);
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
      this.dataSetFormM.view = dataSetFormV;
      this.dataSetFormV = dataSetFormV;
      window.dataSetFormV = dataSetFormV;
    }

});




















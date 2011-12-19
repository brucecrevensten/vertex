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


        console.log(requestURL);
        console.log(paramStr);
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

          console.log(requestURL);
        console.log(paramStr);

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
      this.generateMetadataPersistenceState(responseData);
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

        // Construct the Interpolation Methods
        var projectionCollection = new Backbone.Collection();
        for (projectionIndex in ds["Projection"]) {
          var projection = new ProjectionM({name: ds["Projection"][projectionIndex]});
          projectionCollection.add(projection);
        }

        // Initialize the Dataset
        dataSetM.set({
            name:dataSetName,
            layers:layerCollection,
            urlList: { WCSURL:ds["wcsUrl"], WMSURL:ds["wmsUrl"] },
            imageFormats:imageFormatCollection,
            interpolationMethod:interpolationMethodCollection,
            projection: projectionCollection,
        });
        dataSetDict[dataSetName] = dataSetM;
      }

      // Attach the Dictionary of Datasets to the window
      this.dataSetDict = dataSetDict;
      window.dataSetDict = dataSetDict;

    },

    createMenuSelectable: function(dictionary, selectableKey,  defaults, renderHandle, binding) {
        var menuToggleList = {};
      
        for (key in dictionary) {
  

          var formM = new MenuToggleFormM(_.extend({menuModel: dictionary[key]}, defaults));
         
          var formV = new MenuToggleSelectViewV({model: formM, menuModel: dictionary[key] });
          
          if (renderHandle != null && typeof(renderHandle == "function")) {
            formV.render = renderHandle;
          }

          if (binding != null && binding[name] != null && binding[callback] && typeof(binding[callback]) == "function") {
            formV.bind(binding[name], binding[callback]);
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
          
         // console.log("IN there");
          //console.log
          if (renderHandle != null && typeof(renderHandle == "function")) {
            formV.render = renderHandle;
          }

        //  console.log(binding);
       //   console.log(binding["name"]);

          if (binding != null && binding["name"] != null && 
              binding["callback"] != null && 
              typeof(binding["callback"]) == "function") {
           
           
              formV.bindFunc = binding["callback"];
              formV.eventName = binding["name"];
             /* console.log("About to call " );
              console.log(formV.bindFunc); 
              console.log("With the event:" + binding["name"] + ":");
              formV.bindFunc(binding["name"]);*/
            
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
                this.model.set({selected: value});
              }
            },this));
        }

        /*
            The menuFactory is still being worked on. 
        */
        this.menuFactory('LAYERS', this.dataSetDict, "layers", {"paramName":"COVERAGE"},"selectable");
        this.menuFactory('IMAGEFORMATS', this.dataSetDict, "imageFormats", {"paramName":"format"},"selectable");
        this.menuFactory('INTERPOLATION', this.dataSetDict, "interpolationMethod", {"paramName":"InterpolationMethod"},"selectable");
        this.menuFactory('PROJECTION', this.dataSetDict, "projection", {"paramName":"CRS"}, "selectable");
        
        this.menuFactory('IMAGEWIDTH', this.dataSetDict, null, {"paramName": "width"}, "default", 
        MenuToggleInputViewV.prototype.render, 
        {
            name: "change",
            callback: bindInput
        });
        this.menuFactory('IMAGEHEIGHT', this.dataSetDict, null, {"paramName": "height"}, "default", 
        MenuToggleInputViewV.prototype.render, 
        {
            name: "change",
            callback: bindInput
        });
        //this.menuFactory('IMAGEWIDTH', this.dataSetDict, null, {"paramName: width"});

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
      // Generate a View for each dataset
      var dataSetFormV = new DataSetFormV({model: this.dataSetFormM });
      this.dataSetFormM.view = dataSetFormV;
      this.dataSetFormV = dataSetFormV;
      window.dataSetFormV = dataSetFormV;
    }

});




















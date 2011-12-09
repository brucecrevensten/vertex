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
  					 json=this.merge(json,f.getURLParameters());
  				  }
          } else {
            json=this.merge(json,f.getURLParameters());
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
        requestURL: ""
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
        if (this.get("requestURL") == "") {
          return null;
        }

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


      this.generateViewGroups();

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
        
        // Initialize the Dataset
        dataSetM.set({
            name:dataSetName,
            layers:layerCollection,
            WCSURL:ds["wcsUrl"],
            WMSURL:ds["wmsUrl"],
            imageFormats:imageFormatCollection
        });
        dataSetDict[dataSetName] = dataSetM;
      }
      
      // Attach the Dictionary of Datasets to the window
      this.dataSetDict = dataSetDict;
      window.dataSetDict = dataSetDict;

    },

   generateCombinantMenu: function() {
        this.menuToggleList = {};
  
        for (dataSetName in this.dataSetDict) {
          var layerFormM = new LayerFormM({menuModel: this.dataSetDict[dataSetName]});
          var layerFormV = new LayerFormV({model: layerFormM, menuModel: this.dataSetDict[dataSetName]});


          var menuToggleLayer = new MenuToggle({
            name: dataSetName,
            selectable: this.dataSetDict[dataSetName].get("layers"),
            menuModel:  this.dataSetDict[dataSetName],
            menuForm:   layerFormM,
            menuView:   layerFormV,
          });

          this.menuToggleList[dataSetName] = menuToggleLayer;

        }

        var menu = new CombinantMenuToggle({
            "menuToggleList": this.menuToggleList
        });

        console.log("Constructed Combinant menu");

        this.menu = menu;
       
        window.menuToggleList = this.menuToggleList;
        window.menu = this.menu; 



    /*    var menuToggleLayer = new MenuToggle({
            menuForm:   layerFormM,
            menuModel:  this.dataSetDict[dataSetName],
            menuView:   new LayerFormV({model: this.layerFormMDict[dataSetName]}),
         });

         menuToggleList.push(menuToggleLayer);
         menuToggleList.push(menuToggleImageFormat);

         dataSetNames = new Backbone.Collection();
         for (dataSetName in this.dataSetDict) {
           dataSetNames.push(menuToggleLayer);
         }


         var menu = new CombinantMenuToggle({
           menuForm: new DataSetFormM(),
         })*/

      },

    // Implement exception handling because this function depends on the one above working 
    generateUserInputPersistenceState: function() {
      // Add each of the DataSet models to the DataSetForm 
      var dataSetFormM = new DataSetFormM();
      for (dataSetName in this.dataSetDict) {
        dataSetFormM.selectable.add( this.dataSetDict[dataSetName] );
      }

/*      // For each of the DataSets create a LayerForm 
      var layerFormMDict = {};
      for (dataSetName in this.dataSetDict) {
        var layerFormM = new LayerFormM({'menuModel':this.dataSetDict[dataSetName]});

        layerFormM.selectable = this.dataSetDict[dataSetName].get("layers");
        layerFormMDict[dataSetName] = layerFormM;   
      }
*/
      // For each of the DataSets create an ImageFormatForm 
   /*   var imageFormatFormMDict = {};
      for (dataSetName in this.dataSetDict) {
        var imageFormatFormM = new ImageFormatFormM({'menuModel':this.dataSetDict[dataSetName]});
  
        imageFormatFormM.selectable= this.dataSetDict[dataSetName].get("imageFormats");
        imageFormatFormMDict[dataSetName] = imageFormatFormM;   
      }*/

      this.dataSetFormM = dataSetFormM;
   //   this.layerFormMDict = layerFormMDict;
   //   this.imageFormatFormMDict = imageFormatFormMDict;

      window.dataSetFormM = dataSetFormM;
    //  window.layerFormMDict = layerFormMDict;
    //  window.imageFormatFormMDict = imageFormatFormMDict; 
    },

    generateUserInputViews: function() {
      // Generate a View for each dataset
      var dataSetFormV = new DataSetFormV({model: this.dataSetFormM });


      this.dataSetFormM.view = dataSetFormV;



      // Generate a View for each Layer Set
 /*     var layerFormVDict = {};
      for (dataSetName in this.dataSetDict) {
        var layerFormV = new LayerFormV({model: this.layerFormMDict[dataSetName]});
        this.layerFormMDict[dataSetName].view = layerFormV;
          
        layerFormVDict[dataSetName] = layerFormV;   
      }
  */
      // For each of the DataSets create an ImageFormatForm 
    ////  var imageFormatFormVDict = {};

   //   for (dataSetName in this.dataSetDict) {
     
   //     var imageFormatFormV = new ImageFormatFormV({model: this.imageFormatFormMDict[dataSetName]});
   //     this.imageFormatFormMDict[dataSetName].view = imageFormatFormV;
   //     imageFormatFormVDict[dataSetName] = imageFormatFormV;   
   //   }
  

      this.dataSetFormV = dataSetFormV;
  //    this.layerFormVDict = layerFormVDict;
   //   this.imageFormatFormVDict = imageFormatFormVDict;
     
      window.dataSetFormV = dataSetFormV;
  //    window.layerFormVDict = layerFormVDict;
   //   window.imageFormatFormVDict = imageFormatFormVDict; 
    },

    generateViewGroups: function () {
      // Create a View Group for the Layers
  /*    var layerViewGroup =  new ViewGroupC();
      for (dataSetName in this.layerFormVDict) {
        layerViewGroup.add( this.layerFormVDict[dataSetName] );
        this.layerFormVDict[dataSetName].viewGroup = layerViewGroup;
      }
*/
      // Create a View Group for the ImageFormats
    /*  var imageFormatViewGroup =  new ViewGroupC();
      for (dataSetName in this.imageFormatFormVDict) {
        imageFormatViewGroup.add( this.imageFormatFormVDict[dataSetName] );
        this.imageFormatFormVDict[dataSetName].viewGroup = imageFormatViewGroup;
      }
      */
    }

});

























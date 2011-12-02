// Purpose: Handle generation of request. Does not actually submit the request
//          it only packages up the request and acts as broker between the form 
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

/*
"DataSet": {
                "Austrailia": {
                  "layers": ["AusLayer1", "AusLayer2","AusLayer3" ],
                  "url": "/AustrailiaURL"
              },
              "Alaska": {
                  "layers": ["AlaskaLayer1", "AlaskaLayer2"],
                  "url": "/AlaskaURL"
              },
              "Africa": {
                  "layers": ["AfricaLayer1"],
                  "url": "/AlaskaURL"
              },
            },
            "ImageFormat": ["JPEG", "BMP", "TIFF"],
            
*/
    process: function(responseData) {
    //  var dsForm = new DataSetFormM();
    //  var dsView = new DataSetFormV();
    //  dsForm.view = dsView;

// Generate the Metadata Persistent State
    this.generateMetadataPersistenceState(responseData);
    this.generateUserInputPersistenceState(responseData);

    },

    generateMetadataPersistenceState: function(responseData) {
      var dataSetDict = new Dictionary();

      for (dataSetName in responseData["DataSet"]) {
        ds = data["DataSet"][key];

        var dataSetM = new DataSetM();
        
        // Construct the layers
        var layerCollection = new Backbone.Collection();
        for (layerName in ds["layers"]) {
          var layer = new DataSetLayerM({name: layerName});
          layerCollection.add(layer);
        }

        // Construct the Image formats
        var imageFormatCollection = new Backbone.Collection();
        for (imageFormatName in ds["ImageFormat"]) {
          var imageFormat = new ImageFormatM({name: imageFormatName});
          imageFormatCollection.add(imageFormat);
        }
        
        // Initialize the Dataset
        dataSetM.set({
            name:dataSetName,
            layers:layerCollection,
            url:ds["url"],
            imageFormat:imageFormatCollection
        });
      }
      dataSetDict.add(dataSetName, d);

      // Attach the Dictionary of Datasets to the window
      this.dataSetDict = dataSetDict;
      window.dataSetDict = dataSetDict;
    },

    // MK HERE: Checkout exception handling this function depends on the one above working and 
    // attaching a dataSetDict to the correct location. 
    generateUserDataPersistenceState: function(responseData) {
      
      for (dataSetName in responseData["DataSet"]) {
        
      }
    } 



});

























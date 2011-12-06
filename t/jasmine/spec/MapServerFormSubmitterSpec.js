// This test references Spec#17.2-17.7

describe("Test object construction", function() {
	it("Should successfully construct the state objects", function() {
	 	var fl =[];
	 	fl[0] = new DataSetM();
	 	fl[1] = new LayerM();
	 	fl[2] = new OutputProjectionM();
	 	fl[3] = new InterpolationMethodM();
	 	fl[4] = new ImageFormatM();
	 	fl[5] = new WCSFormM();
	 	fl[6] = new LayerFormM();
	 	fl[7] = new DataSetFormM();
	 	fl[8] = new OutputProjectionFormM();
	 	fl[9] = new InterpolationMethodFormM();
	 	fl[10] = new ImageFormatFormM();
	 	fl[11] = new ImageHeightFormM();
	 	fl[12] = new ImageWidthFormM();
	 	fl[13] = new WCSFormV();
	 	fl[14] = new DataSetFormV();
	 	fl[15] = new LayerFormV();
	 	fl[16] = new OutputProjectionFormV();
	 	fl[17] = new ImageFormatFormV();
	 	fl[18] = new ImageHeightFormV();
	 	fl[19] = new ImageWidthFormV();
	 	fl[20] = new InterpolationMethodFormV();

	 	for (var i=0; i<=20; i++) {
	 		expect(fl[i]).toNotBe(null);
	 	}
	});


	it("Should construct the request generator", function() {
		var c = new RequestGenerator();
		expect(c).toNotBe(null);
	});

	it("Should construct the form submitter", function() {
		var c = new FormSubmitter();
		expect(c).toNotBe(null);
	});

	it("Should construct the state inflator", function() {
		var c = new StateInflator();
		expect(c).toNotBe(null);
	});

	it("Should construct the form generator", function() {
		var c = new FormGenerator();
		expect(c).toNotBe(null);
	});

});

describe("Test StateInflator", function() {
	// Create a sinon server 
	var server;

	server = sinon.fakeServer.create();

	server.respondWith("POST", "/fakeURL",
       [200, { "Content-Type": "application/json" },
        JSON.stringify(
        {
	        "DataSet": {
		        "Austrailia": {
			        "layers": ["AusLayer1", "AusLayer2","AusLayer3" ],
			        "wcsUrl": "/AustrailiaURL",
			        "wmsUrl": "/AustrailiaURL2",
			        "ImageFormat": ["JPEG", "BMP", "TIFF"]
			    },
			    "Alaska": {
			        "layers": ["AlaskaLayer1", "AlaskaLayer2"],
			        "wcsUrl": "/AlaskaURL",
			        "wmsUrl": "/AlaskaURL2",
			        "ImageFormat": ["BMP", "GEOTIFF"]
			    },
			    "Africa": {
			        "layers": ["AfricaLayer1"],
			        "wcsUrl": "/AfricaURL",
			        "wmsUrl": "/AfricaURL2",
			        "ImageFormat": ["GEOTIFF"]
			    }
		    },

        })]);

	window.server = server;

	var infl = new StateInflator();
	
	infl.inflate('/fakeURL'); 

	server.respond(); 
	it("Should instantiate state objects from HTTP request", function() {
		expect(infl.dataSetDict).toNotBe(null);
		expect(infl.dataSetFormM).toNotBe(null);
		expect(infl.layerFormMDict).toNotBe(null);
		expect(infl.imageFormatFormMDict).toNotBe(null);
		expect(infl.dataSetFormV).toNotBe(null);
		expect(infl.layerFormVDict).toNotBe(null);
		expect(infl.imageFormatFormVDict).toNotBe(null);
	});

	it("The Datasets should be properly constructed", function() { 
		expect(infl.dataSetDict["Austrailia"]).toNotBe(null);
		expect(infl.dataSetDict["Austrailia"].get("layers").models[0].get("name") ).toBe("AusLayer1");
		expect(infl.dataSetDict["Austrailia"].get("layers").models[1].get("name") ).toBe("AusLayer2");
		expect(infl.dataSetDict["Austrailia"].get("layers").models[2].get("name") ).toBe("AusLayer3");
		expect(infl.dataSetDict["Austrailia"].get("WCSURL")).toBe("/AustrailiaURL");
		expect(infl.dataSetDict["Austrailia"].get("WMSURL")).toBe("/AustrailiaURL2");
		expect(infl.dataSetDict["Austrailia"].get("imageFormats").models[0].get("name") ).toBe("JPEG");
		expect(infl.dataSetDict["Austrailia"].get("imageFormats").models[1].get("name") ).toBe("BMP");
		expect(infl.dataSetDict["Austrailia"].get("imageFormats").models[2].get("name") ).toBe("TIFF");

		expect(infl.dataSetDict["Alaska"]).toNotBe(null);
		expect(infl.dataSetDict["Alaska"].get("layers").models[0].get("name") ).toBe("AlaskaLayer1");
		expect(infl.dataSetDict["Alaska"].get("layers").models[1].get("name") ).toBe("AlaskaLayer2");
		expect(infl.dataSetDict["Alaska"].get("WCSURL")).toBe("/AlaskaURL");
		expect(infl.dataSetDict["Alaska"].get("WMSURL")).toBe("/AlaskaURL2");
		expect(infl.dataSetDict["Alaska"].get("imageFormats").models[0].get("name") ).toBe("BMP");
		expect(infl.dataSetDict["Alaska"].get("imageFormats").models[1].get("name") ).toBe("GEOTIFF");

		expect(infl.dataSetDict["Africa"]).toNotBe(null);
		expect(infl.dataSetDict["Africa"].get("layers").models[0].get("name") ).toBe("AfricaLayer1");
		expect(infl.dataSetDict["Africa"].get("WCSURL")).toBe("/AfricaURL");
		expect(infl.dataSetDict["Africa"].get("WMSURL")).toBe("/AfricaURL2");
		expect(infl.dataSetDict["Africa"].get("imageFormats").models[0].get("name") ).toBe("GEOTIFF");	
	});
});


// This will test the requests that are sent to the server
// under the conditions that some of the forms are enabled and some 
// disabled
describe("Test FormSubmitter", function() {
	it("Should generate state 'by hand', create a form 'by hand' and submit an ajax request", function() {
		form = new FormSubmitter();

		var fl = [];

		fl[0] = new DataSetFormM({"selected":"datasetName"});
		fl[1] = new OutputProjectionFormM({"selected": "outputProjectionName"});
		fl[2] = new ImageFormatFormM({"selected": "imageFormatName"});
		fl[3] = new ImageHeightFormM({"selected":12});
		fl[4] = new ImageWidthFormM({"selected":34});
		fl[5] = new InterpolationMethodFormM({"selected":"interpolationMethodName"});

		fl[0].view = new DataSetFormV({model: fl[0]});
		fl[1].view = new OutputProjectionFormV({model: fl[1]});
		fl[2].view = new ImageFormatFormV({model: fl[2]});
		fl[3].view = new ImageHeightFormV({model: fl[3]});
		fl[4].view = new ImageWidthFormV({model: fl[4]});
		fl[5].view = new InterpolationMethodFormV({model: fl[5]});

		for (i in [0,1,2,3,4]) {
			fl[i].view.enabled=true;
		}
		fl[5].view.enabled=false;

		expect(form.formList).toNotBe(null);

		for (i in [0,1,2,3,4,5]) {
			form.formList.add(i,fl[i]);
		}

		// Create a sinon server
		// submit a request (form.submitRequest() )
		// inspect the contents of the request

		var  fakeUrl = "fakeUrl";
		form.set({"requestURL": fakeUrl});   

		var server;

		server = sinon.fakeServer.create();


		server.respondWith("POST", fakeUrl,
		           [200, { "Content-Type": "application/json" }, JSON.stringify({"Success":"Yes"})]);

		form.submitRequest();

		server.respond(); 

		// Test the enabled/disabled feature
		expect(server.requests[0].requestBody).toEqual("Dataset=datasetName&OutputProjection=outputProjectionName&ImageFormat=imageFormatName&ImageHeight=12&ImageWidth=34");

		form.enable(5);
		form.submitRequest();

		expect(server.requests[1].requestBody).toEqual("Dataset=datasetName&OutputProjection=outputProjectionName&ImageFormat=imageFormatName&ImageHeight=12&ImageWidth=34&InterpolationMethod=interpolationMethodName");
	
		server.restore(); 
	});

	it("Should inflate the state dynamically, generate a form with a Dataset,\
	 Layer, and ImageFormat 'by hand', and submit an ajax request", function() {
		// Create a sinon server 
		var server;

		server = sinon.fakeServer.create();

		server.respondWith("POST", "/fakeURL",
	       [200, { "Content-Type": "application/json" },
	        JSON.stringify(
	        {
		        "DataSet": {
			        "Austrailia": {
				        "layers": ["AusLayer1", "AusLayer2","AusLayer3" ],
				        "wcsUrl": "/AustrailiaURL",
				        "wmsUrl": "/AustrailiaURL2",
				        "ImageFormat": ["JPEG", "BMP", "TIFF"]
				    },
				    "Alaska": {
				        "layers": ["AlaskaLayer1", "AlaskaLayer2"],
				        "wcsUrl": "/AlaskaURL",
				        "wmsUrl": "/AlaskaURL2",
				        "ImageFormat": ["BMP", "GEOTIFF"]
				    },
				    "Africa": {
				        "layers": ["AfricaLayer1"],
				        "wcsUrl": "/AfricaURL",
				        "wmsUrl": "/AfricaURL2",
				        "ImageFormat": ["GEOTIFF"]
				    }
			    },

	        })]);

		var infl = new StateInflator();
		infl.inflate('/fakeURL'); 
		server.respond(); 

		form = new FormSubmitter();

		var formList = [];

		// Select the Alaska Dataset and submit and ajax request 
		formList[0] = infl.dataSetFormM;
		expect(formList[0]).toNotBe(null);
		expect(formList[0]).toNotBe(undefined);
		// First choose an incorrect selection
		formList[0].set({"selected": "Argentina"}); // should not work because this DataSet is not defined
		
		expect(formList[0].get("selected")).toNotBe("Argentina");

		// Now choose alaska
		formList[0].set({"selected": "Alaska"});
		expect(formList[0].get("selected")).toBe("Alaska");

		expect(formList[0].view.enabled).toBe(false);
		formList[0].view.enabled = true;

		formList[1] = infl.layerFormMDict[formList[0].get("selected")];
		formList[1].set({"selected": "FakeLayer"});
		expect(formList[1].get("selected")).toNotBe("FakeLayer");
		formList[1].set({"selected": "AlaskaLayer1"});
		expect(formList[1].get("selected")).toBe("AlaskaLayer1");
		formList[1].view.enabled = true;

		formList[2] = infl.imageFormatFormMDict[formList[0].get("selected")];
		formList[2].set({"selected": "FakeImageFormat"});
		expect(formList[2].get("selected")).toNotBe("FakeImageFormat");
		formList[2].set({"selected": "BMP"});
		expect(formList[2].get("selected")).toBe("BMP");
		formList[2].view.enabled = true;

		expect(form.formList).toNotBe(null);

		for (i in [0,1,2]) {
			form.formList.add(i,formList[i]);
		}

		expect(form.formList.length).toBe(3);

		// Create a sinon server
		// submit a request (form.submitRequest() )
		// inspect the contents of the request

		var  fakeUrl = "fakeUrl";
		form.set({"requestURL": fakeUrl});   

		server.restore(); 

		var server2 = sinon.fakeServer.create();

		server2.respondWith("POST", fakeUrl,
		           [200, { "Content-Type": "application/json" }, JSON.stringify({"Success":"Yes"})]);

		form.submitRequest();

		server2.respond(); 

		expect(server2.requests[0].requestBody).toEqual("Dataset=Alaska&COVERAGE=AlaskaLayer1&ImageFormat=BMP");
	
		server2.restore(); 
		//jQuery.ajax.restore(); // Unwraps the spy
	});
});

describe("Test the FormGenerator", function() {
	it("Should inflate state dynamically, generate a formList dynmically using a \
	    FormGenerator, select fields, and send an ajax request", function() {
		
		// Create a sinon server 
		var server;

		server = sinon.fakeServer.create();

		server.respondWith("POST", "/fakeURL",
	       [200, { "Content-Type": "application/json" },
	        JSON.stringify(
	        {
		        "DataSet": {
			        "Austrailia": {
				        "layers": ["AusLayer1", "AusLayer2","AusLayer3" ],
				        "wcsUrl": "/AustrailiaURL",
				        "wmsUrl": "/AustrailiaURL2",
				        "ImageFormat": ["JPEG", "BMP", "TIFF"]
				    },
				    "Alaska": {
				        "layers": ["AlaskaLayer1", "AlaskaLayer2"],
				        "wcsUrl": "/AlaskaURL",
				        "wmsUrl": "/AlaskaURL2",
				        "ImageFormat": ["BMP", "GEOTIFF"]
				    },
				    "Africa": {
				        "layers": ["AfricaLayer1"],
				        "wcsUrl": "/AfricaURL",
				        "wmsUrl": "/AfricaURL2",
				        "ImageFormat": ["GEOTIFF"]
				    }
			    },

	        })]);

		var infl = new StateInflator();
		infl.inflate('/fakeURL'); 
		server.respond(); 

		var formGenerator = new FormGenerator({"Inflator": infl});
		formGenerator.enable({"DataSet": "Alaska", "Layer": "Alaska", "ImageFormat": "Alaska", "ImageWidth": "NA"});
		formGenerator.select({
				"DataSet": "Alaska",
				"Layer": "AlaskaLayer",
				"ImageFormat": "GEOTIFF", 
				"ImageWidth": 100				
		});
		var formList = formGenerator.create();

		var formSubmitter = new FormSubmitter();
		_.each(formList, function(f) {
			formSubmitter.add(f);
		});

		server.restore(); 
		
		form.set({"requestURL": formSubmitter.get("WCSURL") });   

		var server2 = sinon.fakeServer.create();

		server2.respondWith("POST", formSubmitter.get("WCSURL"),
		           [200, { "Content-Type": "application/json" }, JSON.stringify({"Success":"Yes"})]);

		formSubmitter.submitRequest();

		server2.respond(); 

		expect(server2.requests[0].requestBody).toEqual("SOMETHING");
	
		server2.restore(); 

					
	});
});

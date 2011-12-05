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
	 	fl[8] = new OutputProjectionaFormM();
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

	var form = new FormSubmitter();

	var fl = [];

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

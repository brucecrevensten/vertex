// This test references Spec#17.2-17.7

// Test basic construction of form comonents 
describe("Create MapserverUI Form components", function() {
	it("Create a Dataset form object", function(){
		dataSetModel = new DataSetModel();
		dataSetView = new DataSetView();
		
		expect(dataSetModel).toNotBe(null);
		expect(dataSetView).toNotBe(null);

		dataSetView = new DataSetView({model: dataSetModel});
		expect(dataSetView.model).toBe(dataSetModel);

		// Test events that need to be called on DataSetModel when it changes.
		var spy = new sinon.spy();
		dataSetModel.bind("change", spy);
		dataSetModel.set({"selected": "FakeName"});
		expect(spy.calledOnce).toBeTruthy();
	});

	it("Create an OutputProjection form object", function() {
		outputProjectionModel = new OutputProjectionModel();
		outputProjectionView = new OutputProjectionView();
		
		expect(outputProjectionModel).toNotBe(null);
		expect(outputProjectionView).toNotBe(null);

		outputProjectionView = new OutputProjectionView({model: outputProjectionModel});
		expect(outputProjectionView.model).toBe(outputProjectionModel);

	});

	it("Create an ImageFormat form object", function() {
		imageFormatModel = new ImageFormatModel();
		imageFormatView = new ImageFormatView();
		
		expect(imageFormatModel).toNotBe(null);
		expect(imageFormatView).toNotBe(null);

		imageFormatView = new ImageFormatView({model: imageFormatModel});
		expect(imageFormatView.model).toBe(imageFormatModel);
	});

	it("Create an ImageHeight form object", function() {
		imageHeightModel = new ImageHeightModel();
		imageHeightView = new ImageHeightView();
		
		expect(imageHeightModel).toNotBe(null);
		expect(imageHeightView).toNotBe(null);

		imageHeightView = new ImageHeightView({model: imageHeightModel});
		expect(imageHeightView.model).toBe(imageHeightModel);

	});

	it("Create an ImageWidth form object", function() {
		imageWidthModel = new ImageWidthModel();
		imageWidthView = new ImageWidthView();
		
		expect(imageWidthModel).toNotBe(null);
		expect(imageWidthView).toNotBe(null);

		imageWidthView = new ImageWidthView({model: imageWidthModel});
		expect(imageWidthView.model).toBe(imageWidthModel);
	
	});

	it("Create an InterpolationMethod form object", function() {
		interpolationMethodModel = new InterpolationMethodModel();
		interpolationMethodView = new InterpolationMethodView();
		
		expect(interpolationMethodModel).toNotBe(null);
		expect(interpolationMethodView).toNotBe(null);

		interpolationMethodView = new InterpolationMethodView({model: interpolationMethodModel});
		expect(interpolationMethodView.model).toBe(interpolationMethodModel);

	});

});


// This will test the requests that are sent to the server
// under the conditions that some of the forms are enabled and some 
// disabled
describe("Create a form and make a request", function() {
	it("Should create a form and submit an ajax request", function() {
		form = new FormSubmitter({});
		
		var fl = [];

		fl[0] = new DataSetModel({"selected":"datasetName"});
		fl[1] = new OutputProjectionModel({"selected": "outputProjectionName"});
		fl[2] = new ImageFormatModel({"selected": "imageFormatName"});
		fl[3] = new ImageHeightModel({"selected":12});
		fl[4] = new ImageWidthModel({"selected":34});
		fl[5] = new InterpolationMethodModel({"selected":"interpolationMethodName"});

		fl[0].view = new DataSetView({model: fl[0]});
		fl[1].view = new OutputProjectionView({model: fl[1]});
		fl[2].view = new ImageFormatView({model: fl[2]});
		fl[3].view = new ImageHeightView({model: fl[3]});
		fl[4].view = new ImageWidthView({model: fl[4]});
		fl[5].view = new InterpolationMethodView({model: fl[5]});

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

		//form.formList.dictionary[5].view.enabled=true;
		form.enable(5);
		form.submitRequest();

		expect(server.requests[1].requestBody).toEqual("Dataset=datasetName&OutputProjection=outputProjectionName&ImageFormat=imageFormatName&ImageHeight=12&ImageWidth=34&InterpolationMethod=interpolationMethodName");

		server.restore(); 
		//jQuery.ajax.restore(); // Unwraps the spy
	});

});




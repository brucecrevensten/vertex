// This test references Spec#17.2-17.7

describe("Test the Merging of JSON Request parameters", function() {
	it("Merge a few jsons together", function() {
		
		var a = {"a":"1"};
		var b = {"b":"2"};
		var c = a.merge(b);
		expect(c["a"]).toBe("1");
		expect(c["b"]).toBe("2");
		
		var d = {"h":"4"};
		var e = d.merge(a).merge(b).merge(c).merge(d);

		expect(e["a"]).toBe("1");
		expect(e["b"]).toBe("2");
		expect(c["h"]).toBe("4");
	});



});

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
		dataSetModel.set({"selectedDataSet": "FakeName"});
		expect(spy.calledOnce).toBeTruthy();

		// Test Method that is called in request Generator
		//expect(dataSetModel.getURLString()).toBe("FakeName");
	});

	it("Create an OutputProjection form object", function() {
		outputProjectionModel = new OutputProjectionModel();
		outputProjectionView = new OutputProjectionView();
		
		expect(outputProjectionModel).toNotBe(null);
		expect(outputProjectionView).toNotBe(null);

		outputProjectionView = new OutputProjectionView({model: outputProjectionModel});
		expect(outputProjectionView.model).toBe(outputProjectionModel);

		// Test Method that is called in request Generator
		outputProjection.set({"selectedProjection":"FakeName"});
		//expect(outputProjection.getURLString()).toBe("FakeName");
	});

	it("Create an ImageFormat form object", function() {
		imageFormatModel = new ImageFormatModel();
		imageFormatView = new ImageFormatView();
		
		expect(imageFormatModel).toNotBe(null);
		expect(imageFormatView).toNotBe(null);

		imageFormatView = new ImageFormatView({model: imageFormatModel});
		expect(imageFormatView.model).toBe(imageFormatModel);

		// Test Method that is called in request Generator
		imageFormatModel.set({"selectedFormat":"FakeName"});
		//expect(imageFormatModel.getURLString()).toBe("FakeName");
	});

	it("Create an ImageHeight form object", function() {
		imageHeightModel = new ImageHeightModel();
		imageHeightView = new ImageHeightView();
		
		expect(imageHeightModel).toNotBe(null);
		expect(imageHeightView).toNotBe(null);

		imageHeightView = new ImageHeightView({model: imageHeightModel});
		expect(imageHeightView.model).toBe(imageHeightModel);

		// Test Method that is called in request Generator
		imageHeightModel.set({"imageHeight":"FakeName"});
		//expect(imageHeightModel.getURLString()).toBe("FakeName");
	});

	it("Create an ImageWidth form object", function() {
		imageWidthModel = new ImageWidthModel();
		imageWidthView = new ImageWidthView();
		
		expect(imageWidthModel).toNotBe(null);
		expect(imageWidthView).toNotBe(null);

		imageWidthView = new ImageWidtbView({model: imageWidthModel});
		expect(imageWidthView.model).toBe(imageWidthModel);
			
		// Test Method that is called in request Generator
		imageWithModel.set({"imageWidth":"FakeName"});
		//expect(imageWidthtModel.getURLParameters()).toBe({"imgWidth":"FakeName"});
	});

	it("Create an InterpolationMethod form object", function() {
		interpolationMethodModel = new InterpolationMethodModel();
		interpolationMethodView = new InterpolationMethodView();
		
		expect(interpolationMethodModel).toNotBe(null);
		expect(interpolationMethodView).toNotBe(null);

		interpolationMethodView = new InterpolationMethodView({model: interpolationMethodModel});
		expect(interpolationMethodView.model).toBe(interpolationMethodModel);

		// Test Method that is called in request Generator
		interpolationMethodModel.set({"selectedInterpolationMethod":"FakeName"});
		//expect(interpolationMethodModel.getURLParameters()).toBe({"interp":"FakeName"});
	});

});

// Test the generation of a json request object via which forms are enabled and disabled 
describe("Create a RequestGenerator", function() {
	it("RequestGenerator generates a request from form objects", function() {
		// Create a bunch of form objects. 
		// Then hook spys into their getURLParameters (returns JSON) methods.
		// add each form object to the requestGenerator.
		// then invoke the getRequestURL() from the requestGenerator.
		// this will generate the request url string.
		// just make sure the string was not null (at the moment we dont have a format specified).
		// then check if each of the getURLString methods from each of the
		// models were called. 
		var fl = [];

		fl[0] = new DataSetModel({"selectedDataSet":"datasetName"});
		fl[1] = new OutputProjectionModel({"selectedOutputProjetion": "outputProjectionName"});
		fl[2] = new ImageFormatModel({"selectedImageFormat": "imageFormatName"});
		fl[3] = new ImageHeightModel({"height":12});
		fl[4] = new ImageWidthModel({"width":34});
		fl[5] = new InterpolationMethodModel({"selectInterpolationMethod":"interpolationMethodName"});

		var spyList = [];
		for (i in [0,1,2,3,4,5]) {
			spyList[i] = new sinon.spy(fl[i].getURLParameters);
		}
		
		rg = new RequestGenerator();
		for (i in [0,1,2,3,4,5]) {
			rg.add(fl[i]);
		}

		expect(rg.getRequestParameters()).toBe(null);
	
		// Should not construct the request object unless the views are enabled. 
		for (i in [0,1,2,3,4,5]) {
			expect(spyList[i].calledOnce).toBeFalsy();
		}

		fl[0].view = new DataSetView({model: fl[0]});
		fl[1].view = new OutputProjectionModel({model: fl[1]});
		fl[2].view = new ImageFormatModel({model: fl[2]});
		fl[3].view = new ImageHeightModel({model: fl[3]});
		fl[4].view = new ImageWidthModel({model: fl[4]});
		fl[5].view = new InterpolationMethodModel({model: fl[5]});

		for (i in [1,2,3,4]) {
			fl[i].view.enabled=true;
		}
		fl[5].view.enabled=false;

		// Reset the spies
		for (i in [0,1,2,3,4,5]) {
			spyList[i] = new sinon.spy(fl[i].getURLParameters);
		}

		// The first 4 are enabled so they should have been added to the request
		// The last one is disabled so it should not have been added to the request
		for (i in [0,1,2,3,4]) {
			expect(spyList[i].calledOnce).toBeTruthy();
		}
		expect(spyList[i].calledOnce).toBeFalsy();

		expect(rg.getRequestParameters()).toNotBe(null);
	});
});

// This will test the requests that are sent to the server
// under the conditions that some of the forms are enabled and some 
// disabled
describe("Create a form and make a request", function() {
	form = new MapServerForm();

	var fl = [];

	fl[0] = new DataSetModel({"selectedDataSet":"datasetName"});
	fl[1] = new OutputProjectionModel({"selectedOutputProjetion": "outputProjectionName"});
	fl[2] = new ImageFormatModel({"selectedImageFormat": "imageFormatName"});
	fl[3] = new ImageHeightModel({"height":12});
	fl[4] = new ImageWidthModel({"width":34});
	fl[5] = new InterpolationMethodModel({"selectInterpolationMethod":"interpolationMethodName"});

	fl[0].view = new DataSetView({model: fl[0]});
	fl[1].view = new OutputProjectionModel({model: fl[1]});
	fl[2].view = new ImageFormatModel({model: fl[2]});
	fl[3].view = new ImageHeightModel({model: fl[3]});
	fl[4].view = new ImageWidthModel({model: fl[4]});
	fl[5].view = new InterpolationMethodModel({model: fl[5]});

	for (i in [1,2,3,4]) {
		fl[i].view.enabled=true;
	}
	fl[5].view.enabled=false;

	for (i in [1,2,3,4,5]) {
		form.add(fl[i]);
	}

	// Create a sinon server
	// submit a request (form.submitRequest() )
	// inspect the contents of the request
});








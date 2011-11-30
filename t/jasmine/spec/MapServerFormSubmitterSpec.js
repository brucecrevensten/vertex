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
		expect(dataSetModel.getURLString()).toBe("FakeName");
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

		imageWidthView = new ImageWidtbView({model: imageWidthModel});
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

describe("Create a RequestGenerator", function() {
	it("RequestGenerator generates a request from form objects", function() {
		
		// Create a bunch of form objects. 
		// Then hook spys into their getURLString methods.
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
			spyList[i] = new sinon.spy(fl[i].getURLString);
		}
		
		rg = new RequestGenerator();
		for (i in [0,1,2,3,4,5]) {
			rg.add(fl[i]);
		}

		expect(rg.getRequestURL()).toNotBe(null);
	
		for (i in [0,1,2,3,4,5]) {
			expect(spyList[i].calledOnce).toBeTruthy();
		}

	});
});












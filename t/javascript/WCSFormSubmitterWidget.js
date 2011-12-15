$(function() {	

	var server;

	server = sinon.fakeServer.create();

	// Projection, UNits, Max projection, 
	server.respondWith("POST", "/fakeURL",
	           [200, { "Content-Type": "application/json" },
	            JSON.stringify(
		        {
			        "DataSet": {
				        "Austrailia": {
					        "layers": ["AusLayer1", "AusLayer2","AusLayer3" ],
					        "wcsUrl": "/AustrailiaURL",
					        "wmsUrl": "/AustrailiaURL2",
					        "ImageFormat": ["JPEG", "BMP", "TIFF"],
					        "InterpolationMethod": ["BILINEAR", "NEAREST NEIGHBOR"],
					    
					    },
					    "Alaska": {
					        "layers": ["AlaskaLayer1", "AlaskaLayer2"],
					        "wcsUrl": "/AlaskaURL",
					        "wmsUrl": "/AlaskaURL2",
					        "ImageFormat": ["BMP", "GEOTIFF"],
					        "InterpolationMethod": ["CUBIC SPLINE", "SMOOTHED ANTIALIASING", "POLYWALK" ],
					
					    },
					    "Africa": {
					        "layers": ["AfricaLayer1"],
					        "wcsUrl": "/AfricaURL",
					        "wmsUrl": "/AfricaURL2",
					        "ImageFormat": ["BMP","GEOTIFF"],
					         "InterpolationMethod": ["BILINEAR", "TIME FIRST"]
					    },
					    "Germany": {
					        "layers": ["GermanLayer1","GermanLayer2","GermanLayer3"],
					        "wcsUrl": "/GermanURL",
					        "wmsUrl": "/GermanURL2",
					        "ImageFormat": ["JPG","GEOTIFF", "PNG", "AVI"],
					         "InterpolationMethod": ["BILINEAR", "TIME FIRST", "SINGLE STEP"]
					    }
				    },

	            })]);

	window.server = server;


	var infl = new StateInflator();
	
	this.infl = infl;

	infl.inflate('/fakeURL'); 

	server.respond(); 
	

	infl.dataSetFormM.view.set($("#dataset"));

	// Layer
	for (dataSetName in dataSetDict) {
		menuToggleList["LAYERS"][dataSetName].menuView.set($("#layer"));
	}
	menuToggleList["LAYERS"]["Alaska"].menuView.enabled = true;
	menuToggleList["LAYERS"]["Alaska"].menuForm.set({"selected":"AlaskaLayer1"});
	menuToggleList["LAYERS"]["Alaska"].menuView.render();

	// Image Format
	for (dataSetName in dataSetDict) {
		menuToggleList["IMAGEFORMATS"][dataSetName].menuView.set($("#imageFormat"));
	}
	menuToggleList["IMAGEFORMATS"]["Alaska"].menuView.enabled = true;
	menuToggleList["IMAGEFORMATS"]["Alaska"].menuForm.set({"selected":"BMP"});
	menuToggleList["IMAGEFORMATS"]["Alaska"].menuView.render();

	// Interpolation Method
	for (dataSetName in dataSetDict) {
		menuToggleList["INTERPOLATION"][dataSetName].menuView.set($("#interpolation"));
	}
	menuToggleList["INTERPOLATION"]["Alaska"].menuView.enabled = true;
	menuToggleList["INTERPOLATION"]["Alaska"].menuForm.set({"selected":"CUBIC SPLINE"});
	menuToggleList["INTERPOLATION"]["Alaska"].menuView.render();

		// Interpolation Method
/*	for (dataSetName in dataSetDict) {
		menuToggleList["BAND"][dataSetName].menuView.set( $("#band") );
	}
	menuToggleList["BAND"]["Alaska"].menuView.enabled = true;
	menuToggleList["BAND"]["Alaska"].menuForm.set({"selected":"Alaska"});
	menuToggleList["BAND"]["Alaska"].menuView.render();
*/
	dataSetFormM.view.enabled = true;
	dataSetFormM.set({"selected":"Alaska"});

	dataSetFormM.view.render();

	window.infl = infl;

	var form = new FormSubmitter();

	var fl = [];

	var server2;

	server2 = sinon.fakeServer.create();

	server2.respondWith("POST", "/AlaskaURL",
	           [200, { "Content-Type": "application/json" },
	            JSON.stringify(
		        {"SUCCESS":"SUCESS"})]);

    window.server2 = server2;

	/*fl[0] = menuToggleList["LAYERS"]["Alaska"].menuForm;
	fl[1] = menuToggleList["IMAGEFORMATS"]["Alaska"].menuForm;
	fl[2] = menuToggleList["INTERPOLATION"]["Alaska"].menuForm;*/

	//var index =0;
	for (formName in menuToggleList) {
		for (dataSetName in menuToggleList[formName]) {
			fl.push(menuToggleList[formName][dataSetName].menuForm);
		}
	}

	var formSub = new FormSubmitter();
	formSub.set({"urlParam": "WCSURL"});

	for (i in fl) {
		formSub.formList.add(i, fl[i]);
	}

	_.each(fl, function(f) {
		//formSub.formList.log(f);
	});

	window.formSub = formSub;
	/* 
		When the download button is clicked then the form needs to submit the request 
		to the proper url. The proper URL in this case will be the url of the WCS service
		associated with the dataset. This URL will be located in the model associated with 
		dataset. We get the currently selected 
			
	*/
	$('#downloadButton').button({ label: "Download"}).bind("click", jQuery.proxy(function() {
		//form.setSubmisisonObject(infl.)
		//form.set({"requestURL": "/fakeURL"});
		window.formSub.set({"urlParam": "WCSURL"});
		window.formSub.submitRequest();    
		window.server2.respond(); 
		

	},this));

	//form.set({"requestURL": })
/*
	fl[0] = new DataSetFormM();
	fl[1] = new OutputProjectionFormM();
	fl[2] = new ImageFormatFormM();
	fl[3] = new ImageHeightFormM();
	fl[4] = new ImageWidthFormM();
	fl[5] = new InterpolationMethodFormM();

	fl[0].view = new DataSetView({el: $('#dataset'), model: fl[0]});
	fl[1].view = new OutputProjectionView({el: $('#outProj'), model: fl[1]});
	fl[2].view = new ImageFormatView({el: $('#imgF'), model: fl[2]});
	fl[3].view = new ImageHeightView({el: $('#imgH'), model: fl[3]});
	fl[4].view = new ImageWidthView({el: $('#imgW'), model: fl[4]});
	fl[5].view = new InterpolationMethodView({el: $('#interp'), model: fl[5]});

	for (i in [0,1,2,3,4,5]) {
		form.formList.add(i,fl[i]);
	}

	$('#downloadButton').button({ label: "Download"}).bind("click", jQuery.proxy(function() {
		form.set({"requestURL": "/fakeURL"});
		form.submitRequest();    
		window.server.respond(); 
	},this));

	$('#dataSetField').live("click", jQuery.proxy(function() {
		$('.categories').toggle(); 
	},this));

	$('.categories ul li').live("click", function(e) {
		console.log(e);
	});

	window.wcsForm = form; */

});
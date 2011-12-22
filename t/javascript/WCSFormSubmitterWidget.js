$(function() {	

	var server;

	server = sinon.fakeServer.create();

//bbox=125,-18,126,-17

	// Projection, UNits, Max projection, 
	server.respondWith("POST", "/fakeURL",
	           [200, { "Content-Type": "application/json" },
	            JSON.stringify(
		        {
			        "DataSet": {
				        "Australia": {
					        "layers": ["northern_australia"],
					        //"wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&COVERAGE=northern_australia&bbox=125,-18,126,-17&CRS=epsg:4326&width=500&height=500&format=jpeg",
					        "wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "/AustrailiaURL2",
					        "ImageFormat": ["jpeg", "GTiff"],
					        "InterpolationMethod": ["BILINEAR", "NEAREST NEIGHBOR"],
					        "Projection": ["epsg:4326"]
					    },
					    "South East Asia": {
					        "layers": ["sea-2b"],
					        "wcsUrl": "http://testmapserver.daac.asf.alaska.edu/wcs/GRFMP/se-asia?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "/AlaskaURL2",
					        "ImageFormat": ["jpeg", "GTiff"],
					        "InterpolationMethod": ["CUBIC SPLINE", "SMOOTHED ANTIALIASING", "POLYWALK" ],
							"Projection": ["epsg:4326"]
					    }/*,
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
					    },
					     "Greenland": {
					        "layers": ["Greenland","Greenland2"],
					        "wcsUrl": "/GreenlandURL",
					        "wmsUrl": "/GreenlandURL2",
					        "ImageFormat": ["GEOTIFF", "PNG", "AVI"],
					         "InterpolationMethod": ["INTERPMETHOD", "TIME FIRST", "SINGLE STEP"]
					    }*/
				    },

	            })]);

	window.server = server;


	var infl = new StateInflator();
	
	this.infl = infl;

	infl.inflate('/fakeURL'); 

	server.respond(); 

	server.restore();
	

	infl.dataSetFormM.view.set($("#dataset"));

	// Layer
	for (dataSetName in dataSetDict) {
		menuToggleList["LAYERS"][dataSetName].menuView.set($("#layer"));
	}
	menuToggleList["LAYERS"]["Australia"].menuView.enabled = true;
	//menuToggleList["LAYERS"]["Alaska"].menuForm.set({"selected":"AlaskaLayer1"});
	menuToggleList["LAYERS"]["Australia"].menuView.render();

	// Image Format
	for (dataSetName in dataSetDict) {
		menuToggleList["IMAGEFORMATS"][dataSetName].menuView.set($("#imageFormat"));
	}
	menuToggleList["IMAGEFORMATS"]["Australia"].menuView.enabled = true;
	menuToggleList["IMAGEFORMATS"]["Australia"].menuView.render();

	// Interpolation Method
	for (dataSetName in dataSetDict) {
		menuToggleList["INTERPOLATION"][dataSetName].menuView.set($("#interpolation"));
	}
	menuToggleList["INTERPOLATION"]["Australia"].menuView.enabled = true;
	menuToggleList["INTERPOLATION"]["Australia"].menuView.render();

	// Projection 
	for (dataSetName in dataSetDict) {
		menuToggleList["PROJECTION"][dataSetName].menuView.set($("#projection"));
	}
	menuToggleList["PROJECTION"]["Australia"].menuView.enabled = true;
	menuToggleList["PROJECTION"]["Australia"].menuView.render();

	// Image Width 
	for (dataSetName in dataSetDict) {
		menuToggleList["IMAGEWIDTH"][dataSetName].menuView.set2($("#imageWidth"));
	}	
	menuToggleList["IMAGEWIDTH"]["Australia"].menuView.enabled = true;

	// Image Height 
	for (dataSetName in dataSetDict) {
		menuToggleList["IMAGEHEIGHT"][dataSetName].menuView.set2($("#imageHeight"));
	}
	menuToggleList["IMAGEHEIGHT"]["Australia"].menuView.enabled = true;	

	// BBOX 
	for (dataSetName in dataSetDict) {
		var elList = [];

		elList[0] = $("#b0");
		elList[1] = $("#b1");
		elList[2] = $("#b2");
		elList[3] = $("#b3");

		menuToggleList["BBOX"][dataSetName].menuView.set3(elList);
	}

	menuToggleList["BBOX"]["Australia"].menuView.enabled = true;
	menuToggleList["BBOX"]["Australia"].menuView.render();

	//console.log("About to render the image width");
	//menuToggleList["IMAGEWIDTH"]["Alaska"].menuView.render();

		// Interpolation Method
/*	for (dataSetName in dataSetDict) {
		menuToggleList["BAND"][dataSetName].menuView.set( $("#band") );
	}
	menuToggleList["BAND"]["Alaska"].menuView.enabled = true;
	menuToggleList["BAND"]["Alaska"].menuForm.set({"selected":"Alaska"});
	menuToggleList["BAND"]["Alaska"].menuView.render();
*/
	dataSetFormM.view.enabled = true;
	dataSetFormM.set({"selected":"Australia"});

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
			if (formName != "INTERPOLATION") {
				fl.push(menuToggleList[formName][dataSetName].menuForm);
			}
		}
	}

	var formSub = new FormSubmitter();
	formSub.set({"urlParam": "WCSURL"});

	for (i in fl) {
		formSub.formList.add(i, fl[i]);
	}

	window.formSub = formSub;
	/* 
		When the download button is clicked then the form needs to submit the request 
		to the proper url. The proper URL in this case will be the url of the WCS service
		associated with the dataset. This URL will be located in the model associated with 
		dataset. We get the currently selected 
			
	*/
	window.server2.restore();
	$('#downloadButton').button({ label: "Download"}).bind("click", jQuery.proxy(function() {
		//form.setSubmisisonObject(infl.)
		//form.set({"requestURL": "/fakeURL"});
		window.formSub.set({"urlParam": "WCSURL"});
		window.formSub.submitRequestForm();    
		//window.server2.respond(); 
		//window.server2.restore();

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
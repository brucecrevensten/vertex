$(function() {	

	var server;

	server = sinon.fakeServer.create();

	server.respondWith("POST", "/fakeURL",
	           [200, { "Content-Type": "application/json" },
	            JSON.stringify(
		        {
			        "DataSet": {
				        "Australia": {
					        "layers": ["au-1"],
					        "wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/australia",
					        "ImageFormat": ["jpeg", "GTiff"],
					        "InterpolationMethod": ["NEAREST_NEIGHBOUR","BILINEAR"],
					        "Projection": ["epsg:4326"]
					    },
					    "South East Asia": {
					        "layers": ["sea-2b","sea-2c","sea-2d"],
					        "wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/se-asia?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/se-asia",
					        "ImageFormat": ["jpeg", "GTiff"],
					        "InterpolationMethod": ["NEAREST_NEIGHBOUR","BILINEAR"],
							"Projection": ["epsg:4326"]
					    },
					    "South East Asia Mainland": {
					        "layers": ["sea-1a","sea-1b"],
					        "wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/seasia-mainland?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/seasia-mainland",
					        "ImageFormat": ["jpeg", "GTiff"],
					        "InterpolationMethod": ["NEAREST_NEIGHBOUR","BILINEAR"],
							"Projection": ["epsg:4326"]
					    },
					    "Africa": {
					        "layers": ["AFR-1A","AFR-1B","AFR-1C"],
					        "wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/africa?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/africa",
					        "ImageFormat": ["jpeg", "GTiff"],
					         "InterpolationMethod": ["NEAREST_NEIGHBOUR","BILINEAR"],
					         "Projection": ["epsg:4326"]
					    },
					    "Central America": {
					        "layers": ["AM-3"],
					        "wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/camerica?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/camerica",
					        "ImageFormat": ["jpeg", "GTiff"],
					         "InterpolationMethod": ["NEAREST_NEIGHBOUR","BILINEAR"],
					         "Projection": ["epsg:4326"]
					    },
					     "South America": {
					        "layers": ["AM-1A","AM-1B","AM-1C","AM-1D"],
					        "wcsUrl": "http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/samerica?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&",
					        "wmsUrl": "http://mapserver.daac.asf.alaska.edu/wms/GRFMP/samerica",
					        "ImageFormat": ["jpeg", "GTiff"],
					        "InterpolationMethod": ["NEAREST_NEIGHBOUR","BILINEAR"],
							"Projection": ["epsg:4326"]
					    },
					     
				    },

	            })]);

	window.server = server;


	var infl = new StateInflator();
	
	this.infl = infl;

	infl.inflate('/fakeURL'); 

	server.respond(); 

	server.restore();

	infl.dataSetFormM.view.set($("#dataset"));

	// Image Format
	for (dataSetName in dataSetDict) {
		menuToggleList["IMAGEFORMATS"][dataSetName].menuView.set2($("#imageFormat"));
	}
	menuToggleList["IMAGEFORMATS"]["Australia"].menuView.enabled = true;
	menuToggleList["IMAGEFORMATS"]["Australia"].menuView.render();

	// Interpolation Method
	for (dataSetName in dataSetDict) {
		menuToggleList["INTERPOLATION"][dataSetName].menuView.set2($("#interpolation"));
	}
	menuToggleList["INTERPOLATION"]["Australia"].menuView.enabled = true;
	menuToggleList["INTERPOLATION"]["Australia"].menuView.render();

	// Projection 
	for (dataSetName in dataSetDict) {
		menuToggleList["PROJECTION"][dataSetName].menuView.set2($("#projection"));
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

	dataSetFormM.view.enabled = true;
	dataSetFormM.set({"selected":"Australia"});

	dataSetFormM.set({"layers": menuToggleList["LAYERS"]});

	dataSetFormM.view.render();
	menuToggleList["LAYERS"]["Australia"].menuView.render();

	dataSetFormM.view.bindAccordion($("#dataset"));

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

	window.formSub = formSub;
	/* 
		When the download button is clicked then the form needs to submit the request 
		to the proper url. The proper URL in this case will be the url of the WCS service
		associated with the dataset. This URL will be located in the model associated with 
		dataset. We get the currently selected 
			
	*/
	window.server2.restore();
	$('#downloadButton').button({ label: "Download"}).bind("click", jQuery.proxy(function() {
		// Tell the form Submitter to grab the WCSURL parameter from the dataset that is selected
		window.formSub.set({"urlParam": "WCSURL"});
		window.formSub.submitRequestForm();    
	},this));

});

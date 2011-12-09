$(function() {	

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
					        "ImageFormat": ["JPEG", "BMP", "TIFF"],
					        "InterpolationMethod": ["BILINEAR", "NEAREST NEIGHBOR"]
					    },
					    "Alaska": {
					        "layers": ["AlaskaLayer1", "AlaskaLayer2"],
					        "wcsUrl": "/AlaskaURL",
					        "wmsUrl": "/AlaskaURL2",
					        "ImageFormat": ["BMP", "GEOTIFF"],
					        "InterpolationMethod": ["CUBIC SPLINE", "SMOOTHED ANTIALIASING", "POLYWALK" ]
					    },
					    "Africa": {
					        "layers": ["AfricaLayer1"],
					        "wcsUrl": "/AfricaURL",
					        "wmsUrl": "/AfricaURL2",
					        "ImageFormat": ["GEOTIFF"],
					         "InterpolationMethod": ["BILINEAR", "TIME FIRST"]
					    }
				    },

	            })]);

	window.server = server;

	var form = new FormSubmitter();

	var fl = [];

	var infl = new StateInflator();
	
	this.infl = infl;

	infl.inflate('/fakeURL'); 

	server.respond(); 
	

	infl.dataSetFormM.view.set($("#dataset"));

	// Layer
	for (dataSetName in dataSetDict) {
		menuToggleListLayer[dataSetName].menuView.set($("#layer"));
	}
	menuToggleListLayer["Alaska"].menuView.enabled = true;
	menuToggleListLayer["Alaska"].menuForm.set({"selected":"Alaska"});
	menuToggleListLayer["Alaska"].menuView.render();

	// Image Format
	for (dataSetName in dataSetDict) {
		menuToggleListImageFormat[dataSetName].menuView.set($("#imageFormat"));
	}
	menuToggleListImageFormat["Alaska"].menuView.enabled = true;
	menuToggleListImageFormat["Alaska"].menuForm.set({"selected":"Alaska"});
	menuToggleListImageFormat["Alaska"].menuView.render();

	// Interpolation Method
	for (dataSetName in dataSetDict) {
		menuToggleListInterpolationMethod[dataSetName].menuView.set($("#interpolation"));
	}
	menuToggleListInterpolationMethod["Alaska"].menuView.enabled = true;
	menuToggleListInterpolationMethod["Alaska"].menuForm.set({"selected":"Alaska"});
	menuToggleListInterpolationMethod["Alaska"].menuView.render();

	dataSetFormM.view.enabled = true;
	dataSetFormM.set({"selected":"Alaska"});

	dataSetFormM.view.render();


	window.infl = infl;
	
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
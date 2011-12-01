$(function() {

	var form = new FormSubmitter({});


	var fl = [];

	fl[0] = new DataSetModel();
	fl[1] = new OutputProjectionModel();
	fl[2] = new ImageFormatModel();
	fl[3] = new ImageHeightModel();
	fl[4] = new ImageWidthModel();
	fl[5] = new InterpolationMethodModel();

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
	},this));

	$('#dataSetField').live("click", jQuery.proxy(function() {
		$('.categories').toggle(); 
	},this));

	$('.categories ul li').live("click", function() {
		console.log("ALSKDJALSDJLASJDLAKDJS");
	});

	window.wcsForm = form;

});
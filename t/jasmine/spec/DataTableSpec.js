describe("Datatable basics", function() {
it("Should create a sinon server", function() {
	 this.server = sinon.fakeServer.create();
	console.log(AsfDataportalConfig.apiUrl);
		expect( 1 ).toEqual( 1);	
		
 		this.server.respondWith("Get", AsfConfig.apiUrl,
	                                [200, { "Content-Type": "application/json" },
	                                 '[{ id: 12, comment: "Hey there" }]']);

	        var callback = sinon.spy();
	      
	        this.server.respond();
	
});

describe("SinonFakeServerWithJasmine", function() {
  var server;

  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  afterEach(function () {
    server.restore();
  });

  it("should fake a jQuery ajax request", function () {
    server.respondWith("GET", AsfDataportalConfig.apiUrl,
                       [200, { "Content-Type": "application/json" },
                        '{ "stuff": "is", "awesome": "in here" }']);

    var callbacks = [sinon.spy(), sinon.spy()];

    jQuery.ajax({
      url: AsfDataportalConfig.apiUrl,
      success: callbacks[0]
    });

    jQuery.ajax({
      url: "/other",
 //     success: callbacks[1]
    });



    console.log(server.requests); // Logs all requests so far
    server.respond(); // Process all requests so far

  /*  expect(callbacks[0].calledOnce).toBeTruthy();
    expect(callbacks[0].calledWith({
      stuff: "is",
      awesome: "in here"
    })).toBeTruthy();*/

   // expect(callbacks[1].calledOnce).toBeFalsy(); // Unknown URL /other received 404
  });
});
 q
	
//////it("Should create a datatable", function() {
/*
	var searchResults = new SearchResults();
	var searchParameters = new SearchParameters();
	searchParameters.getGranuleFilter().set({'granule_list':'E2_23229_STD_F285,R1_14387_ST5_F281,R1_60386_SWB_F260,E1_08911_STD_F141,R1_60386_SWB_F260,E1_09084_STD_F153,E2_55271_STD_F177,E2_04423_STD_F678,R1_38632_ST2_F365,E2_04423_STD_F695,E2_40756_STD_F171,E2_40756_STD_F171,R1_15097_ST5_F198,R1_40647_FN1_F286,R1_40647_FN1_F291,R1_40647_FN1_F291,E1_24859_STD_F699,E1_24859_STD_F699,R1_60386_SWB_F268,R1_14387_ST5_F275,E2_26566_STD_F275,E2_26566_STD_F275,E2_55271_STD_F178,E2_04423_STD_F683,R1_38632_ST2_F375,R1_26805_ST1_F163,R1_19892_ST2_F232,R1_19892_ST2_F235,E1_08911_STD_F125,E1_08911_STD_F125,R1_35451_ST2_F103,R1_65008_ST4_F297'
	+ ',R1_65008_ST4_F283,R1_51972_ST1_F172,R1_58418_SWB_F130,E1_08911_STD_F125,R1_26805_ST1_F167,E1_10164_STD_F269,E1_24137_STD_F279,R1_47944_ST2_F169,R1_24537_ST1_F321,E1_20300_STD_F283,E1_20300_STD_F259,R1_60246_FN1_F037,R1_60246_FN1_F038,R1_43981_ST4_F205,R1_43981_ST4_F219,R1_60246_FN1_F038,R1_60246_FN1_F037,E1_20300_STD_F259,E1_20300_STD_F283,R1_60246_FN1_F043,R1_43981_ST4_F205,R1_43981_ST4_F219,E1_17293_STD_F207,E1_24137_STD_F317,E1_17293_STD_F207,J1_30177_STD_F291,R1_29685_ST3_F287,E1_17293_STD_F239,E1_17293_STD_F239,R1_47944_ST2_F171,R1_47944_ST2_F171,R1_47944_ST2_F171,E1_08911_STD_F161,R1_31205_ST2_F207,R1_19892_ST2_F233,R1_19892_ST2_F233,R1_14402_SWB_F260,R1_14402_SWB_F252,R1_14402_SWB_F252,R1_14402_SWB_F260,R1_61859_ST1_F217,E2_23229_STD_F291,R1_61859_ST1_F217,R1_23873_ST5_F087,R1_65008_ST4_F279,R1_61859_ST1_F207,R1_23873_ST5_F087,R1_61859_ST1_F207,R1_65008_ST4_F279,R1_65008_ST4_F293,R1_61859_ST1_F215,E1_08911_STD_F133,E2_25998_STD_F685,E1_24859_STD_F703,E1_24859_STD_F703,R1_64176_ST2_F077,R1_64176_ST2_F077,R1_37852_SWB_F136,R1_37852_SWB_F136,E2_18061_STD_F265,E2_18061_STD_F265,R1_64183_FN1_F405,R1_64183_FN1_F405,E2_18061_STD_F277,E2_18061_STD_F277,E1_08911_STD_F135,E2_40756_STD_F173,E2_40756_STD_F173,E1_24859_STD_F685,E1_24859_STD_F685,E2_69292_STD_F275,E2_70494_STD_F275,E2_70494_STD_F275,J1_21098_STD_F291,E2_70494_STD_F285,E2_70494_STD_F285,J1_21098_STD_F305,J1_21098_STD_F305,R1_35394_SWB_F178,R1_35394_SWB_F178,R1_64190_FN1_F065,R1_64190_FN1_F065,R1_64197_ST2_F403,R1_64197_ST2_F403,E2_69292_STD_F299'
	+ 'ALPSRP016350340,ALPSRP016350340,ALPSRP016350340,ALPSRP016350340,ALPSRP016350340,ALPSRP016350340,ALPSRP016350350,ALPSRP016350350,ALPSRP016350350,ALPSRP016350350,ALPSRP016350350,ALPSRP016350350,ALPSRP016350360,ALPSRP016350360,ALPSRP016350360,ALPSRP016350360,ALPSRP016350360,ALPSRP016350360,ALPSRP016350690,ALPSRP016350690,ALPSRP016350690,ALPSRP016350690,ALPSRP016350690,ALPSRP016350690,ALPSRP016445710,ALPSRP016445710,ALPSRP016445710,ALPSRP016445710,ALPSRP016445710,ALPSRP016445710'});
	searchResults.searchParameters = searchParameters;
	this.searchResults = searchResults;
	
	
	this.user = new User();
	this.postFilters = new PostFilters();
    this.downloadQueue = new DownloadQueue();
	this.searchResults = searchResults;
	
	
	this.searchResultsView = new SearchResultsView(
    {
      'postFilters': this.postFilters,
      'collection': this.searchResults,
      'el': $("#searchResults"),
      'model': this.user,
      'downloadQueue': this.downloadQueue
    }
    );

	window.SearchApp = {};
	window.SearchApp.searchResults = this.searchResults;
	window.SearchApp.user = this.user;
	window.SearchApp.searchResultsView = this.searchResultsView;
	
    this.searchResults.unbind(); // Don't want the search results view to render
	
	var arrayHtmlData = []; // prolly not gonna use this anymore
	
	this.searchResults.bind('refresh', function() {
		
			var ur = this.user.getWidgetRenderer();
		 var li="";
		var li_2="";
		this.searchResults.each( function( model, i, l ) {   
		
	      var d = model.toJSON();
*/

/*
	
	   li = '<tr><td class="productRow" id="result_row_'+d.id+'" product_id="'+d.id+'" onclick="window.showProductProfile(\''+d.id+'\'); return false;">'
	      + ur.srThumbnail( model )
	      + _.template( this.searchResultsView.getPlatformRowTemplate( d.PLATFORM ), d) 
	      + '<div class="productRowTools">'
	      + '<button title="More information&hellip;" role="button" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only">'
	      + '<span class="ui-button-icon-primary ui-icon ui-icon-help"></span>'
	      + '<span class="ui-button-text">More information&hellip;</span>'
	      + '</button>'
	      + '<div title="Show files&hellip;" onclick="window.showInlineProductFiles(event, \''+d.id+'\'); return false;" class="tool_enqueuer ui-button ui-widget ui-state-default ui-corner-all ui-button-icons-only queue_toggler" product_id="'+d.id+'">'
	      + '<span class="ui-button-icon-primary ui-icon ui-icon-circle-plus"></span>'
	      + '<span class="ui-button-text">Show files&hellip;</span>'
	      + '<span class="ui-button-icon-secondary ui-icon ui-icon-triangle-1-s"></span>'
	      + '</div>'
	      + '</div><div style="clear:both;"></div></td></tr>';
	
		li_2 += li;
			arrayHtmlData.push([li]);
			
	    }, this);
		
	
		var tableHtml =
						'<div id="container" style="width:400px; margin:0 auto;">'+
						'<table id="searchResults" style="margin:20px 0px 20px 0px;">'+
							'<thead>'+
								'<tr>'+
									'<th></th>'+
								'</tr>'+
							'</thead>'+
							'<tbody>'+
								li_2 +
							'</tbody>'+
						'</table>'+'</div>';
						
		$('body').append(tableHtml);

		var dataTable = $('#searchResults').dataTable(
			{ 
					"bJQueryUI":true,
					"bProcessing": true,
					"sPaginationType": "full_numbers",
					"bAutoWidth": false,
					"aoColumns": [
						{"sWidth": "100%"}
					]
		});
	
	
//	dataTable.fnAddData(arrayHtmlData);

	//$('#searchResults').html(li_2);
	
	},this);
	
	
	this.searchResults.fetchSearchResults(AsfDataportalConfig.apiUrl, searchResults.searchParameters.toJSON()); 


	expect( 1 ).toEqual( 1);
	
*/		
/////});
			
		
});
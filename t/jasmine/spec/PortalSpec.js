// Basic unit test for the FilterCollection

describe("Download Queue", function() {
  it("should allow items to be added to it", function() {
    dq = new DownloadQueue();
    dp = new DataProduct(
      {"id":1,"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:56:57","PROCESSINGTYPE":"BROWSE","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE/A3/ALPSRP234721390.jpg","BYTES":542548,"FILESIZE":.52,"OFFNADIRANGLE":34.3,"MD5SUM":"c910145b9b9e7965f19e9990d1a7c367","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390.jpg","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}
      });
    dq.add( dp );
    expect( dq.length ).toEqual( 1 );
    expect( dq.get(1).toJSON().GRANULENAME ).toEqual( 'ALPSRP234721390' );
  });

  it("should know the size of the queue", function() {
    dq = new DownloadQueue();
    expect( dq.length ).toEqual( 0 );
    expect( dq.getSizeInBytes() ).toEqual( 0 );
    expect( dq.getSizeAsText() ).toEqual( "0 B" );
    dp1 = new DataProduct( { "BYTES":500 } );
    dq.add( dp1 );
    expect( dq.length ).toEqual( 1 );
    expect( dq.getSizeInBytes() ).toEqual( 500 );
    expect( dq.getSizeAsText() ).toEqual( "500 B" );
    dp2 = new DataProduct( { "BYTES":10000 } );
    dp3 = new DataProduct( { "BYTES":20000 } );
    dq.add( [ dp2, dp3 ] );
    expect( dq.length ).toEqual( 3 );
    expect( dq.getSizeInBytes() ).toEqual( 30500 );
    expect( dq.getSizeAsText() ).toEqual( "29.79 KB" );
    dp4 = new DataProduct( { "BYTES":1100000 } );
    dq.add( dp4 );
    expect( dq.length ).toEqual( 4 );
    expect( dq.getSizeInBytes() ).toEqual( 1130500 );
    expect( dq.getSizeAsText() ).toEqual( "1.08 MB" );
    dp5 = new DataProduct( { "BYTES":5500000000 } );
    dq.add( dp5 );
    expect( dq.length ).toEqual( 5 );
    expect( dq.getSizeInBytes() ).toEqual( 5501130500 );
    expect( dq.getSizeAsText() ).toEqual( "5.12 GB" );
    dp6 = new DataProduct( { "BYTES":1900000000000 } );
    dq.add( dp6 );
    expect( dq.length ).toEqual( 6 );
    expect( dq.getSizeInBytes() ).toEqual( 1905501130500 );
    expect( dq.getSizeAsText() ).toEqual( "1.73 TB" );

  });

  it("can render a 'Download Queue' summary button that describes the current state of the queue, changes when items are added, and can pop an interactive download modal", function() {
    dq = new DownloadQueue();
    dqv = new DownloadQueueView( { collection: dq } );
    expect( dq.length ).toEqual( 0 );
    expect( dqv.renderSummaryButton() ).toContain("Download queue <span>(empty)</span>");
 
    dp1 = new DataProduct( { "BYTES":500 } );
    dq.add( dp1 );
    expect( dq.length ).toEqual( 1 ); 
    expect( dqv.renderSummaryButton() ).toContain('Download queue <span class="nonempty">(1 item, 500 B)</span>');
    dp2 = new DataProduct( { "BYTES":10000 } );
    dp3 = new DataProduct( { "BYTES":20000 } );
    dp4 = new DataProduct( { "BYTES":1100000 } );
    dp5 = new DataProduct( { "BYTES":5500000000 } );
    dp6 = new DataProduct( { "BYTES":1900000000000 } );
    dq.add( [ dp2, dp3, dp4, dp5, dp6 ] );
    expect( dq.length ).toEqual( 6 ); 
    expect( dqv.renderSummaryButton() ).toContain('Download queue <span class="nonempty">(6 items, 1.73 TB)</span>');

  });

  describe("Download Queue modal popup", function() {
  
    describe("Download Queue table of queue contents", function() {

      dq = new DownloadQueue();
      dqv = new DownloadQueueView( { collection: dq } );
      dq.add( [
        new DataProduct( { "GRANULENAME":"granule1", "BYTES":500 } ),
        new DataProduct( { "GRANULENAME":"granule2", "BYTES":10000 } ),
        new DataProduct( { "GRANULENAME":"granule3", "BYTES":20000 } ),
        new DataProduct( { "GRANULENAME":"granule4", "BYTES":1100000 } ),
        new DataProduct( { "GRANULENAME":"granule5", "BYTES":5000000000 } ),
        new DataProduct( { "GRANULENAME":"granule6", "BYTES":1900000000000 } )
      ] );

      r = dqv.render().el.innerHTML;

      it("lists the products in the queue", function() {
      
        expect( r ).toContain('granule1');
        expect( r ).toContain('granule2');
        expect( r ).toContain('granule3');
        expect( r ).toContain('granule4');
        expect( r ).toContain('granule5');
        expect( r ).toContain('granule6');
      });

      it("has radio buttons to let user choose download format", function() {

        expect( r ).toContain('Bulk Download (.metalink)');
        expect( r ).toContain('Spreadsheet (.csv)');
        expect( r ).toContain('Google Earth (.kml)');

      });

      it("has a download button that fires an async request to the API", function() {
        expect( r ).toContain('Download');
      });

    });

  });  

});

describe("DataProduct", function() {
  it("should capture the product's data", function() {
    dp = new DataProduct(
      {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:56:57","PROCESSINGTYPE":"BROWSE","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE/A3/ALPSRP234721390.jpg","BYTES":542548,"FILESIZE":.52,"OFFNADIRANGLE":34.3,"MD5SUM":"c910145b9b9e7965f19e9990d1a7c367","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390.jpg","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}
      });
    expect(dp.toJSON()).toEqual(
      {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:56:57","PROCESSINGTYPE":"BROWSE","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE/A3/ALPSRP234721390.jpg","BYTES":542548,"FILESIZE":.52,"OFFNADIRANGLE":34.3,"MD5SUM":"c910145b9b9e7965f19e9990d1a7c367","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390.jpg","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}
     } );
  });

  it("should render the product given a representative result from the API", function() {
    dp = new DataProduct(
      {
        "BROWSE":"http://some/fake/url",
        "URL":"http://some/fake/url",
        "PROCESSINGTYPE":"L0",
        "BEAMMODEDESC":"Beam mode",
        "FRAMENUMBER":1234,
        "PATHNUMBER":4321,
        "ORBIT":789,
        "STARTTIME":"2005-01-01",
        "ENDTIME":"2005-01-01",
        "FARADAYROTATION":0,
        "ASCENDINGDESCENDING":"Ascending",
        "OFFNADIRANGLE":0
      }
      );
    dpv = new DataProductView({model:dp});
    expect( dpv.render().el.innerHTML ).toMatch('<img src="http://some/fake/url">');
  });
  
});

describe("ProcessingFilter and ProcessingWidget", function() {
  it("should manage a json array of processing levels", function() {
    pf = new ProcessingFilter();
    expect(pf.toJSON()).toEqual( { "processing":["L0","L1","L1.5","L1.0","L1.1"] });
  });

  it("should render a template containing actively checked items if they are selected", function() {
    pf = new ProcessingFilter();
    pw = new ProcessingWidget({model:pf});
    expect( pw.render().el.innerHTML ).toMatch('<input id="filter_processing_L1" value="L1" name="L1" checked="checked" type="checkbox">');
  });
});

  /* TODO: repair this.  need to fake the ajax request/response cycle.
describe("SearchResultsView", function() {

  it("should be able to display the count of a result set", function() {
    sr = new SearchResults();
    sr.refresh( granules );
    
    //srv = new SearchResultsView({ collection: sr });
    //console.log(srv);

    expect( srv.renderLength() ).toEqual("<h3>4 results found</h3>");

  });

  it("should render a data table with a result set", function() {

    sr = new SearchResults();
    sr.refresh( granules );
    srv = new SearchResultsView({ collection: sr });
    expect( srv.render() ).toMatch("ALPSRP234721390");

  });
});
*/

describe("Search components", function() {
  it("should have a SearchParameter object that knows search params", function() {
    sp = new SearchParameters({granule_list:"ALPSRP234721390,ALPSRP234721380,ALPSRP234721370,ALPSRP234721360"});
    expect(sp.get('granule_list')).toEqual('ALPSRP234721390,ALPSRP234721380,ALPSRP234721370,ALPSRP234721360');
    expect(sp.toJSON()).toEqual(
  { format : 'jsonp', granule_list : 'ALPSRP234721390,ALPSRP234721380,ALPSRP234721370,ALPSRP234721360', bbox : '-149.46,63.78,-145.96,65.56', processing : [ 'L0', 'L1', 'L1.5', 'L1.0', 'L1.1' ], platform : [ 'E1', 'E2', 'J1', 'A3', 'R1' ], start : '2010-10-01', end : '2011-01-01', path : ' ', frame : ' ', offnadir : 0, direction : 'any' }  
    );
  });

  it("should be able to use refresh() to bootstrap from a known list of model data represented as JSON", function() {
    sr = new SearchResults();
    sr.refresh( granules );
    expect( sr.length ).toEqual(4);

    dp = new DataProduct( {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:25:08","PROCESSINGTYPE":"L1.0","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.0/A3/ALPSRP234721390-L1.0.zip","BYTES":371233566,"FILESIZE":354.04,"OFFNADIRANGLE":34.3,"MD5SUM":"0a9e1ead0734236c67f8d57d71fe2451","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.0.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}});
    expect( sr.first().toJSON() ).toEqual( dp.toJSON() );
  });

  it("should have a SearchResults object that can perform a search against the API", function() {

    sp = new SearchParameters( {"bbox":"-135,64,-133,66","start":"1998-06-01T00:00:00Z","end":"1998-06-30T11:59:59Z","processing":["L0","L1"],"format":"list","platform":["E2","R1"]} );
    sr = new SearchResults();
    sr.fetchSearchResults(sp);
    expect( sr.error ).toEqual("");
  //  expect( sr.length ).toEqual(16); // FAILS because of the timeout, need to use spyOn or other Jasmine trick

  });

});


var granules = [ {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:25:08","PROCESSINGTYPE":"L1.0","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.0/A3/ALPSRP234721390-L1.0.zip","BYTES":371233566,"FILESIZE":354.04,"OFFNADIRANGLE":34.3,"MD5SUM":"0a9e1ead0734236c67f8d57d71fe2451","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.0.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}},{"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:44:57","PROCESSINGTYPE":"L1.1","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.1/A3/ALPSRP234721390-L1.1.zip","BYTES":1282526812,"FILESIZE":1223.11,"OFFNADIRANGLE":34.3,"MD5SUM":"d292fe08a97c55f5f4eeec9111352e8f","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.1.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}},{"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:56:57","PROCESSINGTYPE":"BROWSE","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE/A3/ALPSRP234721390.jpg","BYTES":542548,"FILESIZE":.52,"OFFNADIRANGLE":34.3,"MD5SUM":"c910145b9b9e7965f19e9990d1a7c367","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390.jpg","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}},{"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:57:14","PROCESSINGTYPE":"L1.5","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.5/A3/ALPSRP234721390-L1.5.zip","BYTES":89901116,"FILESIZE":85.74,"OFFNADIRANGLE":34.3,"MD5SUM":"994bd83b67ecf0bbf00a2f1908f34787","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.5.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}} ]

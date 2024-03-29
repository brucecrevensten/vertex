
describe("DataProduct", function() {
  it("should capture the product's data", function() {
    dp = new DataProduct(
      {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:56:57","PROCESSINGTYPE":"BROWSE","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE/A3/ALPSRP234721390.jpg","BYTES":542548,"FILESIZE":.52,"OFFNADIRANGLE":34.3,"MD5SUM":"c910145b9b9e7965f19e9990d1a7c367","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390.jpg","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}
      });
    expect(dp.toJSON()).toEqual(
      {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:56:57","PROCESSINGTYPE":"BROWSE","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE/A3/ALPSRP234721390.jpg","BYTES":542548,"FILESIZE":.52,"OFFNADIRANGLE":34.3,"MD5SUM":"c910145b9b9e7965f19e9990d1a7c367","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390.jpg","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]},sizeText : '529.83 KB'
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
        "BYTES":1234564321,
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
  { format : 'jsonp', granule_list : 'ALPSRP234721390,ALPSRP234721380,ALPSRP234721370,ALPSRP234721360', bbox : '-149.46,63.78,-145.96,65.56', processing : [ 'L0', 'L1', 'L1.5', 'L1.0', 'L1.1' ], platform : [ 'E1', 'E2', 'J1', 'A3', 'R1' ], start : '2010-12-01', end : '2011-01-01', path : ' ', frame : ' ', offnadir : 0, direction : 'any' }  
    );
  });

  it("should be able to use refresh() to bootstrap from a known list of model data represented as JSON", function() {
    sr = new SearchResults();
    sr.refresh( granules );
    expect( sr.length ).toEqual(4);

    dp = new DataProduct( {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:25:08","PROCESSINGTYPE":"L1.0","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.0/A3/ALPSRP234721390-L1.0.zip","BYTES":371233566,"FILESIZE":354.04,"OFFNADIRANGLE":34.3,"MD5SUM":"0a9e1ead0734236c67f8d57d71fe2451","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.0.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}});
    expect( sr.first().toJSON() ).toEqual( dp.toJSON() );
  });

  /* again, removing test because this needs to be properly mocked. 
  it("should have a SearchResults object that can perform a search against the API", function() {

    sp = new SearchParameters( {"bbox":"-135,64,-133,66","start":"1998-06-01T00:00:00Z","end":"1998-06-30T11:59:59Z","processing":["L0","L1"],"format":"list","platform":["E2","R1"]} );
    sr = new SearchResults();
    sr.fetchSearchResults(sp);
    expect( sr.error ).toEqual("");
  //  expect( sr.length ).toEqual(16); // FAILS because of the timeout, need to use spyOn or other Jasmine trick

  });

  */
});


var granules = [ {"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:25:08","PROCESSINGTYPE":"L1.0","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.0/A3/ALPSRP234721390-L1.0.zip","BYTES":371233566,"FILESIZE":354.04,"OFFNADIRANGLE":34.3,"MD5SUM":"0a9e1ead0734236c67f8d57d71fe2451","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.0.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}},{"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:44:57","PROCESSINGTYPE":"L1.1","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.1/A3/ALPSRP234721390-L1.1.zip","BYTES":1282526812,"FILESIZE":1223.11,"OFFNADIRANGLE":34.3,"MD5SUM":"d292fe08a97c55f5f4eeec9111352e8f","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.1.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}},{"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:56:57","PROCESSINGTYPE":"BROWSE","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE/A3/ALPSRP234721390.jpg","BYTES":542548,"FILESIZE":.52,"OFFNADIRANGLE":34.3,"MD5SUM":"c910145b9b9e7965f19e9990d1a7c367","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390.jpg","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}},{"GRANULENAME":"ALPSRP234721390","PRODUCTNAME":"ALPSRP234721390","PLATFORM":"ALOS","SENSOR":"SAR","BEAMMODETYPE":"FBD","BEAMMODEDESC":"ALOS PALSAR sensor: High Resolution Observation Mode (dual polarization)","ORBIT":23472,"PATHNUMBER":158,"FRAMENUMBER":1390,"ACQUISITIONDATE":"2010-06-21 04:27:26","PROCESSINGDATE":"2011-01-11 22:57:14","PROCESSINGTYPE":"L1.5","STARTTIME":"2010-06-21 04:27:22","ENDTIME":"2010-06-21 04:27:26","CENTERLAT":69.52,"CENTERLON":-98.4504,"NEARSTARTLAT":69.207,"NEARSTARTLON":-99.103,"NEARENDLAT":69.699,"NEARENDLON":-99.437,"FARSTARTLAT":69.336,"FARSTARTLON":-97.48,"FARENDLAT":69.83,"FARENDLON":-97.778,"FARADAYROTATION":3.091217,"ASCENDINGDESCENDING":"ASCENDING","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1.5/A3/ALPSRP234721390-L1.5.zip","BYTES":89901116,"FILESIZE":85.74,"OFFNADIRANGLE":34.3,"MD5SUM":"994bd83b67ecf0bbf00a2f1908f34787","GRANULEDESC":"ALOS PALSAR scene","GRANULETYPE":"ALOS_PALSAR_SCENE","FILENAME":"ALPSRP234721390-L1.5.zip","SHAPE":{"SDO_GTYPE":2003,"SDO_SRID":8307,"SDO_ELEM_INFO":[1,1003,1],"SDO_ORDINATES":[-99.103,69.207,-97.48,69.336,-97.778,69.83,-99.437,69.699,-99.103,69.207]}} ]

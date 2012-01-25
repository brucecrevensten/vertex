describe("DataProduct.js", function(){
  beforeEach( function() {
    //$.storage.del('q_cookie_');
    jasmine.getFixtures().fixturesPath = 'spec/fixtures/';
    loadFixtures('SearchApp.html');
    loadFixtures('searchReturn.js');
    window.SearchApp = new SearchAppView();

  });

  afterEach( function() {
    //$.storage.del('q_cookie_');
  });

  describe("DataProductFile: Backbone.Model", function(){
    it('Can be created with default values for its attributes.', function() {
      var productFile = new DataProductFile(searchReturn[0]);
      expect(productFile.get("SENSOR")).toBe("SAR");
      expect(productFile.get("GRANULENAME")).toBe("E2_81917_STD_F305");
    });

    it('Will set passed attributes on the model instance when created.', function() {
      var productFile = new DataProductFile({ productId: 'granule name' });
      expect(productFile.get('productId')).toBe('granule name');
    });
  });

  describe("DataProductFiles: Backbone.Collection", function(){
    it("Can add Model instances as objects and arrays.", function(){
      var productFiles = new DataProductFiles();

      expect(productFiles.length).toBe(0);

      productFiles.add({"SENSOR":"SAR","PROCESSINGTYPEDISPLAY":"Level One Image","OFFNADIRANGLE":"NA","NEARSTARTLAT":"58.3593","FARENDLAT":"57.6179","BYTES":"50810536","PROCESSINGDATE":"2011-01-05 15:58:53","URL":"http://testdatapool.daac.asf.alaska.edu:80/L1/E2/E2_81917_STD_F305.zip","ORBIT":"81917","PATHNUMBER":"NA","ACQUISITIONDATE":"2010-12-20 20:03:59","NEARENDLON":"-133.8548","GRANULETYPE":"E2_STD_FRAME","CENTERLAT":"57.9924","PROCESSINGLEVEL":"L1","PROCESSINGDESCRIPTION":"Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.","GRANULENAME":"E2_81917_STD_F305","FARSTARTLON":"-135.0323","ENDTIME":"2010-12-20 20:03:59","STARTTIME":"2010-12-20 20:03:43","FARENDLON":"-135.4652","ID":"E2_81917_STD_F305_L1","ASCENDINGDESCENDING":"DESCENDING","NEARENDLAT":"57.4047","THUMBNAIL":"http://testdatapool.daac.asf.alaska.edu:80/THUMBNAIL/E2/E2_81917_STD_F305_THUMBNAIL.jpg","FRAMENUMBER":"305","MISSIONNAME":null,"PRODUCTNAME":"E2_81917_STD_F305","BEAMMODEDESC":"ERS-1,ERS-2,JERS-1 Standard Beam SAR","NEARSTARTLON":"-133.3774","FILENAME":"E2_81917_STD_F305.zip","PROCESSINGTYPE":"L1","POLARIZATION":"VV","BROWSE":"http://testdatapool.daac.asf.alaska.edu:80/BROWSE512/E2/E2_81917_STD_F305_512.jpg","FARSTARTLAT":"58.5762","MD5SUM":"70c89195d59ac90276bdababa50719d7","FILESIZE":"48.46","PLATFORM":"ERS-2","BEAMMODETYPE":"STD","CENTERLON":"-134.4326","GRANULEDESC":"ERS-2 Standard Beam Data in ASF Frame Size","FARADAYROTATION":"NA"});


      expect(productFiles.length).toBe(1);

      productFiles.add(searchResults);

      expect(productFiles.length).toBe(5);

    });

  });

  describe("DataProduct: Backbone.Model", function(){
    it("Can be created with default values for its attributes", function(){
      var dataProduct = new DataProduct(searchReturn[0]);

      expect(dataProduct.get("SENSOR")).toBe("SAR");
      expect(dataProduct.get("ACQUISITIONDATE")).toBe("2010-12-20 20:03:59");
      expect(dataProduct.get("acquisitionDateText")).toBe("2010-12-20");
      expect(dataProduct.get("GRANULENAME")).toBe("E2_81917_STD_F305");
      expect(dataProduct.get("PROCESSINGLEVEL")).toBe("L1");
    });

    it("Will set passed attributes on the model instance when created.", function(){
      var dataProduct = new DataProduct({
        "SENSOR": "SAR",
        "ACQUISITIONDATE": "2010-12-20 20:03:59",
        "GRANULENAME": "E2_81917_STD_F305",
        "PROCESSINGLEVEL": "L1"
      });

      expect(dataProduct.get("SENSOR")).toBe("SAR");
      expect(dataProduct.get("ACQUISITIONDATE")).toBe("2010-12-20 20:03:59");
      expect(dataProduct.get("acquisitionDateText")).toBe("2010-12-20");
      expect(dataProduct.get("GRANULENAME")).toBe("E2_81917_STD_F305");
      expect(dataProduct.get("PROCESSINGLEVEL")).toBe("L1");
    });
  });

});

describe("DataProduct.js", function(){
  beforeEach( function() {
    //$.storage.del('q_cookie_');
    jasmine.getFixtures().fixturesPath = 'spec/fixtures/';
    loadFixtures('SearchApp.html');
    //window.SearchApp = new SearchAppView();

  });

  afterEach( function() {
    //$.storage.del('q_cookie_');
  });

  describe("DataProductFile: Backbone.Model", function(){
    it('Will set passed attributes on the model instance when created.', function() {
      var file = searchResults[0].FILES[0];

      var productFile = new DataProductFile(file);

      expect(productFile.get("GRANULENAME")).toBe("ALPSRS258452300");
      expect(productFile.get("BYTES")).toBe(570247589);
      expect(productFile.get("FILENAME")).toBe('ALPSRS258452300-L1.0.zip');

    });

  });

  describe("DataProductFiles: Backbone.Collection", function(){
    it("Can add Model instances as objects and arrays.", function(){
      var files = searchResults[0].FILES;
      var productFiles = new DataProductFiles();
      expect(productFiles.length).toBe(0);

      productFiles.add(files[0]);
      expect(productFiles.length).toBe(1);

      productFiles.add(files[1]);
      expect(productFiles.length).toBe(2);

      var productFiles2 = new DataProductFiles(files);
      expect(productFiles2.length).toBe(2);

    });

  });

  describe("DataProduct: Backbone.Model", function(){
    it("Will set passed attributes on the model instance when created.", function(){
      var dataProduct = new DataProduct(searchResults[0]);

      expect(dataProduct.get("SENSOR")).toBe("SAR");
      expect(dataProduct.get("ACQUISITIONDATE")).toBe("2010-11-30 20:56:41");
      expect(dataProduct.get("acquisitionDateText")).toBe("2010-11-30");
      expect(dataProduct.get("GRANULENAME")).toBe("ALPSRS258452300");
      expect(dataProduct.files.length).toBe(2);

    });

  });

});

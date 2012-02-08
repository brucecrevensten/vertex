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
      var file = searchResults[0].files[0];

      var productFile = new DataProductFile(file);

      expect(productFile.get("granuleName")).toBe("E2_81431_STD_F289");
      expect(productFile.get("bytes")).toBe(137988125);
      expect(productFile.get("fileName")).toBe('E2_81431_STD_L0_F289.zip');

    });

  });

  describe("DataProductFiles: Backbone.Collection", function(){
    it("Can add Model instances as objects and arrays.", function(){
      var files = searchResults[0].files;
      var productFiles = new DataProductFiles();
      expect(productFiles.length).toBe(0);

      productFiles.add(files[0]);
      expect(productFiles.length).toBe(1);

      productFiles.add(files[1]);
      expect(productFiles.length).toBe(2);

      var productFiles2 = new DataProductFiles(files);
      expect(productFiles2.length).toBe(3);

    });

  });

  describe("DataProduct: Backbone.Model", function(){
    it("Will set passed attributes on the model instance when created.", function(){
      var dataProduct = new DataProduct(searchResults[0]);

      expect(dataProduct.get("sensor")).toBe("SAR");
      expect(dataProduct.get("acquisitionDate")).toBe("2010-11-16 21:11:05");
      expect(dataProduct.get("acquisitionDateText")).toBe("2010-11-16");
      expect(dataProduct.get("granuleName")).toBe("E2_81431_STD_F289");
      expect(dataProduct.files.length).toBe(3);

    });

  });

});

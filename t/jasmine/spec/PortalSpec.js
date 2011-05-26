// Basic unit test for the FilterCollection

describe("backbone", function() {
  it("should have a name for the product", function() {
    dp = new DataProduct(
      {
        name: 'testDataProduct'
      }
      );
    expect(dp.get('name')).toEqual('testDataProduct');
  });

  it("should render the name of the product", function() {
    dp = new DataProduct(
      {
        name: 'testDataProduct'
      }
      );
    dpv = new DataProductView({model:dp});
    expect($(dpv.render()).html()).toEqual('<span>testDataProduct</span>');
  });
});

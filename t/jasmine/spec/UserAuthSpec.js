describe("UserAuth.js", function(){
  beforeEach( function() {

    jasmine.getFixtures().fixturesPath = 'spec/fixtures';
    loadFixtures('SearchApp.html');

    window.SearchApp = new SearchAppView();

    this.xhr = sinon.useFakeXMLHttpRequest();
    var requests = this.requests = [];

    this.xhr.onCreate = function (xhr) {
      requests.push(xhr);
    };

  });

  afterEach( function() {
    this.xhr.restore();
  });

  describe("User: Backbone.Model", function(){
    it('Can be created with default values for its attributes.', function() {
      this.user = new User();

      console.log(this.user);
      expect(this.user.get("authenticated")).toBeFalsy();
      expect(this.user.get("userid")).toBe('');
      expect(this.user.get("password")).toBe('');
      expect(this.user.get("authType")).toBe('');
      expect(this.user.get("user_first_name")).toBe('');

    });

    it('Will set passed attributes on the model instance when created.', function() {
      this.user = new User(fixtures.testUser);

      expect(this.user.get("authenticated")).toBeFalsy();
      expect(this.user.get("userid")).toBe('testUser');
      expect(this.user.get("password")).toBe('testest');
      expect(this.user.get("authType")).toBe('LEGACY');
      expect(this.user.get("user_first_name")).toBe('Tester');

    });


  });

});

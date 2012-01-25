describe("UserAuth.js", function(){
  beforeEach( function() {
    //$.storage.del('q_cookie_');
    jasmine.getFixtures().fixturesPath = 'spec/fixtures/';
    loadFixtures('SearchApp.html');

    window.SearchApp = new SearchAppView();

  });

  afterEach( function() {
    //$.storage.del('q_cookie_');
  });

  describe("User: Backbone.Model", function(){
    it('Can be created with default values for its attributes.', function() {
      var user = new User();
      expect(user.get("authenticated")).toBe(false);
      expect(user.get("userid")).toBe('');
      expect(user.get("password")).toBe('');
      expect(user.get("authType")).toBe('');
      expect(user.get("user_first_name")).toBe('');
    });

    it('Will set passed attributes on the model instance when created.', function() {
      var user = new User({
        authenticated: false,
        userid: 'testUser',
        password: 'testest',
        authType: 'LEGACY',
        user_first_name: 'Tester'
      });

      expect(user.get("authenticated")).toBe(false);
      expect(user.get("userid")).toBe('testUser');
      expect(user.get("password")).toBe('testest');
      expect(user.get("authType")).toBe('LEGACY');
      expect(user.get("user_first_name")).toBe('Tester');
    });
  });

});

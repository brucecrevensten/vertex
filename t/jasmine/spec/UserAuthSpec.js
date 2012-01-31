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

    it('Will communicate with the server to receive credentials', function(){
      this.user = new User({"userid": "testUser", "password": "testtest"});

      expect(this.user.authenticate).toBeDefined();

      this.user.authenticate();
      expect(this.requests.length).toEqual(1);

      console.log(requests[0]);

      this.requests[0].respond(200, { "Content-Type": "application/json" },'{"authenticated": true, "authType": "UNIVERSAL", "user_first_name":"Tester"}');
      console.log(this.user);
    });

    it('Will provide credentials to authorized users', function(){
      this.user = new User({"userid": "testUser", "password": "testtest"});

      expect(this.user.authenticate).toBeDefined();

      this.user.authenticate();
      expect(this.requests.length).toEqual(1);

      this.requests[0].respond(200, { "Content-Type": "application/json" },'{"authenticated": true, "authType": "UNIVERSAL", "user_first_name":"Tester"}');
      console.log(this.user);
      expect(this.user.get("authenticated")).toBeTruthy();
      expect(this.user.get("authType")).toBe("UNIVERSAL");
      //test the widget renderer values that they are for universal
    });

    it('Will default to providing Unrestricted credentials to users without other authentication', function(){
      this.user = new User({"userid": "testUser", "password": "testtest"});

      expect(this.user.authenticate).toBeDefined();

      this.user.authenticate();
      expect(this.requests.length).toEqual(1);

      this.requests[0].respond(200, { "Content-Type": "application/json" },'{"authenticated": true, "authType": "Unrestricted", "user_first_name":"Tester"}');
      console.log(this.user);
      expect(this.user.get("authenticated")).toBeTruthy();
      expect(this.user.get("authType")).toBe("Unrestricted");
    });


  });

});

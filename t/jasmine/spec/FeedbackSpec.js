describe("Feedback.js", function(){

  describe("Feedback: Backbone.Model", function(){
    it('Can be created with default values for its attributes.', function() {
      var fb = new Feedback();
      expect(fb.get("name")).toBe('unknown');
      expect(fb.get("email")).toBe('unknown');
    });

    it('Will set passed attributes on the model instance when created.', function() {
      var fb = new Feedback({'name': 'Test User', 'email': 'testuser@somewhere.com'});
      expect(fb.get('name')).toBe('Test User');
      expect(fb.get('email')).toBe('testuser@somewhere.com');
    });

    it('Provides the correct url', function(){
      expect(true).toEqual(false);
    });

    it('Contains validation rules, and will trigger an error event on failed validation.', function(){
      expect(true).toEqual(false);
    });

    it('Provides a correct url for the model', function(){
      expect(true).toEqual(false);
    });
  });

});

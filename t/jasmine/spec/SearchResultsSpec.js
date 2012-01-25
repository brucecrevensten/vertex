describe("SearchResults.js", function(){

  describe("SearchResults: Backbone.Collection", function(){
    it("Can add Model instances as objects and arrays", function(){
      expect(true).toEqual(false);
    });

    it("Comparator function returns the processing type as a string", function(){
      expect(true).toEqual(false);
    });

  });

  describe('SearchResultsProcessingWidget: Backbone.View', function() {

    beforeEach(function() {
      setFixtures('<div id="srProcLevelTool"></div>');

      //create a model to test against
      this.model = new SearchResults({
        text: "My Todo",
        order: 1,
        done: false
      });

      this.view = new SearchResultsProcessingWidget({ model: this.model });
      $('#srProcLevelTool').append(this.view.render().el);
    });


    afterEach(function() {
      this.view.remove();
      $('#srProcLevelTool').remove();
    });

    it('Should be tied to a DOM element when created, based off the property provided.', function() {
      //what html element tag name represents this view?
      expect(this.view.el.nodeName.toLowerCase()).toBe('div');
    });

    it('Should have a class of "searchResults" ', function(){
      expect($(this.view.el)).toHaveClass('searchResults');  //double check this class assignment
    });

    it('Is backed by a model instance, which provides the data.', function() {
      expect(this.view.model).toBeDefined();

      // what's the value for Todo.get('done') here?  ie. test some model attribute
      expect(this.view.model.get('done')).toBe(false); //or toBeFalsy()
    });

    describe("Rendering", function() {

      it("returns the view object", function() {
        expect(this.view.render()).toEqual(this.view);
      });

      it("produces the correct HTML", function() {
        this.view.render();

        //let's use jasmine-jquery's toContain() to avoid
        //testing for the complete content of a todo's markup
        expect(this.view.el.innerHTML)
        .toContain('<label class="todo-content">My Todo</label>');  //get the correct html we're using
      });

    });


 });


 //this one is wrong... fix it after getting the other correct
 describe('SearchResultsView: Backbone.View', function() {

  beforeEach(function() {
    $('body').append('<div id="srProcLevelTool"></ul>');
    this.SearchResultsView = new SearchResultsView({ model: new SearchResults() });
  });


  afterEach(function() {
    this.SearchResultsView.remove();
    $('#srProcLevelTool').remove();
  });

  it('Should be tied to a DOM element when created, based off the property provided.', function() {
    //what html element tag name represents this view?
    expect(SearchResultsView.el.tagName.toLowerCase()).toBe('div');
  });

});


});

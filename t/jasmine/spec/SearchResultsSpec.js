describe("SearchResults.js", function(){

  describe("SearchResults: Backbone.Collection", function(){
    it("Can add Model instances as objects and arrays", function(){
      this.dp = searchResults;
      this.sr = new SearchResults();
      expect(this.sr.length).toBe(0);

      this.sr.add(this.dp[0]);
      expect(this.sr.length).toBe(1);

      this.sr.add([this.dp[1], this.dp[2]]);
      expect(this.sr.length).toBe(3);
    });

    it('Can have a url property to define the basic url structure for all contained models.', function() {
      this.dp = searchResults;
      this.sr = new SearchResults(this.dp);

      // what has been specified as the url base in our model?
      expect(this.sr.url).toBe('http://localhost/services/search/json');
    });

    it('Can fetch information from the server', function(){
      expect(true).toEqual(false);
    });

  });

  describe('SearchResultsProcessingWidget: Backbone.View', function() {

    beforeEach(function() {
      $('body').append('<div id="srProcLevelTool"></div>');
      this.dp = searchResults;
      this.sr = new SearchResults(this.dp);

      this.view = new SearchResultsProcessingWidget({ el: '#srProcLevelTool', collection: this.sr });
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

    it('Is backed by a collection instance, which provides the data.', function() {
      expect(this.view.collection).toBeDefined();

      // test some collection.model attribute
      expect(this.view.collection[0].get('granuleName')).toBe('E2_81431_STD_F289');
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

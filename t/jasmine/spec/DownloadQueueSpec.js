
describe("Download Queue", function() {

  var files = $.merge(searchResults[0].files, searchResults[2].files);
  var dp1 = new DataProductFile(files[0]);
  var dp2 = new DataProductFile(files[1]);
  var dp3 = new DataProductFile(files[2]);
  var dp4 = new DataProductFile(files[3]);
  var dp5 = new DataProductFile(files[4]);
  var dp6 = new DataProductFile(files[5]);

  dp1.set( { "bytes":500 } );
  dp2.set( { "bytes":10000 } );
  dp3.set( { "bytes":20000 } );
  dp4.set( { "bytes":1100000 } );
  dp5.set( { "bytes":5500000000 } );
  dp6.set( { "bytes":1900000000000 } );

  describe("Initialization Tests", function(){

    it("should allow items to be added to it", function() {
      this.dq = new DownloadQueue();

      this.dq.add( dp1 );
      expect( this.dq.length ).toEqual( 1 );
      expect( this.dq.at(0).get('granuleName') ).toEqual( 'E2_81431_STD_F289' );
      expect( this.dq.at(0).get('fileName') ).toEqual( 'E2_81431_STD_L0_F289.zip' );

      this.dq.add( dp2 );
      expect( this.dq.length ).toEqual( 2 );
      expect( this.dq.at(1).get('granuleName') ).toEqual( 'E2_81431_STD_F289' );
      expect( this.dq.at(1).get('fileName') ).toEqual( 'E2_81431_STD_F289.jpg' );
    });

    it("should allow you to remove items from the queue", function() {
      this.dq = new DownloadQueue();

      this.dq.add( [ dp1, dp2, dp3 ] );
      expect( this.dq.length).toEqual( 3 );

      this.dq.remove( dp1 );
      expect( this.dq.length).toEqual( 2 );

      this.dq.remove( [ dp2, dp3 ] );
      expect( this.dq.length).toEqual( 0 ) ;

    });

    it("should know the size (in bytes) of the queue, and show that as a nicely formatted string", function() {
      this.dq = new DownloadQueue();

      expect( this.dq.length ).toEqual( 0 );
      expect( this.dq.getSizeInBytes() ).toEqual( 0 );
      expect( AsfUtility.bytesToString( this.dq.getSizeInBytes() )).toEqual( "0 B" );

      this.dq.add( dp1 );
      expect( this.dq.length ).toEqual( 1 );
      expect( this.dq.getSizeInBytes() ).toEqual( 500 );
      expect( AsfUtility.bytesToString( this.dq.getSizeInBytes() )).toEqual( "500 B" );

      this.dq.add( [ dp2, dp3 ] );
      expect( this.dq.length ).toEqual( 3 );
      expect( this.dq.getSizeInBytes() ).toEqual( 30500 );
      expect( AsfUtility.bytesToString( this.dq.getSizeInBytes() )).toEqual( "29.79 KB" );

      this.dq.add( dp4 );
      expect( this.dq.length ).toEqual( 4 );
      expect( this.dq.getSizeInBytes() ).toEqual( 1130500 );
      expect( AsfUtility.bytesToString( this.dq.getSizeInBytes() )).toEqual( "1.08 MB" );

      this.dq.add( dp5 );
      expect( this.dq.length ).toEqual( 5 );
      expect( this.dq.getSizeInBytes() ).toEqual( 5501130500 );
      expect( AsfUtility.bytesToString( this.dq.getSizeInBytes() )).toEqual( "5.12 GB" );


      this.dq.add( dp6 );
      expect( this.dq.length ).toEqual( 6 );
      expect( this.dq.getSizeInBytes() ).toEqual( 1905501130500 );
      expect( AsfUtility.bytesToString( this.dq.getSizeInBytes() )).toEqual( "1.73 TB" );

    });

  });

  describe("Download queue summary button", function() {

    beforeEach( function(){
      $('body').append('<div id="dqSummaryView"></div>');

      this.dq = new DownloadQueue();
      this.dqsView = new DownloadQueueSummaryView( { el: '#dqSummaryView', collection: this.dq } );
    });

    afterEach( function(){
      this.dqsView.remove();
      $('#dqSummaryView').remove();
    });

    it('Should be tied to a DOM element when created, based off the property provided.', function() {
        //what html element tag name represents this view?
        expect( this.dq ).toBeDefined();
        expect( this.dq.length ).toEqual( 0 );

        expect( this.dqsView ).toBeDefined();
        expect( this.dqsView.el.tagName.toLowerCase() ).toBe('div');
        expect( this.dqsView.render().el.innerHTML ).toContain('Download queue <span class="empty">(empty)</span>');
    });

    it("can render a 'Download Queue' summary button that describes the current state of the queue", function() {
      this.dq.add( dp1 );
      expect( this.dq.length ).toEqual( 1 );
      expect( this.dqsView.render().el.innerHTML ).toContain('Download queue <span class="nonempty">(1 item, 500 B)</span>');

      this.dq.add( [ dp2, dp3, dp4, dp5, dp6 ] );

      expect( this.dq.length ).toEqual( 6 );
      expect( this.dqsView.render().el.innerHTML ).toContain('Download queue <span class="nonempty">(6 items, 1.73 TB)</span>');

    });

  });

  describe("Download Queue modal popup", function() {

    describe("Download Queue table of queue contents", function() {
      beforeEach( function() {
        $.storage.del('q_cookie_');
        //jasmine.getFixtures().fixturesPath = 'spec/fixtures';
        //loadFixtures('SearchApp.html');

        $('body').append('<div id="download_queue"><table id="download_queue_table" style="width: 100%"></table></div>');

        this.dq = new DownloadQueue();
        this.dqv = new DownloadQueueView( { el: '#download_queue', collection: this.dq } );

        this.dq.add( [ dp1, dp2, dp3, dp4, dp5, dp6 ] );

        this.r = this.dqv.render().el.innerHTML;
      });

      afterEach( function() {
        $.storage.del('q_cookie_');
        this.dqv.remove();
        $('#download_queue_table').remove();
        $('#download_queue').remove();
      });

      it("returns the view object", function() {
        expect(this.dqv.render()).toEqual(this.dqv);
      });

      it("lists the products in the queue", function() {
        $('body').append('<div id="test"><table id="download_queue_table" style="width: 100%"></table></div>');
        this.dq2 = new DownloadQueue([dp1, dp2, dp3, dp4, dp5, dp6]);
        this.view = new DownloadQueueView({el: '#test', collection: this.dq2});
        this.view.render();
        //console.log(this.r);
        expect( this.r ).toContain('E2_81431_STD_L0_F289.zip');
        expect( this.r ).toContain('E2_81431_STD_F289');
        expect( this.r ).toContain('E2_78554_STD_F283');
        expect( this.r ).toContain('E2_78554_STD_L0_F283');
      });

      it("has radio buttons to let user choose download format", function() {

        expect( r ).toContain('Bulk Download (.metalink)');
        expect( r ).toContain('Spreadsheet (.csv)');
        expect( r ).toContain('Google Earth (.kml)');

      });

      it("has a download button that fires an async request to the API", function() {
        expect( r ).toContain('Download');

        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];

        this.xhr.onCreate = function (xhr) {
          requests.push(xhr);
        };

        expect(this.requests.length).toEqual(1);

        this.requests[0].respond(200, { "Content-Type": "application/json" },'{"authenticated": true, "authType": "UNIVERSAL", "user_first_name":"Tester"}');

        this.xhr.restore();
      });
    });
  });
});


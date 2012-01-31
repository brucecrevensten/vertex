
describe("Download Queue", function() {
  it("should allow items to be added to it", function() {
    dq = new DownloadQueue();
    dp = new DataProduct(searchReturn[0]);
    dq.add( dp );
    expect( dq.length ).toEqual( 1 );
    expect( dq.at(0).toJSON().GRANULENAME ).toEqual( 'E2_81917_STD_F305' );
  });

  it("should allow you to remove items from the queue", function() {
    dq = new DownloadQueue();
    dp1 = new DataProduct();
    dp2 = new DataProduct();
    dp3 = new DataProduct();
    dq.add( [ dp1, dp2, dp3 ] );
    expect( dq.length).toEqual( 3 );
    dq.remove( dp1 );
    expect( dq.length).toEqual( 2 );
    dq.remove( [ dp2, dp3 ] );
    expect( dq.length).toEqual( 0 ) ;

  });

  it("should know the size (in bytes) of the queue, and show that as a nicely formatted string", function() {
    dq = new DownloadQueue();
    expect( dq.length ).toEqual( 0 );
    expect( dq.getSizeInBytes() ).toEqual( 0 );
    expect( AsfUtility.bytesToString( dq.getSizeInBytes() )).toEqual( "0 B" );
    dp1 = new DataProduct( { "BYTES":500 } );
    dq.add( dp1 );
    expect( dq.length ).toEqual( 1 );
    expect( dq.getSizeInBytes() ).toEqual( 500 );
    expect( AsfUtility.bytesToString( dq.getSizeInBytes() )).toEqual( "500 B" );
    dp2 = new DataProduct( { "BYTES":10000 } );
    dp3 = new DataProduct( { "BYTES":20000 } );
    dq.add( [ dp2, dp3 ] );
    expect( dq.length ).toEqual( 3 );
    expect( dq.getSizeInBytes() ).toEqual( 30500 );
    expect( AsfUtility.bytesToString( dq.getSizeInBytes() )).toEqual( "29.79 KB" );
    dp4 = new DataProduct( { "BYTES":1100000 } );
    dq.add( dp4 );
    expect( dq.length ).toEqual( 4 );
    expect( dq.getSizeInBytes() ).toEqual( 1130500 );
    expect( AsfUtility.bytesToString( dq.getSizeInBytes() )).toEqual( "1.08 MB" );
    dp5 = new DataProduct( { "BYTES":5500000000 } );
    dq.add( dp5 );
    expect( dq.length ).toEqual( 5 );
    expect( dq.getSizeInBytes() ).toEqual( 5501130500 );
    expect( AsfUtility.bytesToString( dq.getSizeInBytes() )).toEqual( "5.12 GB" );
    dp6 = new DataProduct( { "BYTES":1900000000000 } );
    dq.add( dp6 );
    expect( dq.length ).toEqual( 6 );
    expect( dq.getSizeInBytes() ).toEqual( 1905501130500 );
    expect( AsfUtility.bytesToString( dq.getSizeInBytes() )).toEqual( "1.73 TB" );

  });

  describe("Download queue summary button", function() {

    it("can render a 'Download Queue' summary button that describes the current state of the queue", function() {

      dq = new DownloadQueue();
      dqsv = new DownloadQueueSummaryView( { collection: dq } );
      expect( dq.length ).toEqual( 0 );
      expect( dqsv.render().el.innerHTML ).toContain('Download queue <span class="empty">(empty)</span>');

      dp1 = new DataProduct( { "BYTES":500 } );
      dq.add( dp1 );
      expect( dq.length ).toEqual( 1 );
      expect( dqsv.render().el.innerHTML ).toContain('Download queue <span class="nonempty">(1 item, 500 B)</span>');
      dp2 = new DataProduct( { "BYTES":10000 } );
      dp3 = new DataProduct( { "BYTES":20000 } );
      dp4 = new DataProduct( { "BYTES":1100000 } );
      dp5 = new DataProduct( { "BYTES":5500000000 } );
      dp6 = new DataProduct( { "BYTES":1900000000000 } );
      dq.add( [ dp2, dp3, dp4, dp5, dp6 ] );
      expect( dq.length ).toEqual( 6 );
      expect( dqsv.render().el.innerHTML ).toContain('Download queue <span class="nonempty">(6 items, 1.73 TB)</span>');

      });
  });

  describe("Download Queue modal popup", function() {

    describe("Download Queue table of queue contents", function() {

      dq = new DownloadQueue();
      dqv = new DownloadQueueView( { collection: dq } );

      dq.add( [
        new DataProduct( { "ACQUISITIONDATE":"2011-01-01", "PLATFORM":"ALOS", "PROCESSINGTYPE":"L0", "GRANULENAME":"granule1", "BYTES":500 } ),
        new DataProduct( { "ACQUISITIONDATE":"2011-01-01", "PLATFORM":"ALOS", "PROCESSINGTYPE":"L0", "GRANULENAME":"granule2", "BYTES":10000 } ),
        new DataProduct( { "ACQUISITIONDATE":"2011-01-01", "PLATFORM":"ALOS", "PROCESSINGTYPE":"L0", "GRANULENAME":"granule3", "BYTES":20000 } ),
        new DataProduct( { "ACQUISITIONDATE":"2011-01-01", "PLATFORM":"ALOS", "PROCESSINGTYPE":"L0", "GRANULENAME":"granule4", "BYTES":1100000 } ),
        new DataProduct( { "ACQUISITIONDATE":"2011-01-01", "PLATFORM":"ALOS", "PROCESSINGTYPE":"L0", "GRANULENAME":"granule5", "BYTES":5000000000 } ),
        new DataProduct( { "ACQUISITIONDATE":"2011-01-01", "PLATFORM":"ALOS", "PROCESSINGTYPE":"L0", "GRANULENAME":"granule6", "BYTES":1900000000000 } )
      ] );

      r = dqv.render().el.innerHTML;

      it("lists the products in the queue", function() {

        expect( r ).toContain('granule1');
        expect( r ).toContain('granule2');
        expect( r ).toContain('granule3');
        expect( r ).toContain('granule4');
        expect( r ).toContain('granule5');
        expect( r ).toContain('granule6');
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

        console.log(requests[0]);

        this.requests[0].respond(200, { "Content-Type": "application/json" },'{"authenticated": true, "authType": "UNIVERSAL", "user_first_name":"Tester"}');

        this.xhr.restore();
      });
    });
  });
});


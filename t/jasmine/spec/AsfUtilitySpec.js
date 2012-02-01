describe("AsfUtility", function(){

  describe("byteToString()", function(){

    it("should return correct Byte", function(){
      var size = 500;
      expect(AsfUtility.bytesToString(size)).toEqual('500 B');
    });

    it("should return correct KiloBytes", function(){
      var size = 2*1024;
      expect(AsfUtility.bytesToString(size)).toEqual('2.00 KB');
    });

    it("should return correct MegaBytes", function(){
      var size = 2*1024*1024;
      expect(AsfUtility.bytesToString(size)).toEqual('2.00 MB');
    });

    it("should return correct GigaBytes", function(){
      var size = 2*1024*1024*1024;
      expect(AsfUtility.bytesToString(size)).toEqual('2.00 GB');
    });

    it("should return correct TeraBytes", function(){
      var size = 2*1024*1024*1024*1024;
      expect(AsfUtility.bytesToString(size)).toEqual('2.00 TB');
    });

  });

  describe("rtrim()", function(){

    it("should remove all whitespace to the right of the characters", function(){
      var someText = '   i should pass    ';
      expect(AsfUtility.rtrim(someText)).toEqual('   i should pass');
    });

  });

  describe("ucfirst()", function(){

    it("should make the first character uppercase", function(){
      var moreText = 'uppercase';
      expect(AsfUtility.ucfirst(moreText)).toEqual('Uppercase');
    });

  });

});

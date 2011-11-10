var Dictionary = Backbone.Model.extend(
  {
  	
  		initialize: function() {
  			this.dictionary = {};
  			this.length = 0;
  		},

  		add: function(key, value) {
        console.log("ADDING " + key);
        if (key != undefined && key != null) {
    			if (value == null || value == undefined) {
  	  			value=1;
  	  		}
    			this.dictionary[key] = value;
    			this.length = this.length + 1;
        }
  		},

  		remove: function(key) {
        console.log("REMOVING " + key);
        if (key != undefined) {
    			delete this.dictionary[key];
    			this.length = this.length - 1;
    			if (this.length < 0 ) {
    				this.length = 0;
    			}
        }
  		},

  		has: function(key) {
  			if (this.dictionary[key] != undefined && this.dictionary[key] != null) {
  				return true;
  			} else {
  				return false;
  			}
  		},

  		val: function(key) {
  			if (this.dictionary[key] != undefined) {
  				return this.dictionary[key];
  			} else {
  				return null;
  			}
  		},

      clear: function() {
        this.dictionary = {};
        this.length = 0;
      }
  });
var User = Backbone.Model.extend(
	{
		
		defaults: {
			authenticated: false,
			userid: '',
			password: '',
			authType: '',
			user_first_name:'',
		},

		initialize: function() {
			this.widgetRenderer = this.getWidgetRenderer();
		},
		
		authenticate: function(attrs) {	
			
			$.ajax({
				type: "POST",
				url: AsfDataportalConfig.authUrl,
				data: { userid: this.get('userid'), password: this.get('password') },
				dataType: "json",
				context: this,
				success: function(data, textStatus, jqXHR) {
					this.set( {'authenticated': true, 'authType': data.authType, 'user_first_name':data.user_first_name} );
					this.widgetRenderer = this.getWidgetRenderer();
					this.trigger('authSuccess');
				},
				error: function(error) {
					this.trigger('authError');
				}, 
				beforeSend: function() {
				}
			}); 
		},
		
		logout: function(attrs) {	
			$.ajax({
				type: "POST",
				url: AsfDataportalConfig.logoutUrl,
				data: { userid: this.get('userid'), password: this.get('password') },
				dataType: "json",
				context: this,
				success: function(data, textStatus, jqXHR) {
					this.set( {'authenticated': false, 'authType': 'UNRESTRICTED'} );
					this.widgetRenderer = this.getWidgetRenderer();
					this.trigger('authSuccess');
					
				},
				error: function(error) {
						this.set( {'authenticated': false, 'authType': 'UNRESTRICTED'} );
						this.widgetRenderer = this.getWidgetRenderer();
						this.trigger('authError');
				}
			}); 
		},

		getWidgetRenderer: function() {
			switch( this.get('authType')) {							
				case 'UNIVERSAL': return new UniversalUserWidgetRenderer( { model: this.model } );
				case 'ALOS': return new AlosUserWidgetRenderer( { model: this.model } );
				case 'LEGACY': return new LegacyUserWidgetRenderer( { model: this.model } );
				default: return new UnrestrictedWidgetRenderer( { model: this.model } );
			}
		},

		getRestrictionTester: function() {
			switch( this.get('authType')) {
				case 'UNIVERSAL' : return new UniversalRestrictionTester();
				case 'ALOS' : return new AlosRestrictionTester();
				case 'LEGACY' : return new LegacyRestrictionTester();
				default : return new UnrestrictedRestrictionTester();
			}
		}
	}
);

var UniversalRestrictionTester = Backbone.Model.extend({
	containsRestrictedProduct: function( p ) {
		return false;
	}	
});

var AlosRestrictionTester = Backbone.Model.extend({
	restricted: [ 'ERS-1', 'ERS-2', 'JERS-1', 'RADARSAT-1' ],
	containsRestrictedProduct: function( p ) {
		return ( 0 != _.intersection( _.uniq( p.pluck('platform')), this.restricted ).length );
	}	
});

var LegacyRestrictionTester = Backbone.Model.extend({
	restricted: [ 'ALOS' ],
	containsRestrictedProduct: function( p ) {
		return ( 0 != _.intersection( _.uniq( p.pluck('platform')), this.restricted ).length );
	}	
});

var UnrestrictedRestrictionTester = Backbone.Model.extend({
	restricted: [ 'ALOS', 'ERS-1', 'ERS-2', 'JERS-1', 'RADARSAT-1' ],
	containsRestrictedProduct: function( p ) {
		return ( 0 != _.intersection( _.uniq( p.pluck('platform')), this.restricted ).length );
	}	
});

var UserLoginView = Backbone.View.extend(
	{

		initialize: function() {
			_.bindAll(this, "render");
		
	    },
	
		login: function() {
      ntptEventTag('ev=somethingBad');
			this.model.set($(this.el).find('form').serializeJSON());
			this.model.authenticate();
		},
		
		render: function() {
			$( "#login_dialog" ).dialog({
				draggable: false,
				resizable: false,				
				height: 275,
				width: 350,
				modal: true,
				buttons: {
					"Register": function(){
            ntptEventTag('ev=somethingBad');
						window.open('http://www.asf.alaska.edu/program/sdc/proposals');
  						return false;
					},
					"Cancel" : jQuery.proxy( function() {
				    	$('#login_dialog').dialog('close');
					},this),
					"Login": jQuery.proxy( function() {
						this.login();
					}, this)
				}
			}).keypress( jQuery.proxy(function(e) {
				    if(e.keyCode == 13) { // 13 = Enter/Return
						this.login();
				    }
				}, this)
				).bind('dialogclose', jQuery.proxy(function() { this.model.trigger('authFieldsRefresh')}, this)); //refresh every time it closes
				
			return this;
		},
	}
);

var UserLoginMessage = Backbone.View.extend( {
	initialize: function() {
			_.bindAll(this, "render");
			this.model.bind('authSuccess', this.render);
			this.model.bind('authError', this.render);
			this.model.bind('authRefresh', this.render);
	},
	
	render: function() {
		if( this.model.get('authenticated') == true) {
					$(this.el).html( _.template( 	
						'<div id="login_msg"> Welcome <%= user_first_name %>! </div>', {'user_first_name':this.model.get('user_first_name')}) );
		} else {
					$(this.el).html( _.template( 	
						'<div id="login_msg"> Welcome Explorer!') );
		}
	}
	
});


var UserLoginFields = Backbone.View.extend( {
	initialize: function() {	
		// Alert the user to an invalid username/password combination
		this.model.bind('authError', 
			jQuery.proxy(function() 
				{
					$(this.el).html( _.template( 	
						'<form name="form1" id="form1">\
						<font color = "red"><p>Invalid username and/or password</p></font><br/>\
		  				<label for="login_username" class="login_fields">Name<font color = "red" class="star">     *</font></label>\
		  				<input type="text" name="userid" id="login_username" class="login_fields"  /><br />\
		  				<label for="login_password" class="login_fields">Password<font color = "red" class="star">     *</font></label>\
		  				<input type="password" name="password" id="login_password" value="" class="login_fields" /><br />\
		  				</form>') );
			    }, this)
		);
		
		this.model.bind('authFieldsRefresh', 
			jQuery.proxy(function() 
				{
					$(this.el).html( _.template( 	
						'<form name="form1" id="form1" class="login_fields">\
		  				<label for="login_username" class="login_fields">Name</label>\
		  				<input type="text" name="userid" id="login_username" class="login_fields" /><br />\
		  				<label for="login_password" class="login_fields">Password</label>\
		  				<input type="password" name="password" id="login_password" value="" class="login_fields" /><br />\
		  				</form>') );
			    }, this)
		);
	}
	
});

var UserLoginButton = Backbone.View.extend( {
		
		initialize: function() {
			_.bindAll(this, "render");
			this.model.bind('authSuccess', jQuery.proxy(function() {
				this.render();
			}, this));

		},
		

	render: function () {

		if( this.model.get('authenticated') == true) {
				$("#login_dialog").dialog("close");
				$(this.el).find('#login_button').button({ label: "Logout"});
				$(this.el).find('#login_button').button().unbind('click', this.login_button_action);	
				$(this.el).find('#login_button').button().bind('click', this.logout_button_action);
				
		} else {
			$(this.el).html( _.template( '<button id="login_button">Login</button>') );
			$(this.el).find('#login_button').button().unbind('click', this.logout_button_action);
			$(this.el).find('#login_button').button().bind('click', this.login_button_action);
		}
		return this;
	},
	
	login_button_action: function() {
    ntptEventTag('ev=somethingbad');
		SearchApp.userLoginView.render();
		return this;
	},
	
	logout_button_action: function() {
			SearchApp.user.logout();
			return this;
	}
});





var User = Backbone.Model.extend(
	{
		
		defaults: {
			authenticated: false,
			userid: '',
			password: '',
			authType: ''
		},

		initialize: function() {
			this.widgetRenderer = this.getWidgetRenderer();
		},
		
		authenticate: function(attrs) {	
			console.log("Authenticating");
			console.log(this);
			console.log(this.get('userid'));
			
			$.ajax({
				type: "POST",
				url: AsfDataportalConfig.authUrl,
				data: { userid: this.get('userid'), password: this.get('password') },
				dataType: "json",
				context: this,
				success: function(data, textStatus, jqXHR) {
					this.set( {'authenticated': true, 'authType': data.authType} );
					this.widgetRenderer = this.getWidgetRenderer();
					this.trigger('authSuccess');	
				},
				error: function(error) {
					console.log("There was an error");
					console.log(error);
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
						this.trigger('authSuccess');
				}
			}); 
		},

		getWidgetRenderer: function() {
			switch( this.get('authType')) {							
				case 'UNIVERSAL': console.log("GOT UNIVERSAL"); return new UniversalUserWidgetRenderer( { model: this.model } );
				case 'ALOS': console.log("GOT ALOS");  return new AlosUserWidgetRenderer( { model: this.model } );
				case 'LEGACY': console.log("GOT LEGACY"); return new LegacyUserWidgetRenderer( { model: this.model } );
				default: console.log("GOT UNRESTRICTED");  return new UnrestrictedWidgetRenderer( { model: this.model } );
			}
		}
	}
);

var UserLoginView = Backbone.View.extend(
	{

		initialize: function() {
			_.bindAll(this, "render");
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
						window.open('http://www.asf.alaska.edu/program/sdc/proposals');
  						return false;
					},
					"Cancel" : function() {
						$( this).dialog('close');
					},
					"Login": jQuery.proxy( function() {
						this.model.set($(this.el).find('form').serializeJSON());
						this.model.authenticate();
					
						
						if( true == this.model.get('authenticated')) {
							$( '#login_dialog' ).dialog( "close");
						} else {
							$( '#login_dialog').dialog( "close");
				 			// update with error message
						}       
					}, this),
					"Logout": jQuery.proxy( function() {
						this.model.logout();
						$( '#login_dialog' ).dialog( "close");
					}, this)
				}
			});
		    return this;
		},
	}
);

var UserLoginButton = Backbone.View.extend( {

	render: function () {

		if( this.model.get('authenticated') == true) {

		} else {
			$(this.el).html( _.template( '<button id="login_button">Login</button>') );
			$(this.el).find('#login_button').button().click( function() {
				SearchApp.userLoginView.render();
			});
		}
		return this;
	}
});





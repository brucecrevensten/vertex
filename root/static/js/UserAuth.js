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
			console.log("Begin Authenticate");
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
					this.trigger('authError');
				}, 
				beforeSend: function() {
					console.log("Sending Ajax Request");
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
						
					}, this)
				}
			});
		    return this;
		},
	}
);

var UserLoginButton = Backbone.View.extend( {
		
		initialize: function() {
			_.bindAll(this, "render");
			this.model.bind('authSuccess', jQuery.proxy(function() {
				this.render();
			}, this));
			this.model.bind('authError', function() {
				console.log("Inccorect username and/or password");
			})
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
		SearchApp.userLoginView.render();
		return this;
	},
	
	logout_button_action: function() {
			console.log("Log out Clicked");
			SearchApp.user.logout();
			return this;
	}
});





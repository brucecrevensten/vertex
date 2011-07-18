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
					console.log("Success");
					this.set( {'authenticated': true, 'authType': data.authType} );
					this.widgetRenderer = this.getWidgetRenderer();
					
					console.log(this);
				},
				error: function(error) {
					console.log("There was an error");
					this.set('authenticated', false);
					console.log(error);
					
				}
			}); 
		},

		getWidgetRenderer: function() {
			// if the model isn't available, default to a fallback
			if ( typeof this.model == 'undefined' ) { return new DefaultWidgetRenderer(); }
			
			switch( this.model.get('authType')) {
				default: return new DefaultWidgetRenderer( { model: this.model } );
			}
		}
	}
);

var DefaultWidgetRenderer = Backbone.View.extend({});


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
							$( this ).dialog( "close");
						} else {
							console.log("User name and/or password is incorrect");
				//			// update with error message
						}       
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

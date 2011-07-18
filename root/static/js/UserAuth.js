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
			$.ajax({
				type: "POST",
				url: AsfDataportalConfig.authUrl,
				data: { userid: this.get('userid'), password: this.get('password') },
				dataType: "json",
				context: this,
				success: function(data, textStatus, jqXHR) {
					this.model.set('authenticated', true);
					this.model.set('authType', data.authType);
					this.widgetRenderer = this.getWidgetRenderer();
				},
				error: function(error) {
					this.model.set('authenticated', false);
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
					"Login":  function() {
						this.model.set( $(this.el).serializeArray() );
						this.model.authenticate();
						if( true == this.model.get('authenticated')) {
							$( this ).dialog( "close");
						} else {
							// update with error message
						}       
					},
					"Register": function(){
						window.open('http://www.asf.alaska.edu/program/sdc/proposals');
  						return false;
					},
					"Cancel" : function() {
						$( this).dialog('close');
					}
					
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

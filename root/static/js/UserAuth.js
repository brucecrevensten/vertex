/* 
 The Basic sketch of the User Model. Contains a User Name and a Password. As well as a variable
 to keep track of the number of login attempts (We may want to respond to this after so many attempts).
 It Overrides Backbone's validate function: this means that when User.set({}) is called on the user_name 
 and password, validate will execute against these attributes. Currently the username and password
 are hardcoded into the validate method but we will replace this with an ajax call to the API's 
 authentication service. 

 TODO: Add code to send ajax request to authentication service. Also add flag to deter the request
 	   and to not set the username and password if the user is already logged in 
*/
var User = Backbone.Model.extend(
	{
		user_name: null,
		password: null,
		login_attempts: 0,
		
		defaults: {
			login_attempts: 0
		},
		
		validate: function(attrs) {
			if (0 == (attrs.user_name == "username") || 0==(attrs.password == "password")) {
				return "bad username and or password";	
			} 
		} 
	}
);

/*
	The sketch of the View that displays the user login information on the Search App page. 
	It hooks into #user_auth_submit div element so that it can modify content on the page there. 
	Binds error methods to the models (User) error's. This means that when User.validate() returns 
	anything (indicating an error) then the error is delegated to the method invoked within the
	model's error binding (see below). 
	
	We create a dialog that has a few buttons and a username/password login text fields. 
	Respond to these fields and hide/show the login/logout buttons when authenticaion is successful. 
	
	Bind this View to click events on the login/logout buttons
	
	Todo: Remove all of the alert invocations and replace with something more snazzy. 
		  Add event binding to the Logout button to invoke ajax request to logout. 
*/
var UserLoginView = Backbone.View.extend(
	{
		el:  $("#user_auth_submit"),
		
		initialize: function() {
			
				this.model.bind("error", function(model, error) {
					alert(error);
				});
	
				user = this.model;

			 _.bindAll(this, "render");
			
			$( "#dialog_mod" ).dialog({
				autoOpen: false,
				height: 200,
				width: 350,
				modal: true,
				buttons: {
					"Login":  function() {
						name = $("#name").val();
						pass = $("#pas").val();

						if (user.set({	user_name: name,
										password: pass 		})) 
					    {
	
							user.set({
									user_name: name, 
									password: pass, 
									login_attempts: user.get("login_attempts")+1, 
							});
							
							// Hide the login button and show the logout button. 
							$("#my_b").hide();
							$("#my_b2").button({ label: "Logout"}).show();
							
							$("div.msg").replaceWith("<div id="+'"msg"'+' class="msg"'+"><p>Welcome " + user.get("user_name") + ", Login attempts: " + user.get("login_attempts") + "</p></div>");
				
							$( this ).dialog( "close");
						} else {
							user.set({login_attempts: user.get("login_attempts")+ 1}, {silent:true});
						}       
					},
					"Register": function() {
						alert("Registration is currently closed due to smugness. Find a new pool.");
					},
					Cancel: function() {
						$( this ).dialog( "close" );
					}
				},
				close: function() {
					allFields.val( "" ).removeClass( "ui-state-error" );
				}
			});
	    },
		
		events: {
			"click #my_b": "attemptLogin",
			"click #my_b2": "attemptLogout",
		},
		
		render: function() {
			$("#my_b").button( { label: "Login"});
			$("my_b2").button({label:"Logout"}).hide();
		    return this;
		},
		
		attemptLogin: function() {
			$("#dialog_mod").dialog('open')
		},
		attemptLogout: function() {
			$("#my_b2").hide();
			$("#my_b").show();
			$("div.msg").replaceWith("<div id="+'"msg"'+' class="msg"'+">");
		}
		
	}
	
);

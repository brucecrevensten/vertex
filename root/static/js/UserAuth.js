/* 
 User Model.
 Contains a User Name, login attempts and authorization 
 Perform ajax post request to authenticate the user
*/
var User = Backbone.Model.extend(
	{
		user_name: null,
		login_attempts: 0,
		auth_type: "",		// authorization type restricts/enhances content
		
		defaults: {
			login_attempts: 0,
			auth_type: ""
		},
		
		initialize: function() {
		},
		
		validate: function(attrs) {		
			// Write Sanity check code here. 
				$.ajax({
					type: "POST",
					url: AsfDataportalConfig.authUrl,
					data: "userid="+attrs.user_name + '&' + 'password='+attrs.password
				});
		}
	}
);

/*
	UserLoginView
	Displays the user login information on the Search App page. 
	It hooks into #user_auth_submit div element so that it can modify content on the page there. 
	Binds error methods to the models (User) error's. This means that when User.validate() returns 
	anything (indicating an error) then the error is delegated to the method invoked within the
	model's error binding (see below). 
	
	We create a dialog that has a few buttons and a username/password login text fields. 
	Respond to these fields and hide/show the login/logout buttons when authenticaion is successful. 
	
	Bind this View to click events on the login/logout buttons
	
	Todo: Add event binding to the Logout button to invoke ajax request to logout. 
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
				create: function() {
					$("#dialog_mod").append("")
				},
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
							
							$("div.msg").replaceWith("<div id="+'"msg"'+' class="msg"'+"><p>Welcome " + user.get("user_name") + "</p></div>");
				
							$( this ).dialog( "close");
						} else {
							user.set({login_attempts: user.get("login_attempts")+ 1}, {silent:true});
						}       
					},
					"Register": function() {
						console.log("Register Button Clicked");
						window.location.replace("http://ursa.asfdaac.alaska.edu/cgi-bin/login/guest/");
					}
				},
				close: function() {
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
			$("#dialog_mod").dialog('open');
		},
		attemptLogout: function() {
			$("#my_b2").hide();
			$("#my_b").show();
			$("div.msg").replaceWith("<div id="+'"msg"'+' class="msg"'+">");
		}
		
	}
	
);

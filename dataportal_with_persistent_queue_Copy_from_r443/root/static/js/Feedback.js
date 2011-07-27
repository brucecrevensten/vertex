var Feedback = Backbone.Model.extend({
	url: AsfDataportalConfig.feedbackUrl,
	defaults: {
		'name':'unknown',
		'email':'unknown'
	},
	validate: function(attrs) {
		if( true == _.isUndefined( attrs.comment ) || 0 == attrs.comment ) {
			return { 'type':'local', 'message':'Comment field is required to submit this form.'};
		}
	}
});

var FeedbackButton = Backbone.View.extend( {
	el: '#feedbackButton',
	render: function() {
		$(this.el).html( '<a>Feedback</a>' ).click( function() {
			var v = new FeedbackForm( { model: new Feedback() } );
			v.render();
		}).button({
			'label':'Feedback',
			'icons': {
				'primary':'ui-icon-mail-closed'
			}
		});
	}
});

var FeedbackForm = Backbone.View.extend({
	el: '#feedbackForm',
	initialize: function() {
		_.bindAll(this, "render");
	},
	render: function() {
		$(this.el).html(
'<form>\
<p>We welcome your comments!  Email address and name are optional.  If you need support or help, please contact\
ASF User Support at uso@asf.alaska.edu or at (907) 474-6166.</p>\
<div>\
<label for="fc_name">Name</label><input id="fc_name" class="optional" size="30" name="name" />\
</div>\
<div>\
<label for="fc_email">Email</label><input id="fc_email" class="optional" size="30" name="email" />\
</div>\
<div>\
<label for="fc_comments">Comments (Required)</label><textarea id="fc_comments" class="required" cols="40" rows="8" name="comment" /></textarea>\
</div>\
<input id="fc_userid" type="hidden" name="userid" />\
</form>\
');
		$(this.el).find('#fc_userid').val( SearchApp.user.userid );
		$(this.el).dialog(
			{
	      		width: 400,
		      	modal: true,
		      	draggable: false,
		      	resizable: false,
		      	title: "Give us feedback on this user interface!",
		      	position: "center",
		      	buttons:
		      	{
				"Cancel" : function()
					{
						$( this ).dialog('close');
					},
				"Send Feedback": $.proxy( function()
					{
						this.model.save( $(this.el).find('form').serializeJSON(),
							{
								success: $.proxy( function(model, response)
									{
										$(this.el).html(
'<div class="ui-widget">\
<div class="ui-state-highlight ui-corner-all" style="padding: 1em;"><p><span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>\
<strong>Thanks!</strong>&nbsp;\
Your feedback has been recorded.\
</p></div></div>\
										').dialog(
											{
												width: 400,
												modal: true,
												draggable: false,
												resizable: false,
												title: "Thanks for providing feedback!",
												position: "center",
												buttons:
													{
														'Close' : function()
															{ $(this).dialog('close'); }
													}
											}
										);
									}, this),
								error: $.proxy( function(model, response)
									{ 
										// Error local (validation) or remote (server trouble?)
										if( true != _.isUndefined( response.type ) && 'local' == response.type ) {
											alert('"Comments" field is required to submit feedback.');
										} else {
											$(this.el).html(
	'<div class="ui-widget">\
	<div class="ui-state-error ui-corner-all" style="padding: 1em;"><p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span>\
	Sorry, an error occurred and your feedback could not be saved.  Please email uso@asf.alaska.edu or call (907) 474-4166 if you would like to contribute some feedback.\
	</p></div></div>\
										').dialog(
											{
												width: 400,
												modal: true,
												draggable: false,
												resizable: false,
												title: "Failed to save feedback",
												position: "center",
												buttons:
													{
														'Close' : function() { $(this).dialog('close'); }
													}
											}
										);
									}
								}, this)
			  				}	
			  			);
			  		}, this) // end submit feedback button
			  	}
			}
		);
	    return this;
	}
});
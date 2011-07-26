var Feedback = Backbone.Model.extend({
	url: AsfDataportalConfig.feedbackUrl,	

});

var FeedbackButton = Backbone.View.extend( {
	el: '#feedbackButton',
	render: function() {
		$(this.el).html( '<a>Feedback</a>' ).click( function() {
			var v = new FeedbackForm( { model: this } );
			v.render();
		});
	}
});

var FeedbackForm = Backbone.View.extend({
	el: '#feedbackForm',
	initialize: function() {
		_.bindAll(this, "render");
	},
	render: function() {
		this.model = new Feedback();
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
<label for="fc_comments">Comments</label><textarea id="fc_comments" class="required" cols="40" rows="8" name="comment" /></textarea>\
</div>\
<input id="fc_userid" type="hidden" name="userid" />\
</form>\
');
		$(this.el).find('#fc_userid').val( SearchApp.user.userid );
		$(this.el).dialog({
	      width: 400,
	      modal: true,
	      draggable: false,
	      resizable: false,
	      title: "Give us feedback on this user interface!",
	      position: "center",
	      buttons: {
			"Cancel" : function() {
				$( this ).dialog('close');
			},
			"Send Feedback": $.proxy( function() {
				this.model.set( $(this.el).find('form').serializeJSON() );
				this.model.save();
			}, this)
			}
		  });

	    return this;
	}
});
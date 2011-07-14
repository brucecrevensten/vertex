var Feedback = Backbone.Model.extend({
	url: AsfDataportalConfig.feedbackUrl,	
	validate: function(attrs){
		
	},
	submit_feedback: function(attrs) {		
		$.ajax({
			type: "POST",
			url: AsfDataportalConfig.feedbackUrl,
			data: { userid: this.get('feedback_comment')},
			dataType: "json",
			context: this,
			success: function(data, textStatus, jqXHR) {
				this.widgetRenderer = this.getWidgetRenderer();
			},
			error: function(error) {
				console.log(error);
			}
		});
	},

});

var FeedbackForm = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this, "render");
	},
	render: function() {
		$(this.el).html(
	        _.template('\
			<div id="feedback">\
			<p> the form would go here</p>\
			<form action="<%= URL %>" method="post">
	  			<input class="required" type="textarea" cols="60" rows="8" name="feedback_comment" /><br />
			</form>
			<button id="feedback_button">Submit Feedback</button>
			</div>\
	    	', this.model.toJSON())
	    );
		
		
		$(this.el).dialog({
	      width: 700,
	      modal: true,
	      draggable: false,
	      resizable: false,
	      title: "Feedback Form",
	      position: "center",
	      buttons: {
			"Cancel" : function() {
				$( this).dialog('close');
			},
			"Feedback":  function() {
				this.model.set( $(this.el).serializeArray() );
				this.model.subnit_feedback();
	    });

	    return this;
	}
});
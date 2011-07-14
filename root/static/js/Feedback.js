var Feedback = Backbone.Model.extend({
	url: AsfDataportalConfig.feedbackUrl,	

});

var FeedbackForm = Backbone.View.extend({
	render: function() {
	$(this.el).html(
        _.template('\
<div id="feedback">\
<p> the form would go here</p>
<a class="feeback_submit" href="<%= URL %>">Submit</a>\
</div>\
        ', this.model.toJSON())
      );
      $(this.el).find('a').button({
      	text: 'Download'
      });

      return this;
	}
});
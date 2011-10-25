package URSA2::Model::Feedback;

use strict;
use warnings;

use URSA2::Exceptions;
use Net::SMTP;

use base 'URSA2::Model::DBI::Proxy';

__PACKAGE__->config();

=item recordFeedback 

Accepts user feedback and records it in the database.

=cut
sub recordFeedback {
  my $self = shift;
  my $args = { @_ };
  my $dbh = $self->dbh;
  if (!defined($dbh)) {
    DbException->throw( 
      message => "Could not establish a database connection in Auth model",
    );
  }
  eval {
    my $sth = $dbh->prepare(qq(
      insert into dataportal_feedback (
        entered_date, user_login_id, ip_address, name, email, user_comment
      ) values (
        systimestamp, ?, ?, ?, ?, ?
      )
    ));
    $sth->bind_param(1, $args->{'userid'});
    $sth->bind_param(2, $args->{'ip_address'});
    $sth->bind_param(3, $args->{'name'});
    $sth->bind_param(4, $args->{'email'});
    $sth->bind_param(5, $args->{'comment'});
    $sth->execute();
    $dbh->commit();
  }; if($@) {
    $dbh->rollback();
    DbException->throw(message => $@);
  }
  
  # Set up the various fields for the email version of the feedback
  my $to_aref = ['asf-vertex@googlegroups.com'];                                                                        #TODO: move to config
  my $subject = 'Web Feedback from ' . $args->{'name'} . ' (' . ($args->{'userid'} or 'guest') . ')';
  my $msg_aref = [$args->{'comment'}];
  my $mail_from = $args->{'email'};
  my $reply_to = $args->{'email'};

  # Build mail header
  my $to = join ', ',@$to_aref;
  my @head;
  push(@head, "To: $to\n");
  push(@head, "Reply-to: $reply_to\n");
  push(@head, "From: $mail_from\n");
  push(@head, "Subject: $subject\n");
  push(@head, "MIME-Version: 1.0\n");
  push(@head, "X-Mailer: ASFMail\n");
  
  # Connect to SMTP server
  my $mail_server = 'smtp.asf.alaska.edu';                                                                          #TODO: move to config
  my $mailer = Net::SMTP->new($mail_server, Timeout => 60)
    or (URSA2->log->debug("$0: cannot open server '$mail_server' for writing: $!\n") and return);

  # Send the email
  $mailer->mail($mail_from) or (URSA2->log->debug("Invalid from address '$mail_from' in email: $!") and return);
  foreach my $email_address (@$to_aref) {
    $mailer->to($email_address) or (URSA2->log->debug("Invalid To address '$email_address' in email: $!") and return);
  }
  $mailer->data();
  $mailer->datasend(@head) or (URSA2->log->debug("Invalid header '@head' in email: $!") and return);
  $mailer->datasend(@$msg_aref) or (URSA2->log->debug("Invalid message in email: $!") and return);
  $mailer->dataend() or (URSA2->log->debug("SMTP dataend unsuccessful in email: $!") and return);
  $mailer->quit or (URSA2->log->debug("SMTP quit unsuccessful in email: $!") and return);
}

__PACKAGE__->meta->make_immutable(
inline_constructor => 0
);

1;

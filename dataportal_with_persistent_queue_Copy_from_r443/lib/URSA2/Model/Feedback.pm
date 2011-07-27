package URSA2::Model::Feedback;

use strict;
use warnings;

use URSA2::Exceptions;

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
}

__PACKAGE__->meta->make_immutable(
inline_constructor => 0
);

1;

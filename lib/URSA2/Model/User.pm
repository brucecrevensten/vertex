package URSA2::Model::User;

use strict;
use warnings;

use Digest::MD5 qw(md5_hex);
use Data::Dumper;
use CGI::Session;
use CGI::Cookie;
use URSA2::Exceptions qw(SessionException);

use base 'URSA2::Model::DBI::Proxy';

__PACKAGE__->config();

=item authenticate

Accepts username and password, attempts authentication against
the user_management.authenticate_user package, and returns
0 or 1 depending on if the auth attempt succeeds or not.

=cut
sub authenticate {
  my ($self, $u, $p) = @_;
  my $dbh = $self->dbh;
  if (!defined($dbh)) {
    DbException->throw( 
      message => "Could not establish a database connection in Auth model",
    );
  }
  my $ret_val = 0;
  my $sth = $dbh->prepare(qq(
    BEGIN
      ? := user_management.authenticate_user(?,?);
    END;
    ));
  $sth->bind_param_inout(1, \$ret_val, 16);
  $sth->bind_param(2, $u);
  $sth->bind_param(3, md5_hex($p));
  $sth->execute();
  
  return $ret_val;
   
}

sub authorize {
	my ($self, $userid) = @_;
	my $dbh = $self->dbh;
	if (!defined($dbh)) {
    	DbException->throw( 
      		message => "Could not establish a database connection in Auth model",
    	);
  	}
	my $ret_val = 0;
	my $sth = $dbh->prepare(qq(
	    BEGIN
	      ? := user_management.authorize_user(?);
	    END;
	));
	
	$sth->bind_param_inout(1, \$ret_val, 16);
	$sth->bind_param(2, $userid);
	$sth->execute();

	return $ret_val;
}

sub datapool_session_cookie {
  my ($self, $userid, $ip_address) = @_;
  my $session = 0;
  my $cookie = 0;

  eval {
    # Put the user's IP address into $ENV{REMOTE_ADDR} for CGI::Session::Oracle
    $ENV{REMOTE_ADDR} = $ip_address;

    $session = CGI::Session->new(
      'driver:Oracle', undef, {
        'Handle' => $self->dbh,
        'TableName' => 'sessions',
      }
    );
    $session->param('-user_name', $userid);
    $session->param('-logged-in', 1);
    $session->flush();
    $self->dbh->commit;
  }; if($@) {
    URSA2->log->fatal($@);
    # undef the $session (if we started to create one) in an eval block.
    # The CGI::Session object tries to write the session information to the
    # database when it leaves scope and that can die with an error.
    # Which causes our SessionException error to get eaten. 
    eval { undef $session; };
    SessionException->throw(
      message => "Error creating session."
    );
  }
  if($session && $session->isa('CGI::Session')) {
    eval {
      $cookie = CGI::Cookie->new(
        '-name' => URSA2->config->{'Model::User'}->{'cookie'}->{'name'},
        '-value' => $session->id,
        '-expires' => URSA2->config->{'Model::User'}->{'cookie'}->{'expires'},
        '-domain' => URSA2->config->{'Model::User'}->{'cookie'}->{'domain'}
      );
    }; if($@) {
      URSA2->log->fatal($@);
      CookieException->throw(
        message => "Error generating datapool authentication cookie."
      );
    }
  }

  return($cookie);
}

__PACKAGE__->meta->make_immutable(
inline_constructor => 0
);

1;

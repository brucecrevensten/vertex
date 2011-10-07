package URSA2::Controller::services;
use URSA2::Transformer;
use URSA2::SearchRequest;
use URSA2::AuthenticationRequest;
use URSA2::FeedbackRequest;
use URSA2::Exceptions;
use Moose;
use namespace::autoclean;
use Data::Dumper;

BEGIN {extends 'Catalyst::Controller'; }

=head1 NAME

URSA2::Controller::services - Catalyst Controller

=head1 DESCRIPTION

Catalyst Controller.

=head1 METHODS

=cut

=head2 index

=cut

sub index :Path :Args(0) {
  my ( $self, $c ) = @_;
  $c->detach('version');
}

sub version :Local {
  my ($self, $c) = @_;
  $c->response->body('URSA2 Services API Version '.$URSA2::VERSION);
}

=head2 search

This accepts either GET or POST requests and returns results in a variety of
text formats (.metalink, .csv).

=cut

sub search :Path {

  my ( $self, $c ) = @_;
  $c->stats->profile( begin => 'search' );
  my $t = URSA2::Transformer->new();

  $c->stats->profile('preparing to perform search...');

  if( $c->config->{static_shunt} == 1 ) {
    use File::Slurp;
    my $response = read_file('/tmp/static.jsonp');
    $c->response->body( $c->request->param('callback').'('.$response.')' );
    $c->response->content_type( 'application/json' );
    return;
   }

  eval {
    # decode and validate the request, throws Invalid/Missing exceptions if needed
    my $r = URSA2::SearchRequest->factory( $c->request );
    $r->decode();
    $r->validate();
    my $searchModel;
    if($r->format && ($r->format eq 'json' || $r->format eq 'jsonp')) {
      $searchModel = $c->model('Search::JSON');
    } else {
      $searchModel = $c->model('Search');
    }
      
    # TODO: move these into a shallow object hierarchy
    if ( $r->isCountRequest() ) {
      $t->{results} = $searchModel->getResultsCount($r);
    } elsif ( $r->isProductList() ) {
      $t->{results} = $searchModel->getResultsByProductList($r->products);
    } elsif ( $r->isGranuleList() ) {
      $t->{results} = $searchModel->getResultsByGranuleList($r);
    } else {
      # search based on spatial + other criteria

      if( (!defined($r->polygon) && !defined($r->bbox)) && ( !$r->frame && !$r->path)) {
        MissingParameter->throw( parameter=>'Spatial constraint (bbox or polygon)' );
      }

      $c->stats->profile('starting search...');
      $t->{results} = $searchModel->getResults( $r );
      $c->stats->profile('...finished search.');
    }

    my $e;
    if ( $e = Exception::Class->caught('DbException')) {
      $e->rethrow;
    } elsif ( $@ ) {
      $e = Exception::Class->caught();
      if ( ref $e ) {
        $e->rethrow;
      } else {
        $c->log->fatal( 'uncaught error after search block: '.Dumper($@) );
        $c->response->status(Apache2::Const::HTTP_INTERNAL_SERVER_ERROR);
        $c->detach();
      }
    }

    if(!defined($t->{'results'})) {
      DbNoResults->throw();
    } elsif(ref($t->{'results'}) eq 'ARRAY' && !scalar(@{$t->{'results'}})) {
      DbNoResults->throw();
    } elsif(ref($t->{'results'}) eq 'SCALAR' && !$t->{'results'}) {
      DbNoResults->throw();
    }

    $c->stats->profile('finished search, starting performing transformation...'); 
    if($r->format && ($r->format eq 'json' || $r->format eq 'jsonp')) {
      $t->{'output'} = $t->{'results'};
    } else {
      $t->{format} = $r->format;
      $t->transform( $c );
      $c->stats->profile('finished transformation.');
    }
  };

  my $e;
  
  if ( 
    ($e = Exception::Class->caught('MissingParameter'))
    || ($e = Exception::Class->caught('InvalidParameter'))
    || ($e = Exception::Class->caught('DbNoResults')) 
    || ($e = Exception::Class->caught('DbException')) 
  ) {
    $e->dispatch($c);
  } elsif( ( $@ && ref($@) ne 'Catalyst::Exception::Detach') || @{ $c->error } || $@ ) {
  $e = Exception::Class->caught();
    if ( ref $e ) {
      $c->log->fatal( 'Uncaught exception in services controller: '.$e->description );
    } else {
      $c->log->fatal( 'Unhandled error in services controller: '.Dumper($@) );
    }
    $c->response->status(Apache2::Const::HTTP_INTERNAL_SERVER_ERROR);
    $c->detach();
  } else {
    # processed ok

    #TODO: make this cleaner/wrap it up in SearchRequest/Transformer
    if( defined($c->request->param('format')) && 'jsonp' eq $c->request->param('format') ) {
      $c->response->body( $c->request->param('callback').'('.$t->getOutput().')' );
    } else {
      $c->response->body( $t->getOutput() );
    }
    $c->response->content_type( $t->getContentType() );
    $c->response->header('Content-Disposition' => 'attachment; filename='.$t->getFilename);
  }
}

=head2 Authentication

Authenticate the posted username and password.

=cut

sub authentication :Local {
  my ( $self, $c ) = @_;
  
  my $r = URSA2::AuthenticationRequest->factory( $c->request );
  my $cookie = undef;
  eval {
    $r->decode();
    $r->validate();

    my $user = $c->model('User');
    if ( $user->authenticate($r->userid, $r->password) ) {
      $cookie = $user->datapool_session_cookie($r->userid, $c->req->address);
		
    } else {
      if($r->redirect) {
        # Redirect authorization failures also.
        $c->response->redirect($r->redirect);
      } else {
        AuthorizationFailed->throw(); 
      }
    }
  };
  my $e = $@;
  if ( 
    ( $e = Exception::Class->caught('AuthorizationFailed') ) 
    || ( $e = Exception::Class->caught('MissingParameter') ) 
    || ( $e = Exception::Class->caught('UnknownParameter') ) 
    || ( $e = Exception::Class->caught('BadMethod') )
    || ( $e = Exception::Class->caught('CookieException') ) 
    || ( $e = Exception::Class->caught('SessionException') ) ) {
    $e->dispatch($c);
  } elsif ( $@ ) {
    $e = Exception::class->caught();
    if ( ref $e ) {
      $c->log->fatal( 'Uncaught exception in services controller: '.$e->description );
    } else {
      $c->log->fatal( 'Unhandled error in services controller: '.Dumper($@) );
    }
    $c->response->status(Apache2::Const::HTTP_INTERNAL_SERVER_ERROR);
    $c->detach();
  } else {
    $c->res->cookies->{datapool} = $cookie if $cookie;
    if($r->redirect) {
      $c->response->redirect($r->redirect);
    } else {
		my $auth_type ="UNRESTRICTED";
		$auth_type = $c->model('User')->authorize($r->userid);	
		
		# Get the User's First Name to display in a Welcome Message
		my $user_first_name = $c->model('User')->get_user_first_name($r->userid);
		
		$c->response->content_type('application/json; charset=utf-8');
		$c->res->body( '{"authType":"'.$auth_type.'", "user_first_name":"'.$user_first_name.'"}' ); 
    }
  }

}


# Remove the session id from the database (Effectively Logs-out the user)
sub destroy_session :Local {
  my ( $self, $c ) = @_;

	# Locate the cookie and grab the session id 
	my $id = $c->request->cookies->{'datapool'}->value;
	
	# Requires are larger LongReadLen to work
	$c->model('User')->dbh->{LongReadLen} = 2097152; # 2 mb

	# Instantiate an instance of an existing session using the session id
    my $session = CGI::Session->new(
      'driver:Oracle', $id, {
        'Handle' => $c->model('User')->dbh,
        'TableName' => 'sessions',
      }
    );

	# Remove the session from the database
	$session->delete();
	$session->flush();
	$c->model('User')->dbh->commit();	
}


=head2 Feedback

Accept a comment and store it in the database.

=cut

sub feedback :Local {
  my ( $self, $c ) = @_;

  my $r = URSA2::FeedbackRequest->factory( $c->request );
  eval {
    $r->decode();
    $r->validate();

    my $feedback = $c->model('Feedback');
    $feedback->recordFeedback(
      'userid'      => $r->{'userid'},
      'name'        => $r->{'name'},
      'email'       => $r->{'email'},
      'comment'     => $r->{'comment'},
      'ip_address'  => $c->req->address
    );
  };
  my $e = $@;
  if ( ( $e = Exception::Class->caught('MissingParameter') ) 
    || ( $e = Exception::Class->caught('DbException') ) ) {
      $e->dispatch($c);
  } elsif($@) {
    $e = Exception::Class->caught();
    if ( ref $e ) {
      $c->log->fatal( 'Uncaught exception in services controller: '.$e->description );
    } else {
      $c->log->fatal( 'Unhandled error in services controller: '.Dumper($@) );
    }
    $c->response->status(Apache2::Const::HTTP_INTERNAL_SERVER_ERROR);
    $c->detach();
  }
}

=head2 end

Do any last-minute captures + cleanup

=cut

sub end : Private {
  my ($self, $c) = @_;
  if($@) {
    $c->log->fatal( Dumper($@) );
    $c->response->status(Apache2::Const::HTTP_INTERNAL_SERVER_ERROR);
  }

}

__PACKAGE__->meta->make_immutable;

1;

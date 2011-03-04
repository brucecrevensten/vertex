package URSA2::Controller::services;
use URSA2::Transformer;
use URSA2::SearchRequest;
use URSA2::AuthenticationRequest;
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
  my $t = URSA2::Transformer->new();

  eval {
    # decode and validate the request, throws Invalid/Missing exceptions if needed
    my $r = URSA2::SearchRequest->factory( $c->request );
    $r->decode();
    $r->validate();
      
    if ( $r->isProductList() ) {

      $c->log->debug('doing product file list retrieval...');
      $t->{results} = $c->model('Search')->getResultsByProductList($r->products);

    } elsif ( $r->isGranuleList() ) {
      # fetch a specific list of granules
      $c->log->debug('doing granule list retrieval...');
      $t->{results} = $c->model('Search')->getResultsByGranuleList($r->granule_list);

    } else {
      # search based on spatial + other criteria
      $c->log->debug('searching based on provided criteria...');
     
      eval {
        $t->{results} = $c->model('Search')->getResults( $r );
      };
    }

    my $e;
    if ( $e = Exception::Class->caught('DbException')) {
      $e->rethrow;
    } elsif ( $e = Exception::Class->caught('DbNoResults')) {
      $e->rethrow;
    } elsif ( $@ ) {
      $c->log->fatal( 'uncaught error after search block: '.Dumper($@) );
      $c->response->status(500);
      $c->detach();
    }

    #TODO: remove if this is redundant
    if ( !defined($t->{results}) || 0 == scalar $t->{results} ) {
      DbNoResults->throw();
    }

    $c->log->debug( 'format: '.$r->format );
    $t->{format} = $r->format;
    $t->transform( $c );
  };

  my $e;
  
  if( $e = Exception::Class->caught('MissingParameter') ) {
    $c->response->status(400);
    $c->response->headers->header('Exception' => $e->message.' ('.$e->parameter.')');
    $c->stash( 
      message => $e->message,
      parameter => $e->parameter
    );
    $c->forward('URSA2::View::HTML');
  } elsif ( $e = Exception::Class->caught('InvalidParameter') ) {
    $c->response->status(400);
    $c->response->headers->header('Exception' => $e->description);
    $c->stash( 
      message => $e->message,
      parameter => $e->parameter
    );
    $c->forward('URSA2::View::HTML');
  } elsif ( $e = Exception::Class->caught('DbNoResults') ) {
    $c->response->headers->header('Exception' => $e->description);
    $c->response->status(204);
  } elsif ( $e = Exception::Class->caught('DbException')) {
    $c->response->status(500);
    $c->response->headers->header('Exception' => $e->description);
    $c->response->headers->header('Error' => $e->message);
    $c->stash( 
      message => $e->message,
    );
  } elsif( ( $@ && ref($@) ne 'Catalyst::Exception::Detach') || @{ $c->error }  ) {
    $c->log->fatal( 'Unhandled exception in services controller: '.Dumper($@) );
    $c->response->status(500);
  } else {
    # processed ok
    $c->response->body( $t->getOutput() );
    $c->response->content_type( $t->getContentType() );
    $c->response->header('Content-Disposition' => 'attachment; filename='.$t->getFilename);
  }

  $c->detach();
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
      AuthorizationFailed->throw(); 
    }
  };
  my $e = $@;
  if ( $e = Exception::Class->caught('AuthorizationFailed') ) {
    $c->response->headers->header('Exception' => $e->description);
    $c->response->status(401);
    $c->detach();
  } elsif ( $e = Exception::Class->caught('MissingParameter') ) {
    $c->response->headers->header('Exception' => $e->description);
    $c->response->status(400);
    $c->detach();
  } elsif ( $e = Exception::Class->caught('UnknownParameter') ) {
    $c->response->headers->header('Exception' => $e->description);
    $c->response->status(400);
    $c->detach();
  } elsif ( $e = Exception::Class->caught('BadMethodException') ){
    $c->response->headers->header('Exception' => $e->description);
    $c->response->status(405);
    $c->detach();
  } elsif ($e = Exception::Class->caught('CookieException') ) {
    $c->response->headers->header('Exception' => $e->description);
    $c->response->status(500);
    $c->detach();
  } elsif ($e = Exception::Class->caught('SessionException') ) {
    $c->response->headers->header('Exception' => $e->description);
    $c->response->status(500);
    $c->detach();
  } elsif ( $@ ) {
    $c->log->fatal($@);
    $c->detach();
  } else {
    $c->res->body('authentication succeeded!  cookies being set...');
    $c->res->cookies->{datapool} = $cookie if $cookie;
  }

}

=head2 end

Do any last-minute captures + cleanup

=cut

sub end : Private {
  my ($self, $c) = @_;
  if($@) {
    $c->log->fatal( Dumper($@) );
    $c->response->status(500);
  }

}

__PACKAGE__->meta->make_immutable;

1;

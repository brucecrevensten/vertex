package URSA2::Exception::Http;
use Exception::Class;
use base 'Exception::Class::Base';
use Apache2::Const q(:http);

use warnings;
use strict;

# as a default, return an internal server error
sub responseCode {
  return Apache2::Const::HTTP_INTERNAL_SERVER_ERROR;
}

sub dispatch {
  my ($self, $c) = @_;
  $c->log->debug('caught HttpException, HTTP'.$self->responseCode.': '.$self->description);
  $c->response->status($self->responseCode);
  $c->response->headers->header('Exception' => $self->description);
  $c->response->headers->header('Message' => $self->message);
  $c->response->headers->header('Parameter' => $self->parameter);
  $c->response->headers->header('Value' => $self->value);
  $c->stash( 
    message => $self->description,
    template => 'exception.tt',
  );
  $c->detach();
}

1;

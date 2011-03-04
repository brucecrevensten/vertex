package URSA2::Exception::Http;
use Exception::Class;
use base 'Exception::Class::Base';

use warnings;
use strict;

sub dispatch {
  my ($self, $c) = @_;
  $c->log->debug('caught HttpException, HTTP'.$self->responseCode.': '.$self->message);
  $c->response->status($self->responseCode);
  $c->detach();
}

1;

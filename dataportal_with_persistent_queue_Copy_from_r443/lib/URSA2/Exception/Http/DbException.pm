package URSA2::Exception::Http::DbException;
use Exception::Class;
use base ('Exception::Class::Base', 'URSA2::Exception::Http');
use Apache2::Const q(:http);

use warnings;
use strict;

sub dispatch {
  my ($self, $c) = @_;
  $c->log->fatal('Database error: '.$self->message);
  $self->SUPER::dispatch($c);
}

1;

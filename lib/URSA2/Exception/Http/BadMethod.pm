package URSA2::Exception::Http::BadMethod;
use Exception::Class;
use base ('Exception::Class::Base', 'URSA2::Exception::Http');
use Apache2::Const q(:http);

use warnings;
use strict;

sub responseCode {
  my $self = shift;
  return(Apache2::Const::HTTP_METHOD_NOT_ALLOWED);
}

1;

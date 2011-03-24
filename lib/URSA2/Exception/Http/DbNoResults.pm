package URSA2::Exception::Http::DbNoResults;
use Exception::Class;
use base ('Exception::Class::Base', 'URSA2::Exception::Http');
use Apache2::Const q(:http);

use warnings;
use strict;

sub responseCode {
  my $self = shift;
  return(Apache2::Const::HTTP_NO_CONTENT);
}

1;

package URSA2::Model::DBI::Proxy;

use strict;
use base 'Catalyst::Model::Proxy';

__PACKAGE__->config(
    target_class           => 'DBI',
    subroutines            => [ qw( dbh ) ]
);

1;

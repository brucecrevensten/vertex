package URSA2::Model::DBI::Proxy;

use strict;
use base 'Catalyst::Model::Proxy';

__PACKAGE__->config(
    target_class           => 'DBI',
    subroutines            => [ qw( dbh ) ]
);

=head1 NAME

URSA2::Model::DBI::Proxy - Proxy Model Class

=head1 SYNOPSIS

See L<URSA2>

=head1 DESCRIPTION

Proxy Model Class.

=head1 AUTHOR

Edward Trochim

=head1 LICENSE

This library is free software, you can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;

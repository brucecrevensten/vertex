package URSA2::Controller::portal;
use Moose;
use namespace::autoclean;

BEGIN {extends 'Catalyst::Controller'; }



sub index :Path :Args(0) {
    my ( $self, $c ) = @_;
    $c->stash(template => 'index.tt2');
}



__PACKAGE__->meta->make_immutable;

1;

package URSA2::SearchRequest::Plain;
use base qw(URSA2::SearchRequest);
use warnings;
use strict;

sub new {
  my ($this, $r) = @_;
  my $class = ref($this) || $this;
  my $self = {};
  bless $self, $class;
  $self->{requests} = $r;
  return $self;
}

1;

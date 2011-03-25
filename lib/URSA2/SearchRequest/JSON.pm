package URSA2::SearchRequest::JSON;
use base qw(URSA2::SearchRequest);
use warnings;
use strict;
use JSON;
use Data::Dumper;

sub new {
  my ($this, $r) = @_;
  my $class = ref($this) || $this;
  my $self = {};
  bless $self, $class;
  $self->{requests} = $r;
  return $self;
}

sub decode {
  my $self = shift;
  my $r;

  eval {
    $r = from_json( $self->{requests}->param('query'), { utf8  => 1 } );
  };

  if( $@) {
    InvalidParameter->throw(
      parameter => 'json',
      message => 'malformed json cannot be decoded'
    );     
  }

  $self->{platform} = $r->{platform};
  $self->{beam} = $r->{beam};
  $self->{start} = $r->{start};
  $self->{end} = $r->{end};
  $self->{processing} = $r->{processing};
  $self->{bbox} = $r->{bbox};
  $self->{format} = $r->{format};
  $self->{granule_list} = $r->{granule_list};
  $self->{products} = $r->{products};
  $self->{path} = $r->{path};
  $self->{frame} = $r->{frame};
  $self->{direction} = $r->{direction};

}

1;

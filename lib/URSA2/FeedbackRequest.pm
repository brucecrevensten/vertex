package URSA2::FeedbackRequest;
use URSA2::Validators;
use URI::Escape;
use warnings;
use strict;
use Data::Dumper;

sub new {
  my ($this, $r) = @_;
  my $class = ref($this) || $this;
  my $self = {};
  bless $self, $class;
  $self->{requests} = $r;
  return $self;
}

sub userid {
  my $self = shift;
  return $self->{userid};
}

sub comment {
  my $self = shift;
  return $self->{comment};
}

sub email {
  my $self = shift;
  return $self->{email};
}

sub name {
  my $self = shift;
  return $self->{name};
}

sub decode {
  my $self = shift;
 
  $self->{parameters} = $self->{requests}->params;
  $self->{userid} = uri_unescape($self->{parameters}->{userid});
  $self->{name} = uri_unescape($self->{parameters}->{name});
  $self->{email} = uri_unescape($self->{parameters}->{email});
  $self->{comment} = uri_unescape($self->{parameters}->{comment});
}

sub validate {
  my $self = shift;

  URSA2::Validators->required($self->{comment});
}

sub factory {
  my ($self, $r) = @_;
  if ( $r->param('query') ) {
    return URSA2::FeedbackRequest::JSON->new( $r );
  } else {
    return URSA2::FeedbackRequest::Plain->new( $r ); 
  }
}

package URSA2::FeedbackRequest::JSON;
use base qw(URSA2::FeedbackRequest);
use warnings;
use strict;
use JSON;
use URI::Escape;
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
  my $r = from_json( $self->{requests}->param('query'), { utf8  => 1 } );

  $self->{parameters} = $r;
  $self->{userid} = uri_unescape($self->{parameters}->{userid});
  $self->{name} = uri_unescape($self->{parameters}->{name});
  $self->{email} = uri_unescape($self->{parameters}->{email});
  $self->{comment} = uri_unescape($self->{parameters}->{comment});
}

package URSA2::FeedbackRequest::Plain;
use base qw(URSA2::FeedbackRequest);
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

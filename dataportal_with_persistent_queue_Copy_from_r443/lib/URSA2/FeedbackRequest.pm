package URSA2::FeedbackRequest;
use URSA2::Validators;
use URI::Escape;
use warnings;
use strict;
use Data::Dumper;
use JSON;

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
  my $body = $self->{requests}->body;
  my $text = <$body>;
  my $r = from_json( $text, { utf8  => 1 } );

  $self->{parameters} = $r;
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
  return URSA2::FeedbackRequest->new($r);
}

1

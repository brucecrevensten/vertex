package URSA2::AuthenticationRequest;
use URSA2::Validators;
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

sub password {
  my $self = shift;
  return $self->{password};
}

sub decode {
  my $self = shift;
 
  # TODO: this will not yet work for JSON
  $self->{parameters} = $self->{requests}->params;
  $self->{userid} = $self->{parameters}->{userid};
  $self->{password} = $self->{parameters}->{password};

}

sub validate {
  my $self = shift;

  # 2.1: reject extra parameters
  if( $self->extraParametersExist() ) {
    UnknownParameter->throw();
  }

  URSA2->log->debug( 'userid: '.Dumper($self->{userid}) );
  URSA2->log->debug( 'password: '.Dumper($self->{password}) );

  # 2.5: reject GET requests
  if( $self->{requests}->method ne 'POST' ) {
    BadMethodException->throw();  
  }

  URSA2::Validators->required($self->{userid});
  URSA2::Validators->required($self->{password});

}

sub extraParametersExist() {
  my $self = shift;
  delete $self->{parameters}->{userid};
  delete $self->{parameters}->{password};
  my $c = scalar(keys(%{$self->{parameters}}));
  return $c;
}

sub factory {
  my ($self, $r) = @_;
  if ( $r->param('query') ) {
    return URSA2::AuthenticationRequest::JSON->new( $r );
  } else {
    return URSA2::AuthenticationRequest::Plain->new( $r ); 
  }
}

package URSA2::AuthenticationRequest::JSON;
use base qw(URSA2::AuthenticationRequest);
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
  my $r = from_json( $self->{requests}->param('query'), { utf8  => 1 } );
  URSA2->log->debug( 'decoded JSON: '.Dumper($r) );

  $self->{parameters} = $r;
  $self->{userid} = $r->{userid};
  $self->{password} = $r->{password};

}

package URSA2::AuthenticationRequest::Plain;
use base qw(URSA2::AuthenticationRequest);
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

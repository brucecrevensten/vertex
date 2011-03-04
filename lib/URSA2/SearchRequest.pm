package URSA2::SearchRequest;
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

sub platform {
  my $self = shift;
  return $self->{platform};
}

sub beam {
  my $self = shift;
  return $self->{beam};
}

sub processing {
  my $self = shift;
  return $self->{processing};
}

sub start {
  my $self = shift;
  return $self->{start};
}

sub end {
  my $self = shift;
  return $self->{end};
}

sub bbox {
  my $self = shift;
  return $self->{bbox};
}

sub granule_list {
  my $self = shift;
  return $self->{granule_list};
}

sub products {
  my $self = shift;
  return $self->{products};
}

sub format {
  my $self = shift;
  return $self->{format};
}

sub direction {
  my $self = shift;
  return $self->{direction};
}

sub frame {
  my $self = shift;
  return $self->{frame};
}

sub path {
  my $self = shift;
  return $self->{path};
}

sub decode {
  my $self = shift;
  
  $self->{platform} = $self->csvToArr( $self->{requests}->param('platform'));
  $self->{beam} = $self->csvToArr( $self->{requests}->param('beam'));
  $self->{start} = $self->{requests}->param('start');
  $self->{end} = $self->{requests}->param('end');
  $self->{processing} = $self->csvToArr( $self->{requests}->param('processing'));
  $self->{bbox} = $self->{requests}->param('bbox');
  $self->{format} = $self->{requests}->param('format');
  $self->{granule_list} = $self->csvToArr( $self->{requests}->param('granule_list'));
  $self->{products} = $self->csvToArr( $self->{requests}->param('products'));
  $self->{direction} = $self->{requests}->param('direction');
  $self->{frame} = $self->csvToArr( $self->{requests}->param('frame'));
  $self->{frame} = $self->buildListFromRanges($self->{frame});
  $self->{path} = $self->csvToArr( $self->{requests}->param('path'));
  $self->{path} = $self->buildListFromRanges($self->{path});

}

sub validate {
  my $self = shift;

  $self->{bbox} = URSA2::Validators->bbox( $self->{bbox} );
  $self->{beam} = URSA2::Validators->beam( $self->{beam} );
  $self->{start} = URSA2::Validators->start( $self->{start} );
  $self->{end} = URSA2::Validators->end( $self->{end} );
  $self->{processing} = URSA2::Validators->processing( $self->{processing} );
  $self->{format} = URSA2::Validators->format( $self->{format} );
  $self->{platform} = URSA2::Validators->platform( $self->{platform} );
  $self->{granule_list} = URSA2::Validators->granule_list( $self->{granule_list} );
  $self->{products} = URSA2::Validators->products( $self->{products} );
  $self->{direction} = URSA2::Validators->direction( $self->{direction} );
  $self->{frame} = URSA2::Validators->frame( $self->{frame} );
  $self->{path} = URSA2::Validators->path( $self->{path} );

  $self->validateRequiredFields();

}

sub validateRequiredFields {
  my $self = shift;

  if ( $self->{granule_list} ) {
    # if granule_list is present, nothing else is required.
    return;
  } elsif ( $self->{start} ) {
    # if start date is present, nothing else is required.
    # TC1001
    return;
  } elsif ( $self->{products} ) {
    # if products is present, nothing else is required.
    return;
  } elsif ( $self->{frame} ) {
    # if frame is present, nothing else is required.
    return;
  } elsif ( $self->{path} ) {
    # if path is present, nothing else is required.
    return;
  } else {
    # default case is spatial search, requires bbox.
    if ( !defined( $self->{bbox} ) ) {
      MissingParameter->throw(
        parameter=>'bbox',
        message => 'Missing spatial search box'
      );
    }
  } 
}

=item isGranuleList

Returns true (1) if this search request is a request 
for specific granules, otherwise false (0).

=cut

sub isGranuleList {
  my $self = shift;
  if ( defined($self->{granule_list}) && scalar @{$self->{granule_list}} ) {
    return 1;
  }
  return 0;
}

sub isProductList {
  my $self = shift;
  if ( defined($self->{products}) && scalar @{$self->{products}} ) {
    return 1;
  }
  return 0;
}

sub buildListFromRanges {
  my ($self, $rangeList) = @_;
  my @output;
  if ( !defined( $rangeList ) || 0 == scalar @{$rangeList} ) {
    return undef;
  }
  my ($first, $last, @derivedRange);
  foreach my $range ( @{$rangeList} ) {
    if ( $range =~ /^[0-9]+-[0-9]+$/ ) {
      ($first, $last) = split('-', $range);
      @derivedRange = ($first..$last);
      push @output, @derivedRange;
    } else {
      push @output, $range;
    }
  }
  return \@output;
}

sub csvToArr {
  my ($self, $csv) = @_;
  if ( !defined($csv) ) { return undef; }
  my @a;
  my @b;
  @a = split(',',$csv);
  my $value;
  foreach $value (@a) {
    $value =~ s/^\s+|\s+$//g;
    if ($value) {
      push @b, $value; 
    }
  }
  return \@b;
}

sub factory {
  my ($self, $r) = @_;
  if ( $r->param('query') ) {
    return URSA2::SearchRequest::JSON->new( $r );
  } else {
    # default = comma-separated values
    return URSA2::SearchRequest::Plain->new( $r ); 
  }
}

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

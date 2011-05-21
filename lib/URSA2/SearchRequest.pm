package URSA2::SearchRequest;
use URSA2::Validators;
use warnings;
use strict;
use Data::Dumper;
use URSA2::SearchRequest::JSON;
use URSA2::SearchRequest::Plain;

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

sub limit {
  my $self = shift;
  return $self->{limit};
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

sub polygon {
  my $self = shift;
  return $self->{'polygon'};
}

sub offnadir {
  my $self = shift;
  return $self->{'offnadir'};
}

=item

This function (and its implementation in child classes) "decodes" the requests
from the incoming parameters.  The purpose here is to have a single place
that handles the logic of "turn the request into something I can process further."

This also ensures that we're developing against an _explicit_ API of incoming
requests, and that extra / missing junk is handled explicitly.

Parameters we're interested in are:
 * platform: code name for the platform, as stored in PLATFORM table
 * beam: code term for the beam mode, as stored in the BEAM_MODE table
 * start: start date/time 
 * end: end date/time
 * processing: processing level of product, L0, L1.1, etc
 * limit: limit count of returned results
 * bbox: bounding box in W,S,E,N format (lon/lat/lon/lat)
 * format: format to process the results into -- metalink, csv, etc
 * granule_list: list of granules to fetch
 * products: explicit list of product filenames to fetch.
 * direction: ascending/descending, refers to the orbital direction of the platform
 * frame: frame #s, in a list-of-ranges-or-integers format (see buildListFromRanges)
 * path: path #s, in a list-of-ranges-or-integers format (see buildListFromRanges)
 * polygon: A polygon defined by 3 or more points.
 * offnadir: a specific off-nadir angle (only applies to palsar)
=cut
sub decode {
  my $self = shift;
  
  $self->{platform} = $self->csvToArr( $self->{requests}->param('platform'));
  $self->{beam} = $self->csvToArr( $self->{requests}->param('beam'));
  $self->{start} = $self->{requests}->param('start');
  $self->{end} = $self->{requests}->param('end');
  $self->{processing} = $self->csvToArr( $self->{requests}->param('processing'));
  $self->{limit} = $self->{requests}->param('limit');
  $self->{bbox} = $self->{requests}->param('bbox');
  $self->{polygon} = $self->{requests}->param('polygon');
  $self->{format} = $self->{requests}->param('format');
  $self->{granule_list} = $self->csvToArr( $self->{requests}->param('granule_list'));
  $self->{products} = $self->csvToArr( $self->{requests}->param('products'));
  $self->{direction} = $self->{requests}->param('direction');
  $self->{frame} = $self->csvToArr( $self->{requests}->param('frame'));
  $self->{frame} = $self->buildListFromRanges($self->{frame});
  $self->{path} = $self->csvToArr( $self->{requests}->param('path'));
  $self->{path} = $self->buildListFromRanges($self->{path});
  $self->{offnadir} = $self->csvToArr( $self->{requests}->param('offnadir'));

}

sub validate {
  my $self = shift;

  $self->{bbox} = URSA2::Validators->bbox( $self->{bbox} );
  $self->{polygon} = URSA2::Validators->polygon($self->{polygon} );
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
  $self->{limit} = URSA2::Validators->limit( $self->{limit} );
  $self->{offnadir} = URSA2::Validators->offnadir( $self->{offnadir} );

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
  } elsif ( $self->{bbox} && $self->{polygon} ) {
    # A bbox and a polygon may not be used in the same query.
    InvalidParameter->throw(
      'parameter' => 'bbox, polygon',
      'message'   => 'The bbox and polygon parameters may not be used in the same query.'
    );
  } else {
    # default case is spatial search, requires bbox.
    if ( !defined( $self->{bbox} ) && !defined( $self->{polygon} ) ) {
      MissingParameter->throw(
        parameter=>'bbox, polygon',
        message => 'Missing bbox or polygon parameter'
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

sub isCountRequest {
  my $self = shift;
  if ( defined($self->{format}) && 'count' eq $self->{format} ) {
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

=item buildListFromRanges
This subroutine creates a list of integers from a comma-separated list
of integers and integer ranges, so, for example:

3,4,5-7,12

becomes

3,4,5,6,7,12

=cut
sub buildListFromRanges {
  my ($self, $rangeList) = @_;
  my @output;
  if ( !defined( $rangeList ) || 0 == scalar @{$rangeList} ) {
    return undef;
  }
  my ($first, $last, @derivedRange);
  foreach my $range ( @{$rangeList} ) {
    # check for a range, and if it IS a range, expand it into a list of integers
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

=item csvToArr

Takes a comma-separated list and explodes it after trimming whitespace and checking
for empty elements.  So:
 
  4,5, 123, R1_1234,4,6

becomes
 
  [ 4, 5, 123, 'R1_1234', 4, 6 ]

Returns: arrayref.

=cut
sub csvToArr {
  my ($self, $csv) = @_;
  if ( !defined($csv) ) { return undef; }
  my @a;
  my @b;
  @a = split(',',$csv);
  my $value;
  foreach $value (@a) {
    # trim whitespace
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

1;

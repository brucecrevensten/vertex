package URSA2::Validators;
use Scalar::Util qw(looks_like_number);
use List::Util qw(min max);
use List::MoreUtils qw(firstidx);
use DateTime::Format::DateParse;
use Data::Dumper;
use URSA2::Exceptions qw(InvalidParameter);
use Math::Polygon;
use warnings;
use strict;

=item granule_list

validates the granule_list parameter:
* if nothing is provided, this returns false (0)
* otherwise, attempts to explode the incoming string into an array
* empty items are discarded
* if invalid-looking items are encountered, an exception is thrown
* the array is recombined into a string

throws: InvalidParameter

=cut

sub granule_list {

  my ($self, $granule_list) = @_;
  #TODO: validation 
  return $granule_list;

}

=item products

validates the products parameter:
* if nothing is provided, this returns false (0)

throws: InvalidParameter

=cut

sub products {

  my ($self, $products ) = @_;
  #TODO: validation 
  return $products;

}

=item platform

validates the platform parameter:
* empty list is OK, the search model will omit it from search
* if an invalid platform is encountered, throws an exception
* comma-separated list is expected (???)

=cut

sub platform {
  my ($self, $platform) = @_;
  my @platforms = ('A3','AS','E1','E2','J1','R1', 'UA');
  return $self->validateArray($platform, 'platform', @platforms);
}

=item validateArray

Accepts an array to test contents against a reference array of valid
values, and a field name.  If a value is found in the provided contents
that isn't present in the reference array, it throws an InvalidParameter
exception.

=cut
sub validateArray {
  my($self, $arr, $field, @ref) = @_;
  if( !defined($arr) || scalar @{$arr} == 0 ) {
    return undef;
  }

  foreach my $p ( @{$arr} ) {
    unless ( grep { $_ eq $p } @ref ) {
      InvalidParameter->throw(
        parameter => $field,
        value => $_
      );
    }
  }

  return $arr;
}

sub beam {
  my ($self, $beam) = @_;
  my @beams = ('FBD', 'FBS', 'PLR', 'WB1', '3FP', 'ATI', 'XTI', 'STD', 'EH3', 'EH4', 'EH6', 'EL1', 'FN1', 'FN2', 'FN3', 'FN4', 'FN5', 'SNA', 'SNB', 'ST1', 'ST2', 'ST3', 'ST4', 'ST5', 'ST6', 'ST7', 'SWA', 'SWB', 'WD1', 'WD2', 'WD3', 'POL');
  return $self->validateArray($beam, 'beam', @beams);
}

sub offnadir {
  my ($self, $offnadir) = @_;
  my @angles = (9.7, 9.9, 13.8, 18.0, 20.5, 21.5, 23.1, 24.6, 25.8, 25.9, 26.2, 27.1, 28.8, 30.8, 34.3, 36.9, 38.8, 41.5, 45.2, 50.8);
  return $self->validateArray($offnadir, 'offnadir', @angles);
}

sub processing {

  my ($self, $processing) = @_;
  my @a = qw(L0 L1 L1.1 L1.0 L1.5 BROWSE COMPLEX KMZ METADATA PROJECTED STOKES);
  if( -1 != firstidx { $_ eq 'any' } @{$processing} ) {
    return \@a;
  }
  return $self->validateArray($processing, 'processing', @a, 'any');

}

sub validateDate {
  my ($self, $date, $field) = @_;
  my $dt;
   if( $date ) { 
    eval {
      $dt = DateTime::Format::DateParse->parse_datetime( $date, 'UTC' );
      $dt->set_time_zone('UTC');
    };
    if( $@ ) {
       InvalidParameter->throw(
        parameter => $field,
        value => $date
      );
    } else {
      return $dt;
    }
  }
  return undef;
}

sub validateYear {
  my ($self, $year, $field) = @_;
  if($year && $year !~ /^\d{4}$/) {
    InvalidParameter->throw(
      parameter => $field,
      value => $year
    );
  } else {
    return $year;
  }
  return undef;
}

sub validateMonth {
  my ($self, $month, $field) = @_;
  if($month && ($month !~/^\d{2}$/ || $month < 1 || $month > 12)) {
    InvalidParameter->throw(
      parameter => $field,
      value => $month
    );
  } else {
    return $month;
  }
  return undef;
}

sub start {
  my ($self, $start) = @_;
  return $self->validateDate($start,'start');
}

sub end {
  my ($self, $end) = @_;
  return $self->validateDate($end,'end');
}

sub repeat_start {
  my ($self, $year) = @_;
  return $self->validateYear($year, 'repeat_start');
}

sub repeat_end {
  my ($self, $year) = @_;
  return $self->validateYear($year, 'repeat_end');
}

sub season_start {
  my ($self, $month) = @_;
  return $self->validateMonth($month, 'season_start');
}

sub season_end {
  my ($self, $month) = @_;
  return $self->validateMonth($month, 'season_end');
}

=item bbox

Validates bbox as a comma-separated list of w, s, e, n lat/lons

Throws: InvalidParameter if the provided bbox is invalid

=cut

sub bbox {
  my ($self, $bbox) = @_;
  my @bbox_arr;

  if (!defined($bbox)) {
    # if we don't have a BBOX, this may be an invalid parameter,
    # but we'll defer to the client to decide if to throw
    # an exception in this case.
    return undef;
  }


  @bbox_arr = split(/\,/, $bbox);
  my ($w, $s, $e, $n) = @bbox_arr;
  my $a = scalar(grep { defined $_ } @bbox_arr );
  if ( 4 != $a ) {
    InvalidParameter->throw( parameter=>'bbox', value=>$bbox, message=>'bbox was not a list of four comma-separated floats');
  }

  if( 0 == URSA2::Validators->validatePoint($w, $s)
    || 0 == URSA2::Validators->validatePoint($e, $n)) {
    InvalidParameter->throw( parameter=>'bbox', message=>'derived lat/long boundary point(s) invalid');
  }

  my $t;
  # make the points always correspond to w / s / e / n
  if ( $w > $e ) {
    $t = $w; $w = $e; $e = $t;
  }

  if ( $s > $n ) { 
    $t = $s; $s = $n; $n = $t;
  }

  # always use minimal span: if span >180 degrees lon, span the other way
  if ( $e - $w > 180.0 ) {
    $t = $w; $w = $e; $e = $t;
    $t = $s; $s = $n; $n = $t;
  }

  return [$bbox_arr[0], $bbox_arr[1], $bbox_arr[2], $bbox_arr[3]];

}

=item polygon

Validates that the provided points are valid and that there are enough points
to form a polygon.

=cut
sub polygon {
  my ($self, $polygon) = @_;
  my @points;
  my @coords;

  if(!defined($polygon)) {
    # Return undef in the event that no polygon is defined.
    return undef;
  }

  @coords= split(/,/, $polygon);

  # check that we have an even number of arguments for the coordinates.
  if(!scalar(@coords) || scalar(@coords) % 2 ne 0) {
    InvalidParameter->throw(
      'parameter' => 'polygon',
      'message'   => 'Point list must contain an even number of arguments.'
    );
  }

  # If the last point isn't the same as the first point. Close the polygon.
  if(($coords[0] != $coords[-2]) && ($coords[1] != $coords[-1])) {
    push(@coords, $coords[0], $coords[1]);
  }

  # put all the points in a format that Math::Polygon will like.
  # validate the points while we're looping over them also. Saves us from
  # having to do another loop later.
  my $ii = 0;
  while($ii < scalar(@coords)) {
    if(URSA2::Validators->validatePoint($coords[$ii], $coords[$ii+1])) {
      push(@points, [$coords[$ii], $coords[$ii+1]]);
    } else {
      InvalidParameter->throw(
        parameter=>'polygon',
        message=>'derived lat/long boundary point(s) invalid'
      );
    }
    $ii += 2;
  }

  my $poly;
  $poly = Math::Polygon->new(@points);

  # Need at least 4 points including the poing that closes the polygon.
  if($poly->nrPoints < 4) {
    InvalidParameter->throw(
      'parameter' => 'polygon',
      'message'   => 'At least 4 points are needed to make a polygon.'
    );
  }

  # We expect the points for polygons to be in clockwise order.
  # Points given in a counterclockwise order define an area of interest that
  # is everything BUT the area covered by the polygon.
  if(!$poly->isClockwise) {
    InvalidParameter->throw(
      'parameter' => 'polygon',
      'message'   => 'Points must be listed in a clockwise order.'
    );
  }

  return(\@coords);
}

=item validatePoint

Validates that the provided pair are both numeric and within range for lat/long.

Params: $long, $lat

=cut
sub validatePoint {
  my($self, $long, $lat) = @_;
  return(
    defined($long) 
    && looks_like_number($long)
    && -180 <= $long
    && 180 >= $long
    && defined($lat)
    && looks_like_number($lat)
    && -90 <= $lat
    && 90 >= $lat
  );
}

=item format

Validates acceptable formats for transformation, or defaults
to .metalink format if format is missing.  If format is specified
but invalid, an exception is thrown.

throws: InvalidParameter
=cut

sub format {

  my ($self, $format) = @_;
  my @a = qw(csv metalink raw list kml json jsonp count);

  if (!defined($format)) { $format = 'metalink'; }

  if ( grep $_ eq $format, @a ) { 
    return $format;
  } 

  InvalidParameter->throw( parameter=>"format", message=>"Unknown format specified ($format)");
  
}

sub limit {
  my ($self, $limit) = @_;
  if ( !defined($limit) ) {
    return undef;
  }
  if ( looks_like_number($limit) ) {
    return $limit;
  }
  InvalidParameter->throw("Limit does not look like a number ($limit)");
}

sub direction { 
  my ($self, $direction) = @_;
  if( !defined($direction) || $direction eq 'any' ) { return; }
  if( $direction eq 'ascending' || $direction eq 'descending' ){
    return $direction;
  }
  InvalidParameter->throw(
    parameter => 'direction',
    value => $direction
  );
}

sub frame { 
  my ($self, $frame) = @_;
  #TODO validation
  return $frame;
}

sub path { 
  my ($self, $path) = @_;
  #TODO validation
  return $path;
}

sub required {
  my ($self, $v) = @_;
  if( !defined($v) ) {
    MissingParameter->throw(); 
  }
}
1;

package URSA2::Validators;
use Scalar::Util qw(looks_like_number);
use List::Util qw(min max);
use DateTime::Format::DateParse;
use Data::Dumper;
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
  my @platforms = ('A3','AS','E1','E2','J1','R1');
  return $self->validateArray($platform, 'platform', @platforms);
}

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
  my @beams = ('FBD', 'FBS', 'PLR', 'WB1', '3FP', 'ATI', 'XTI', 'STD', 'EH3', 'EH4', 'EH6', 'EL1', 'FN1', 'FN2', 'FN3', 'FN4', 'FN5', 'SNA', 'SNB', 'ST1', 'ST2', 'ST3', 'ST4', 'ST5', 'ST6', 'ST7', 'SWA', 'SWB', 'WD1', 'WD2', 'WD3');
  return $self->validateArray($beam, 'beam', @beams);
}

sub processing {

  my ($self, $processing) = @_;
  my @a = qw(L0 L1 L1.1 L1.0 L1.5 browse);
  return $self->validateArray($processing, 'processingType', @a);

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

sub start {
  my ($self, $start) = @_;
  return $self->validateDate($start,'start');
}

sub end {
  my ($self, $end) = @_;
  return $self->validateDate($end,'end');
}

=item bbox

Validates bbox as a comma-separated list of w, s, e, n lat/lons

Throws: InvalidParameter if the provided bbox 

=cut

sub bbox {
  my ($self, $bbox) = @_;
  my @bbox_arr;
  my $e;

  if (!defined($bbox)) {
    # if we don't have a BBOX, this may be an invalid parameter,
    # but we'll defer to the client to decide if to throw
    # an exception in this case.
    return undef;
  }


  @bbox_arr = split(/\,/, $bbox);
  my $a = scalar(grep { defined $_ } @bbox_arr );
  if ( 4 != $a ) {
    InvalidParameter->throw( parameter=>'bbox', value=>$bbox, message=>'bbox was not a list of four comma-separated floats');
  }

  if( 0 == URSA2::Validators->validatePoint($bbox_arr[0], $bbox_arr[1])
    || 0 == URSA2::Validators->validatePoint($bbox_arr[2], $bbox_arr[3])) {
    InvalidParameter->throw( param=>'bbox', message=>'derived lat/long boundary point(s) invalid');
  }

  my $t;
  # make the points always correspond to w / s / e / n
  if ( $bbox_arr[0] > $bbox_arr[2] ) {
    $t = $bbox_arr[0];
    $bbox_arr[0] = $bbox_arr[2];
    $bbox_arr[2] = $t;
  }

  if ( $bbox_arr[1] > $bbox_arr[3] ) { 
    $t = $bbox_arr[1];
    $bbox_arr[1] = $bbox_arr[3];
    $bbox_arr[3] = $t;
  }

  #TODO fix case where we cross +/- 180



  return [$bbox_arr[0], $bbox_arr[1], $bbox_arr[2], $bbox_arr[3]];

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
  my @a = qw(csv metalink raw list);

  if (!defined($format)) { $format = 'metalink'; }

  if ( grep $_ eq $format, @a ) { 
    return $format;
  } 

  InvalidParameter->throw("Unknown format specified ($format)");
  
}

sub direction { 
  my ($self, $direction) = @_;
  if( !defined($direction) ) { return; }
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

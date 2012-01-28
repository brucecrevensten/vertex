package URSA2::Model::Search::JSON;

use strict;
use warnings;

use Data::Dumper;
use URSA2::Exceptions;

use base 'URSA2::Model::Search';

sub getSelect {
  my ($self) = @_;
  
  return q~
  select
  ~ . $self->getSelectFields() . q~
  FROM
    data_product dp
  WHERE
    processingtype not in ('THUMBNAIL', 'BROWSE512') and
  ~;
}

sub getResultsByGranuleList {
  my ($self, $r) = @_;
  my $fragment = $self->buildBigListQuery( 'granuleName', $r->granule_list) .
  $self->buildListQuery('processingType', $r->processing);
  $fragment =~ s/^\s+AND\s//;
  my $sql = $self->getSelect . $fragment;
  return $self->doQuery($sql);
}

sub getResultsByProductList {
  my ($self, $products) = @_;
  my $fragment = $self->buildBigListQuery( 'filename', $products );
  $fragment =~ s/^\s+AND\s//;
  my $sql = $self->getSelect . $fragment;
  return $self->doQuery($sql)
}

sub getResults {
  my ( $self, $r ) = @_;
  return($self->doQuery( $self->getSelect . $self->getApiQuery($r) . $self->buildLimitQuery($r->limit)));
}


sub doQuery {
  my ($self, $sql) = @_;

  URSA2->log->debug($sql);

  my $dbh = $self->dbh;

  if (!defined($dbh)) {
    DbException->throw(
      message => "Could not establish a database connection in Search model",
    );
  }

  my $res;
  my $sth;
  eval {
    $sth = $dbh->prepare($sql);
    $sth->execute();
  };
  if( $dbh->err ) {
    DbException->throw(
      message => $DBI::errstr,
      error => $DBI::errno,
    );
  } elsif ($@) {
     DbException->throw(
      message => Dumper($@)
    );
  }
  while(my $row = $sth->fetchrow_hashref) {
    my $g = $row->{'GRANULENAME'};
    if(!exists($res->{$g})) {
      $res->{$g} = {
        'acquisitionDateText' => $row->{'ACQUISITIONDATETEXT'},
        'acquisitionDate'     => $row->{'ACQUISITIONDATE'},
        'ascendingDescending' => $row->{'ASCENDINGDESCENDING'},
        'beamModeDesc'        => $row->{'BEAMMODEDESC'},
        'beamModeType'        => $row->{'BEAMMODETYPE'},
        'browse'              => $row->{'BROWSE'},
        'centerLat'           => $row->{'CENTERLAT'},
        'centerLon'           => $row->{'CENTERLON'},
        'faradayRotation'     => $row->{'FARADAYROTATION'},
        'farEndLat'           => $row->{'FARENDLAT'},
        'farEndLon'           => $row->{'FARENDLON'},
        'farStartLat'         => $row->{'FARSTARTLAT'},
        'farStartLon'         => $row->{'FARSTARTLON'},
        'frameNumber'         => $row->{'FRAMENUMBER'},
        'granuleName'         => $row->{'GRANULENAME'},
        'granuleType'         => $row->{'GRANULETYPE'},
        'id'                  => $row->{'GRANULENAME'},
        'missionName'         => $row->{'MISSIONNAME'},
        'nearEndLat'          => $row->{'NEARENDLAT'},
        'nearEndLon'          => $row->{'NEARENDLON'},
        'nearStartLat'        => $row->{'NEARSTARTLAT'},
        'nearStartLon'        => $row->{'NEARSTARTLON'},
        'offNadirAngle'       => $row->{'OFFNADIRANGLE'},
        'orbit'               => $row->{'ORBIT'},
        'pathNumber'          => $row->{'PATHNUMBER'},
        'platform'            => $row->{'PLATFORM'},
        'polarization'        => $row->{'POLARIZATION'},
        'productName'         => $row->{'PRODUCTNAME'},
        'sensor'              => $row->{'SENSOR'},
        'thumbnail'           => $row->{'THUMBNAIL'},
      };
      $res->{$g}->{'files'} = [];
    }
    push(@{$res->{$g}->{'files'}}, {
      'fileName'                  => $row->{'FILENAME'},
      'product_file_id'           => $row->{'GRANULENAME'} . '_' . $row->{'PROCESSINGTYPE'},
      'granuleName'               => $row->{'GRANULENAME'},
      'processingDate'            => $row->{'PROCESSINGDATE'},
      'processingType'            => $row->{'PROCESSINGTYPE'},
      'processingTypeDisplay'     => $row->{'PROCESSINGTYPEDISPLAY'},
      'processingTypeDescription' => $row->{'PROCESSINGTYPEDESCRIPTION'},
      'processingLevel'           => $row->{'PROCESSINGLEVEL'},
      'url'                       => $row->{'URL'},
      'bytes'                     => $row->{'BYTES'} + 0,
      'md5sum'                    => $row->{'MD5SUM'},
    });
  }
  return(JSON::XS->new->utf8->encode([@{$res}{keys %{$res}}]));
}

1;

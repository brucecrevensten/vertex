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
    # E2_84210_STD_F283
      $res->{$g} = {
        'ACQUISITIONDATETEXT' => $row->{'ACQUISITIONDATETEXT'},
        'ACQUISITIONDATE'     => $row->{'ACQUISITIONDATE'},
        'ASCENDINGDESCENDING' => $row->{'ASCENDINGDESCENDING'},
        'BEAMMODEDESC'        => $row->{'BEAMMODEDESC'},
        'BEAMMODETYPE'        => $row->{'BEAMMODETYPE'},
        'BROWSE'              => $row->{'BROWSE'},
        'CENTERLAT'           => $row->{'CENTERLAT'},
        'CENTERLON'           => $row->{'CENTERLON'},
        'FARADAYROTATION'     => $row->{'FARADAYROTATION'},
        'FARENDLAT'           => $row->{'FARENDLAT'},
        'FARENDLON'           => $row->{'FARENDLON'},
        'FARSTARTLAT'         => $row->{'FARSTARTLAT'},
        'FARSTARTLON'         => $row->{'FARSTARTLON'},
        'FRAMENUMBER'         => $row->{'FRAMENUMBER'},
        'GRANULENAME'         => $row->{'GRANULENAME'},
        'GRANULETYPE'         => $row->{'GRANULETYPE'},
        'MISSIONNAME'         => $row->{'MISSIONNAME'},
        'NEARENDLAT'          => $row->{'NEARENDLAT'},
        'NEARENDLON'          => $row->{'NEARENDLON'},
        'NEARSTARTLAT'        => $row->{'NEARSTARTLAT'},
        'NEARSTARTLON'        => $row->{'NEARSTARTLON'},
        'OFFNADIRANGLE'       => $row->{'OFFNADIRANGLE'},
        'ORBIT'               => $row->{'ORBIT'},
        'PATHNUMBER'          => $row->{'PATHNUMBER'},
        'PLATFORM'            => $row->{'PLATFORM'},
        'POLARIZATION'        => $row->{'POLARIZATION'},
        'PRODUCTNAME'         => $row->{'PRODUCTNAME'},
        'SENSOR'              => $row->{'SENSOR'},
      };
      $res->{$g}->{'FILES'} = [];
    }
    push(@{$res->{$g}->{'FILES'}}, {
      'PROCESSINGDATE'      => $row->{'PROCESSINGDATE'},
      'PROCESSINGTYPE' => $row->{'PROCESSINGTYPE'},
      'PROCESSINGTYPEDISPLAY' => $row->{'PROCESSINGTYPEDISPLAY'},
      'PROCESSINGTYPEDESCRIPTION' => $row->{'PROCESSINGTYPEDESCRIPTION'},
      'PROCESSINGLEVEL' => $row->{'PROCESSINGLEVEL'},
      'URL' => $row->{'URL'},
      'BYTES' => $row->{'BYTES'} + 0,
      'MD5SUM' => $row->{'MD5SUM'},
    });

  }
  return(JSON::XS->new->utf8->encode($res));
}

1;

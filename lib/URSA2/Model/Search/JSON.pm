package URSA2::Model::Search::JSON;

use strict;
use warnings;

use Data::Dumper;
use URSA2::Exceptions;

use base 'URSA2::Model::Search';

sub getSelect {
  return (qq(
    select
      granuleName,
      productName,
      platform,
      sensor,
      beamModeType,
      TRIM(beamModeDesc) beamModeDesc,
      polarization,
      orbit,
      pathNumber,
      frameNumber,
      missionName,
      TO_CHAR(acquisitionDate, 'YYYY-MM-DD HH24:MI:SS') AS acquisitionDate,
      TO_CHAR(processingDate, 'YYYY-MM-DD HH24:MI:SS') AS processingDate,
      processingType,
      processingTypeDisplay,
      processingLevel,
      processingDescription,
      TO_CHAR(startTime, 'YYYY-MM-DD HH24:MI:SS') AS startTime,
      TO_CHAR(endTime, 'YYYY-MM-DD HH24:MI:SS') AS endTime,
      centerLat,
      centerLon,
      nearStartLat,
      nearStartLon,
      nearEndLat,
      nearEndLon,
      farStartLat,
      farStartLon,
      farEndLat,
      farEndLon,
      faradayRotation,
      ascendingDescending,
      url,
      nvl((select url from data_product where granulename = dp.granulename
       and processingtype = 'THUMBNAIL'), 'none') AS thumbnail,
      coalesce((select url from data_product where granulename = dp.granulename
       and processingtype = 'BROWSE512'), 
       (select url from data_product where granulename = dp.granulename
        and processingtype = 'BROWSE'), 'none') AS browse,
      bytes,
      ROUND( bytes/1024/1024, 2 ) AS fileSize,
      offNadirAngle,
      md5sum,
      granuleDesc,
      granuleType,
      fileName,
      granuleName || '_' || processingType AS id
    FROM
    data_product dp
  WHERE
    processingtype not in ('THUMBNAIL', 'BROWSE512') and
  ));
}

sub getResultsByGranuleList {
  my ($self, $r) = @_;
  my $fragment = $self->buildListQuery( 'granuleName', $r->granule_list) .
  $self->buildListQuery('processingType', $r->processing);
  $fragment =~ s/^\s+AND\s//;
  my $sql = $self->getSelect . $fragment;
  return $self->doQuery($sql);
}

sub getResultsByProductList {
  my ($self, $products) = @_;
  my $fragment = $self->buildListQuery( 'filename', $products );
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
  eval {
    $res = $dbh->selectall_arrayref($sql, { Slice => {} });
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
  # Numify strings that only contain numbers.
  foreach my $row (@{$res}) {
    foreach my $key (keys(%{$row})) {
      if($row->{$key} && $row->{$key} =~ /^(-)?\d+(\.\d+)?$/) {
        $row->{$key} +=0;
      }
    }
  }
  return(JSON::XS->new->utf8->encode($res));
}

1;

 Was tpackage URSA2::Model::Search;

use strict;
use warnings;

use Data::Dumper;
use URSA2::Exceptions;

use base 'URSA2::Model::DBI::Proxy';

=head1 NAME

URSA2::Model::Search - Catalyst Model

=head1 DESCRIPTION

Catalyst Model that wraps the database view data_product,
and the associated search that is typically done on it.

=head1 AUTHOR

ASF

=head1 LICENSE

This library is free software. You can redistribute it and/or modify
it under the same terms as Perl itself.

=cut
=item getSelectXmlStart

Returns the select-from chunk that should be used to fetch XML results - this should
be used to wrap anything before the WHERE clause.

=cut

sub getSelectXml {
  return qq(

 select XMLELEMENT("ROW",
  XMLForest(
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
  )).getStringVal() FROM
    data_product dp
  WHERE
    processingtype not in ('THUMBNAIL', 'BROWSE512') and
  );
}

=item getResultsByGranuleList

Given a list of known granule names (bulk search), provide links to those granules.

Precondition: $granuleList is a comma-separated list of granule names, validated by the controller.

=cut

sub getResultsByGranuleList {

  my ($self, $r) = @_;
  my $fragment = $self->buildListQuery( 'granuleName', $r->granule_list) . 
  $self->buildListQuery('processingType', $r->processing);
  $fragment =~ s/^\s+AND\s//;
  my $sql = $self->getSelectXml . $fragment;
  return $self->doQuery($sql);

}

sub getResultsByProductList {

  my ($self, $products) = @_;
  my $fragment = $self->buildListQuery( 'filename', $products );
  $fragment =~ s/^\s+AND\s//;
  my $sql = $self->getSelectXml . $fragment;
  return $self->doQuery($sql);

}

sub getApiQuery {
  my ($self, $r) = @_;
  my $fragment = $self->buildListQuery('platformType', $r->platform).
  $self->buildDateQuery($r->start, $r->end).
  $self->buildListQuery('processingType', $r->processing).
  $self->buildListQuery('beammodetype', $r->beam).
  $self->buildDirectionQuery($r->direction).
  $self->buildListQuery('framenumber', $r->frame).
  $self->buildListQuery('pathnumber', $r->path).
  $self->buildListQuery('offnadirangle', $r->offnadir).
  $self->buildSpatialQuery($r);
  $fragment =~ s/^\s+AND\s//;
  return $fragment; 

}

sub getResultsCount {
  my ($self, $r) = @_;

  my $sql = q(
    select
      count(*)
    from
      data_product
  WHERE
    processingtype not in ('THUMBNAIL', 'BROWSE512') and
  );

  $sql .= $self->getApiQuery($r);

  return $self->doQuery($sql);

}

=item getResults

=cut

sub getResults {

  my ( $self, $r ) = @_;
  return $self->doQuery( $self->getSelectXml . $self->getApiQuery($r) . $self->buildLimitQuery($r->limit) . $self->buildOrderQuery); 

}

sub buildOrderQuery {
  return ' ORDER BY startTime DESC';
}

sub buildLimitQuery {
  my ( $self, $limit ) = @_;
  if ( defined($limit) ) {
    return " AND rownum <= ".$self->dbQuote($limit);
  } 
  return '';
}

sub buildDirectionQuery {
  my ($self, $direction) = @_;
  if ( defined($direction) && $direction eq 'ascending' ) {
    return qq( AND ascendingdescending LIKE 'A%');
  } elsif ( defined($direction) && $direction eq 'descending' ) {
    return qq( AND ascendingdescending LIKE 'D%');
  }
  return '';
}

=item doQuery

Performs the SQL operation indicated, after obtaining a DB handle and logging the query
for debugging.

Throws: DBException, DbNoResults

=cut
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
    $res = $dbh->selectall_arrayref($sql);
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
  return $res;
}

sub dbQuote {
  my($self, $p) = @_;
  my $dbh = $self->dbh;
  if (!defined($dbh)) {
    DbException->throw( 
      message => "Could not establish a database connection in Search model",
    );
  }
  return $dbh->quote($p);
}

=item BuildDateQuery

Takes two dates and creates an SQL fragment to restrict results returned by date.

Params:
  $fieldRef - name of table/field/expression/combination thereof to compare against in this query.
  $start - start date
  $end - end date

=cut
sub buildDateQuery {
  my ($self, $start, $end) = @_;

  # no dates = no restriction query
  if( !$start && !$end ) { return ''; }

  my $fieldRef = "startTime";

  # before end date 
  if( !$start && $end ) {
    return ' AND '.$fieldRef." <= TO_DATE(".$self->dbQuote($end->ymd).",'YYYY-MM-DD')";
  }

  # after start date
  if( !$end ) {
    return ' AND '.$fieldRef." >= TO_DATE(".$self->dbQuote($start->ymd).",'YYYY-MM-DD')";
  }

  # between two dates
  return ' AND '.$fieldRef." BETWEEN TO_DATE(".$self->dbQuote($start->ymd).",'YYYY-MM-DD') AND TO_DATE(".$self->dbQuote($end->ymd).",'YYYY-MM-DD')";
}

sub buildSpatialQuery {
  my ($self, $r) = @_;
  my $bbox = $r->bbox;
  my $polygon = $r->polygon;

  if( defined($bbox) && scalar @{$bbox} ) {

    $bbox->[0] = $self->dbQuote($bbox->[0]);
    $bbox->[1] = $self->dbQuote($bbox->[1]);
    $bbox->[2] = $self->dbQuote($bbox->[2]);
    $bbox->[3] = $self->dbQuote($bbox->[3]);
    return qq(
      AND
      sdo_inside(centerPoint,
        sdo_geometry(
          2003, 8307, NULL, sdo_elem_info_array(1,1003,3),
          sdo_ordinate_array($bbox->[0], $bbox->[1], $bbox->[2], $bbox->[3])
        )
      ) = 'TRUE'
    );

  } elsif( defined($polygon && scalar @{$polygon})) {
    foreach my $coord (@{$polygon}) {
      $coord = $self->dbQuote($coord);
    }
    my $cstring = join(',', @{$polygon});
    return qq(
      AND sdo_anyinteract(shape,
        sdo_geometry(
          2003, 8307, NULL, sdo_elem_info_array(1, 1003, 1),
          sdo_ordinate_array($cstring))) = 'TRUE'
    );
  }
  return '';
}

sub buildListQuery {
  my ($self, $field, $list) = @_;
  if ( defined($list) && scalar @{$list} ) {
    if($field =~ /^granulename$/i) {
      return " AND UPPER($field) IN (".join( ',', map { $self->dbQuote(uc($_)) } @{$list} ).') ';
    } else {
      return " AND $field IN (".join( ',', map { $self->dbQuote($_) } @{$list} ).') ';
    }
  }
  return '';
}

sub buildBeamQuery {
  my( $self, $r ) = @_;
  if( scalar @{$r->beam} ) {
    return ' AND '.$self->buildListRestriction( '', $r->beam);
  } 
  return;
}

sub buildProcessingQuery {
  my( $self, $r ) = @_;
  if( scalar @{$r->processing} ) {
    return ' AND '.$self->buildListRestriction( 'processingType', $r->processing);
  } 
  return;
}

=item buildPlatformQuery

Returns SQL with the platform selection restriction built.

=cut

sub buildPlatformQuery {
  my( $self, $r ) = @_;
  if( scalar @{$r->platform} ) { 
    return ' AND '.$self->buildListRestriction( 'platformType', $r->platform );
  } 
  return; 
}

__PACKAGE__->meta->make_immutable(
inline_constructor => 0
);

1;

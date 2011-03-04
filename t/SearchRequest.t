use strict;
use warnings;
use Test::More tests => 14;
use HTTP::Request::Common;
use Data::Dumper;
use URSA2::SearchRequest;
use Catalyst::Test 'URSA2';
use DateTime;

# Sequence of tests against SearchRequest

my $surn = 'services/search'; # urn of the service were testing
my ($response, $c) = ctx_request(qq(services/search?bbox=-50,-50,50,50&platform=E1,E2,R1&start=1996-12-19T16:39:57-08:00&end=1999-12-19T16:39:57-08:00&format=raw&processing=browse,L1,L1.0));
my $s = URSA2::SearchRequest->factory( $c->request );
$s->decode();
$s->validate();

is_deeply( $s->bbox, ['-50', '-50', '50', '50'], 'plain decode bbox ok');
is_deeply( $s->platform, ['E1', 'E2', 'R1'], 'plain decode platform ok');

my $dt = DateTime::Format::DateParse->parse_datetime('1996-12-19T16:39:57-08:00', 'UTC');
is_deeply( $s->start, $dt, 'plain decode start time ok');

$dt = DateTime::Format::DateParse->parse_datetime('1999-12-19T16:39:57-08:00', 'UTC');
is_deeply( $s->end, $dt, 'plain decode end time ok');

is( $s->format, 'raw', 'plain decode format ok');
is_deeply( $s->processing, ['browse','L1','L1.0'], 'plain decode processing OK');

# testing JSON style requests

$surn = 'services/search'; # urn of the service were testing
($response, $c) = ctx_request(qq(services/search/json?query={"bbox":"-50,-50,50,50","platform":["E1","E2","R1"],"start":"1996-12-19T16:39:57-08:00","end":"1999-12-19T16:39:57-08:00","format":"raw","processing":["browse","L1","L1.0"]}));
$s = URSA2::SearchRequest->factory( $c->request );
$s->decode();
$s->validate();

is_deeply( $s->bbox, ['-50', '-50', '50', '50'], 'json decode bbox ok');
is_deeply( $s->platform, ['E1', 'E2', 'R1'], 'json decode platform ok');

$dt = DateTime::Format::DateParse->parse_datetime('1996-12-19T16:39:57-08:00', 'UTC');
is_deeply( $s->start, $dt, 'json decode start time ok');

$dt = DateTime::Format::DateParse->parse_datetime('1999-12-19T16:39:57-08:00', 'UTC');
is_deeply( $s->end, $dt, 'json decode end time ok');

is( $s->format, 'raw', 'json decode format ok');
is_deeply( $s->processing, ['browse','L1','L1.0'], 'json decode processing OK');

#TODO add tests for decoding granule_list and products

SKIP: {
  skip 'need to implement general date parsing', 2;

  ($response, $c) = ctx_request(qq(services/search/json?query={"start":"2005-01-01","end":"2007-01-01 8:35AM"}));
  $s = URSA2::SearchRequest->factory( $c->request );
  $s->decode();
  $s->validate();
  #TODO

  #$dt = $d->parse_datetime('2005-01-01T00:00:00Z');
  #$dt->set_time_zone('UTC');
  is_deeply( $s->end, $dt, 'plain decode nonstandard end time ok');

  #$dt = $d->parse_datetime('2007-01-01T08:39:00Z');
  #$dt->set_time_zone('UTC');
  is_deeply( $s->end, $dt, 'plain decode end time ok');
}


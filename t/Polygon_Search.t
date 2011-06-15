use strict;
use warnings;
use Test::More;
use HTTP::Request::Common;
use Data::Dumper;
use Apache2::Const q(:http);
use URSA2::SearchRequest;
use Catalyst::Test 'URSA2';
use JSON;

#
# test descriptions can be found in spreadsheet linked at http://wiki.asf.alaska.edu/asf/Ursa2SearchApiSpec
#

my $surn = 'services/search/param'; # urn of the service were testing
my $jurn = 'services/search/json'; # urn of the service were testing
my @list = (); # used to store the list results of queries.

# Polygon over Baranof Island and Chichagof Island in South East Alaska.
my $c_poly = '-136.615,58.142,-135.967,58.367,-134.901,58.06,-134.901,56.101,-135.945,56.986,-135.978,57.362,-136.626,57.917,-136.615,58.142';
# Same polygone in counter-clockwise order.
my $cc_poly = '-136.615,58.142,-136.626,57.917,-135.978,57.362,-135.945,56.986,-134.901,56.101,-134.901,58.06,-135.967,58.367,-136.615,58.142';
my $bad_coord_list = '123, 50, 123';
my $insufficient_points = '-136.615,58.142,-135.967,58.367';
my $open_polygon = '-136.615,58.142,-135.967,58.367,-134.901,58.06,-134.901,56.101,-135.945,56.986,-135.978,57.362,-136.626,57.917';
my $invalid_point = '-136.615,58.142,-135.967,58.367,-134.901,58.06,-134.901,56.101,567,1987';
my @platforms = (q(R1 E1 E2 J1 A3));

# Sequence of tests against the controller as mediated through HTTP

BEGIN { use_ok 'URSA2::Controller::services' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);

###### doesn't need DB connections
$mech->get_ok('services', "1.1: web service exists");

$mech->post($surn);
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1: get HTTP 400 for missing polygon field');

$mech->get($surn, { polygon => 'invalid'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for missing polygon field');

$mech->get($jurn, { query => '{"polygon":"invalid"}'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for missing polygon field');

$mech->post($surn, { polygon => '-165,656-164,67' } );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid polygon field');

$mech->get($surn, { polygon => '1,2,3'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid polygon field');

$mech->get($jurn, { query => '{"polygon":"1,2,3"}'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid polygon field');

$mech->get($surn, { polygon => '1.111,2.22222,0,4.444a'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid polygon field');

$mech->get($jurn, { query => '{"polygon":"1.111,2.22222,0,4.444a"}'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for missing polygon field');

$mech->post($surn, { processing => 'L1,browse' });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '3.2.2: get HTTP 400 for missing polygon field when other parameters are present');

$mech->post($jurn, { query => '{"processing":["L1","browse"]}' });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '3.2.2, 2.11: get HTTP 400 for missing polygon field when other parameters are present');

$mech->post($surn, { polygon=>$c_poly, platform => 'BadPlatform'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.2: get HTTP 400 for invalid platform');

$mech->post($jurn, { query => '{"polygon":"-135,64.5,-135.1,64.6","platform":["BadPlatform"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.2, 2.11: get HTTP 400 for missing polygon field when other parameters are present');

$mech->post($surn, { polygon=>$c_poly, start => 'BadDate'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.3: get HTTP 400 for invalid start date field');

$mech->post($jurn, { query => '{"polygon":"-135,64.5,-135.1,64.6","start":["BadDate"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.3, 2.11: get HTTP 400 for missing polygon field when other parameters are present');

$mech->post($surn, { polygon=>$c_poly, end => 'BadDate'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.4: get HTTP 400 for invalid end date field');

$mech->post($jurn, { query => '{"polygon":"-135,64.5,-135.1,64.6","end":["BadDate"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.4, 2.11: get HTTP 400 for missing polygon field when other parameters are present');

$mech->post($surn, { polygon=>$c_poly, processing => 'BadProcessing'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.6: get HTTP 400 for invalid processing level field');

$mech->post($jurn, { query => '{"polygon":"-135,64.5,-135.1,64.6","processing":["BadProcessing"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.6, 2.11: get HTTP 400 for missing polygon field when other parameters are present');

$mech->post($surn, { polygon=>$c_poly, beam => 'BadBeam' });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.7: get HTTP 400 for invalid beam mode field');

$mech->post($jurn, { query => '{"polygon":"-135,64.5,-135.1,64.6","beam":["BadBeam"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.7, 2.11: get HTTP 400 for bad beam mode');

$mech->post($surn, { 'polygon' => '-135,64.5,-135.1,64.6', format => 'invalid' } );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.5: check that invalid format request responds with error');

$mech->post($jurn, { query => '{"polygon":"-135,64.5,-135.1,64.6","format":"invalid"}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.5, 2.11: get HTTP 400 for invalid format request');

$mech->post($jurn, { 'polygon' => '28.5,139,29.5,140', 'format' => 'csv' } );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, 'DE521: invalid polygon parameter causes an uncaught exception instead of InvalidParameter exception');

$mech->post($surn, { 'polygon' => $cc_poly });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept polygons defined in counter-clockwise order.');

$mech->post($jurn, { 'polygon' => $cc_poly });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept polygons defined in counter-clockwise order.');

$mech->post($surn, { 'polygon' => $bad_coord_list });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept an incorrect number of coordinates.');

$mech->post($jurn, { 'polygon' => $bad_coord_list });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept an incorrect number of coordinates.');

$mech->post($surn, { 'polygon' => $insufficient_points});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept an incorrect number of points.');

$mech->post($jurn, { 'polygon' => $insufficient_points});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept an incorrect number of points.');

$mech->post($surn, { 'polygon' => $invalid_point});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept an invalid point.');

$mech->post($jurn, { 'polygon' => $invalid_point});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '11.X: Does not accept an invalid point.');

###### needs DB connections
SKIP: {
#  skip 'not testing features requiring a database connection', 34, unless $ENV{TEST_DATABASE};
skip 'bypassing temporarily while DB development is underway', 34;

  $mech->post_ok($surn, { frame => '200' }, '2.15.1: fetching by frame makes polygon optional');
  $mech->post_ok($surn, { path => '200' }, '2.16.1: fetching by path makes polygon optional');

  $mech->post_ok($surn, { polygon=>$c_poly }, '2.1: server accepts comma-separated polygon param');
  like($mech->content(), qr/.metalink./, '2.5: checking default fallback to metalink format');

  $mech->post_ok($surn, { 'polygon' => $open_polygon }, '11.X: server automatically closes open polygons.');

  $mech->post($surn, { polygon=>$c_poly, end=>'1927-01-01' });
  is($mech->status(), Apache2::Const::HTTP_NO_CONTENT, '3.1: get HTTP 204 for no search results with specified constraints');
  
  # testing search restriction by platform: this region definitely has E1, E2, JERS, R1 assets.
  $mech->post_ok($surn, { 'polygon' => $c_poly, platform => 'E1', format=>'list' } );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    '2.2, 3.7: check for filtering search results by a single platform type' );

  # testing search restriction by multiple platforms: this region definitely has E1, E2, JERS, R1 assets.
  $mech->post_ok($surn, { 'polygon' => $c_poly, platform => 'J1,E2', format => 'list' } );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    '2.2, 3.7: check for filtering search results by multiple platforms' );

  # testing search restriction by date range: start
  $mech->post_ok($surn, { 'polygon' => $c_poly, start => '2010-10-30T11:59:59UTC', format => 'list' } );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    '2.3, 3.4: check for search results bounded by start date' );

  $mech->post_ok($surn, { 'polygon' => $c_poly, end => '1992-12-31T00:00:00UTC', format => 'list' } );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    '2.4, 3.5: check for search results bounded by end date' );

  $mech->post_ok($surn, { 'polygon' => $c_poly, start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', format=>'list' } );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    '2.5, 3.6: check for search results bounded by start and end date' );
  
  $mech->post_ok($surn, { limit => '5', 'polygon' => $c_poly, start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', format=>'list' } );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    'TC1145: test ability to limit search results via parameter' );

  $mech->post_ok($surn, { 'polygon' => $c_poly, start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', format=>'count' } );
  cmp_ok($mech->content(), '>', 0, 'TC1146: test getting results as count' );

  $mech->post_ok($surn, { 'polygon' => $c_poly, end => '2010-10-01T00:00:00UTC', processing => 'BROWSE', format=>'csv' } );
  $mech->content_unlike( qr/zip/, '2.6, 3.8: testing processing level parameter (browse only)');
   
  $mech->post_ok($surn, { 'polygon' => $c_poly, end => '2010-10-01T00:00:00UTC', processing => 'L0,L1', format=>'csv' } );
  $mech->content_unlike( qr/jpg/, '2.6, 3.8: testing processing level parameter (L0, L1 only)');

  $mech->post_ok($surn, { 'polygon' => $c_poly, start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', processing => 'L0,L1', format=>'csv', platform=>'E2,R1' } );
  is($mech->content_type(),'text/csv', '3.9.1: csv returns text/csv content type');
  unlike($mech->content(), qr/jpg/, '2.8: testing restriction of multiple search parameters to exclude browse images');

  $mech->post_ok($surn, { 'polygon' => $c_poly, start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', processing => 'L0,L1', format=>'list', platform=>'E2,R1' } );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    '2.8: tests multiple search parameters (start, end, platform, processing)');

  $mech->post_ok($jurn, { query=>qq({"polygon":"$c_poly","start":"1998-06-01T00:00:00Z","end":"1998-06-30T11:59:59Z","processing":["L0","L1"],"format":"list","platform":["E2","R1"]})} );
  @list = split/,/, $mech->content();
  cmp_ok(scalar(@list), '>', 0,
    '2.8: tests multiple search parameters via JSON request (start, end, platform, processing)');

  $mech->post($surn, {'polygon' => $c_poly, granule_list=>'R1_35587_SWB_F356,R1_34558_SWB_F356,R1_34601_SWB_F357', format=>'list'});
  @list = split/,/, $mech->content();
  is_deeply([sort @list], [qw(R1_34558_SWB_F356 R1_34558_SWB_F356 R1_34601_SWB_F357 R1_34601_SWB_F357 R1_34601_SWB_F357 R1_34601_SWB_F357 R1_35587_SWB_F356 R1_35587_SWB_F356 R1_35587_SWB_F356 R1_35587_SWB_F356)], '2.9.1: granule_list overrides other search params if present');
  #is( $mech->content(), q(R1_34558_SWB_F356,R1_34558_SWB_F356,R1_34601_SWB_F357,R1_34601_SWB_F357,R1_35587_SWB_F356,R1_35587_SWB_F356,), '2.9.1: granule_list overrides other search params if present');

}

done_testing();

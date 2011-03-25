use strict;
use warnings;
use Test::More;
use HTTP::Request::Common;
use Data::Dumper;
use Apache2::Const q(:http);
use URSA2::SearchRequest;
use Catalyst::Test 'URSA2';
use JSON;

our( $E1_assets, $E2_J1_assets, $file_list1, $file_list2, $file_list_json, $broken_json);

#
# test descriptions can be found in spreadsheet linked at http://wiki.asf.alaska.edu/asf/Ursa2SearchApiSpec
#

#
# Note!  These tests are pretty stupid-simple -- they compare returns
# from the database against hardcoded strings.  This works,
# but is sensitive to changes in the database.
#
# If tests blow up when you run them fresh from svn, or if Jenkins starts
# to freak out, check to see what the actual database results are.
#

my $surn = 'services/search/param'; # urn of the service were testing
my $jurn = 'services/search/json'; # urn of the service were testing

my $bbox = '-135,64,-133,66';
my @platforms = (q(R1 E1 E2 J1 A3));
my @startdates = (
'1985-04-12T23:20:50.52Z',
'1996-12-19T16:39:57-08:00',
'1990-12-31T23:59:60Z',
'1990-12-31T15:59:60-08:00',
'1937-01-01T12:00:27.87+00:20');
my @enddates = (
'1985-05-12T23:20:50.52Z',
'1997-01-19T16:39:57-08:00',
'1991-01-20T23:59:60Z',
'1991-01-22T15:59:60-08:00',
'1937-02-01T12:00:27.87+00:20');
my @granules = (q(R1_35587_SWB_F356 R1_34558_SWB_F356 R1_34601_SWB_F357));

# Sequence of tests against the controller as mediated through HTTP

BEGIN { use_ok 'URSA2::Controller::services' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);

###### doesn't need DB connections
$mech->get_ok('services', "1.1: web service exists");

$mech->post($surn);
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1: get HTTP 400 for missing bbox field');

$mech->get($surn, { bbox => 'invalid'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for missing bbox field');

$mech->get($jurn, { query => '{"bbox":"invalid"}'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for missing bbox field');

$mech->post($surn, { bbox => '-165,656-164,67' } );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid bbox field');

$mech->get($surn, { bbox => '1,2,3'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid bbox field');

$mech->get($jurn, { query => '{"bbox":"1,2,3"}'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid bbox field');

$mech->get($surn, { bbox => '1.111,2.22222,0,4.444a'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for invalid bbox field');

$mech->get($jurn, { query => '{"bbox":"1.111,2.22222,0,4.444a"}'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1.2: get HTTP 400 for missing bbox field');

$mech->post($surn, { processing => 'L1,browse' });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '3.2.2: get HTTP 400 for missing bbox field when other parameters are present');

$mech->post($jurn, { query => '{"processing":["L1","browse"]}' });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '3.2.2, 2.11: get HTTP 400 for missing bbox field when other parameters are present');

$mech->post($surn, { bbox=>$bbox, platform => 'BadPlatform'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.2: get HTTP 400 for invalid platform');

$mech->post($jurn, { query => '{"bbox":"-135,64.5,-135.1,64.6","platform":["BadPlatform"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.2, 2.11: get HTTP 400 for missing bbox field when other parameters are present');

$mech->post($surn, { bbox=>$bbox, start => 'BadDate'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.3: get HTTP 400 for invalid start date field');

$mech->post($jurn, { query => '{"bbox":"-135,64.5,-135.1,64.6","start":["BadDate"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.3, 2.11: get HTTP 400 for missing bbox field when other parameters are present');

$mech->post($surn, { bbox=>$bbox, end => 'BadDate'} );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.4: get HTTP 400 for invalid end date field');

$mech->post($jurn, { query => '{"bbox":"-135,64.5,-135.1,64.6","end":["BadDate"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.4, 2.11: get HTTP 400 for missing bbox field when other parameters are present');

$mech->post($surn, { bbox=>$bbox, processing => 'BadProcessing'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.6: get HTTP 400 for invalid processing level field');

$mech->post($jurn, { query => '{"bbox":"-135,64.5,-135.1,64.6","processing":["BadProcessing"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.6, 2.11: get HTTP 400 for missing bbox field when other parameters are present');

$mech->post($surn, { bbox=>$bbox, beam => 'BadBeam' });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.7: get HTTP 400 for invalid beam mode field');

$mech->post($jurn, { query => '{"bbox":"-135,64.5,-135.1,64.6","beam":["BadBeam"]}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.7, 2.11: get HTTP 400 for bad beam mode');

$mech->post($surn, { 'bbox' => '-135,64.5,-135.1,64.6', format => 'invalid' } );
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.5: check that invalid format request responds with error');

$mech->post($jurn, { query => '{"bbox":"-135,64.5,-135.1,64.6","format":"invalid"}'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.5, 2.11: get HTTP 400 for invalid format request');

$mech->post($jurn, { query => $broken_json });
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.11.3: broken JSON returns a 400');

###### needs DB connections
SKIP: {
  skip 'not testing features requiring a database connection', 34, unless $ENV{TEST_DATABASE};

  $mech->post_ok($surn, { granule_list => 'R1_63549_ST1_F165,R1_65186_ST3_F291', processing => 'any', format=>'list' });
  is($mech->content(), 'R1_63549_ST1_F165,R1_63549_ST1_F165,R1_63549_ST1_F165,R1_65186_ST3_F291,R1_65186_ST3_F291,R1_65186_ST3_F291,', 'DE506: API should accept parameter "any" for processing type');

  $mech->post_ok($surn, { frame => '200' }, '2.15.1: fetching by frame makes bbox optional');
  $mech->post_ok($surn, { path => '200' }, '2.16.1: fetching by path makes bbox optional');

#TODO: add better (more specific) tests for this
#  $mech->post_ok($surn, { path => '200-204,254,105-108,606' }, '2.16: fetching by path ranges');
#  $mech->post_ok($surn, { frame => '200-204,255,305-308,402' }, '2.16: fetching by frame ranges');

  #TODO: match these explicitly against a result set
#  $mech->post_ok($surn, { platform=>'E1', frame=>'287', format=>'list' }, 'testing OK response for searching by frame');
#  $mech->post_ok($surn, { platform=>'R2', direction=>'ascending', format=>'list' }, 'testing OK response for searching by direction');
#  $mech->post_ok($surn, { platform=>'A3', path=>'1234', format=>'list' }, 'testing OK response for searching via a single path');

  #TODO: match these explicitly against a result set
  $mech->get_ok($surn.'?products='.$file_list1.'&format=list','testing OK response for fetching file list via GET');
  $mech->post_ok($surn, { products => $file_list2, format=>'list' }, 'testing OK response for fetching file list via POST');
  $mech->post_ok($surn, { query => $file_list_json }, 'testing OK response for fetching file list via JSON POST');

  $mech->post_ok($surn, { bbox=>$bbox }, '2.1: server accepts comma-separated bbox param');
  like($mech->content(), qr/.metalink./, '2.5: checking default fallback to metalink format');

  $mech->post_ok($surn, { granule_list => 'R1_63549_ST1_F165,R1_65186_ST3_F291', format => 'json', processing => 'L0' });
  my $json = from_json( $mech->content() );
  my $f = 1;
  foreach my $g ( @{$json->{'rows'}}) {
    if ( $g->{'PROCESSINGTYPE'} ne 'L0' ) {
      $f = 0;
    }
  }
  is($f, 1, 'TC1127: specifying processing level only returns items with that processing level');

  $mech->post_ok($surn, {granule_list=>'R1_35587_SWB_F356,R1_34558_SWB_F356,R1_34601_SWB_F357'}, 'checking fetching explicit granule list');
  like($mech->content(), qr/metalink/, '2.5: checking default fallback to metalink format with explicit granule list');
  like($mech->content(), qr/.+/, '3.2.1: if granule_list is provided, no other parameters are required');

  $mech->post($surn, { bbox=>$bbox, end=>'1927-01-01' });
  is($mech->status(), Apache2::Const::HTTP_NO_CONTENT, '3.1: get HTTP 204 for no search results with specified constraints');
  
  $mech->post($surn, { granule_list=>'R1_65186_ST3_F291', format=>'csv'});
  is($mech->status(), Apache2::Const::HTTP_OK, '3: get HTTP 200 for successful search');
  is($mech->content(), q~"Granule Name","Platform","Sensor","Beam Mode","Beam Mode Description","Orbit","Path Number","Frame Number","Acquisition Date","Processing Date","Processing Level","Start Time","End Time","Center Lat","Center Lon","Near Start Lat","Near Start Lon","Far Start Lat","Far Start Lon","Near End Lat","Near End Lon","Far End Lat","Far End Lon","Faraday Rotation","Ascending or Descending?","URL","Size (MB)","Off Nadir Angle",
"R1_65186_ST3_F291","RADARSAT-1","SAR","ST3","Radarsat-1 Standard Beam 3 SAR","65186","NA","291","2008-04-30 16:24:27","2010-11-06 11:47:31","L0","2008-04-30 16:24:11","2008-04-30 16:24:27","63.5168","-148.9877","63.9072","-147.7297","62.9501","-148.2432","64.078","-149.7645","63.1172","-150.2114","NA","DESCENDING","http://test-online.asf.alaska.edu:80/L0/R1/R1_65186_ST3_L0_F291.zip","136.91","NA",
"R1_65186_ST3_F291","RADARSAT-1","SAR","ST3","Radarsat-1 Standard Beam 3 SAR","65186","NA","291","2008-04-30 16:24:27","2010-11-06 11:48:50","BROWSE","2008-04-30 16:24:11","2008-04-30 16:24:27","63.5168","-148.9877","63.9072","-147.7297","62.9501","-148.2432","64.078","-149.7645","63.1172","-150.2114","NA","DESCENDING","http://test-online.asf.alaska.edu:80/BROWSE/R1/R1_65186_ST3_F291.jpg",".4","NA",
"R1_65186_ST3_F291","RADARSAT-1","SAR","ST3","Radarsat-1 Standard Beam 3 SAR","65186","NA","291","2008-04-30 16:24:27","2010-11-06 11:49:34","L1","2008-04-30 16:24:11","2008-04-30 16:24:27","63.5168","-148.9877","63.9072","-147.7297","62.9501","-148.2432","64.078","-149.7645","63.1172","-150.2114","NA","DESCENDING","http://test-online.asf.alaska.edu:80/L1/R1/R1_65186_ST3_F291.zip","50.5","NA",~
, '3: get expected results for specific granule list, test explicit CSV format structure');

  $mech->post($surn, { granule_list=>',R1_65186_ST3_F291, E1_00404_STD_F161,,', format=>'list'});
  is($mech->status(), Apache2::Const::HTTP_OK, '3: get HTTP 200 for successful search');
  is($mech->content(), qq(E1_00404_STD_F161,E1_00404_STD_F161,E1_00404_STD_F161,R1_65186_ST3_F291,R1_65186_ST3_F291,R1_65186_ST3_F291,), '3: get expected results for slightly weird granule list (extra spaces and commas)');

  # testing search restriction by platform: this region definitely has E1, E2, JERS, R1 assets.
  $mech->post_ok($surn, { 'bbox' => '-135,54,-134,55', platform => 'E1', format=>'list' } );
  is($mech->content(), q(E1_25395_STD_F313,E1_25395_STD_F313,E1_25395_STD_F313,E1_24729_STD_F137,E1_24729_STD_F137,E1_24729_STD_F137,E1_21222_STD_F137,E1_21222_STD_F137,E1_21222_STD_F137,E1_19884_STD_F314,E1_19884_STD_F314,E1_19884_STD_F314,E1_19884_STD_F313,E1_19884_STD_F313,E1_19884_STD_F313,E1_19383_STD_F314,E1_19383_STD_F314,E1_19383_STD_F314,E1_19383_STD_F313,E1_19383_STD_F313,E1_19383_STD_F313,E1_18551_STD_F313,E1_18551_STD_F313,E1_18551_STD_F313,E1_17776_STD_F314,E1_17776_STD_F314,E1_17776_STD_F314,E1_17489_STD_F313,E1_17489_STD_F313,E1_17489_STD_F313,E1_16671_STD_F313,E1_16671_STD_F313,E1_16671_STD_F313,E1_16140_STD_F313,E1_16140_STD_F313,E1_16140_STD_F313,E1_12025_STD_F314,E1_12025_STD_F314,E1_12025_STD_F314,E1_12025_STD_F313,E1_12025_STD_F313,E1_12025_STD_F313,E1_11524_STD_F313,E1_11524_STD_F313,E1_11524_STD_F313,E1_11023_STD_F314,E1_11023_STD_F314,E1_11023_STD_F314,E1_11023_STD_F313,E1_11023_STD_F313,E1_11023_STD_F313,E1_10021_STD_F314,E1_10021_STD_F314,E1_10021_STD_F314,E1_10021_STD_F313,E1_10021_STD_F313,E1_10021_STD_F313,E1_09520_STD_F313,E1_09520_STD_F313,E1_09520_STD_F313,E1_09355_STD_F137,E1_09355_STD_F137,E1_09355_STD_F137,E1_08518_STD_F313,E1_08518_STD_F313,E1_08518_STD_F313,E1_08017_STD_F313,E1_08017_STD_F313,E1_08017_STD_F313,E1_07516_STD_F313,E1_07516_STD_F313,E1_07516_STD_F313,E1_05576_STD_F137,E1_05576_STD_F137,E1_05576_STD_F137,E1_05512_STD_F313,E1_05512_STD_F313,E1_05512_STD_F313,E1_05347_STD_F137,E1_05347_STD_F137,E1_05347_STD_F137,E1_05347_STD_F136,E1_05347_STD_F136,E1_05347_STD_F136,), '2.2, 3.7: check for filtering search results by a single platform type' );

  # testing search restriction by multiple platforms: this region definitely has E1, E2, JERS, R1 assets.
  $mech->post_ok($surn, { 'bbox' => '-135,54,-134,55', platform => 'J1,E2', format => 'list' } );
  is($mech->content(), q(E2_81373_STD_F313,E2_81373_STD_F313,E2_81373_STD_F313,E2_81208_STD_F137,E2_81208_STD_F137,E2_80872_STD_F313,E2_80872_STD_F313,E2_80872_STD_F313,E2_80371_STD_F313,E2_80371_STD_F313,E2_80371_STD_F313,E2_79934_STD_F137,E2_79934_STD_F137,E2_79934_STD_F137,E2_75926_STD_F137,E2_75926_STD_F137,E2_75926_STD_F137,E2_75862_STD_F313,E2_75862_STD_F313,E2_75862_STD_F313,E2_73858_STD_F314,E2_73858_STD_F314,E2_73858_STD_F313,E2_73858_STD_F313,E2_73858_STD_F313,E2_72190_STD_F137,E2_72190_STD_F137,E2_72190_STD_F137,E2_72190_STD_F136,E2_72190_STD_F136,E2_71918_STD_F137,E2_71918_STD_F137,E2_71918_STD_F137,E2_71854_STD_F314,E2_71854_STD_F314,E2_71854_STD_F313,E2_71854_STD_F313,E2_71854_STD_F313,E2_71353_STD_F314,E2_71353_STD_F314,E2_71353_STD_F313,E2_71353_STD_F313,E2_71353_STD_F313,E2_70916_STD_F137,E2_70916_STD_F137,E2_70916_STD_F137,E2_70351_STD_F314,E2_70351_STD_F314,E2_70351_STD_F313,E2_70351_STD_F313,E2_70351_STD_F313,E2_69914_STD_F137,E2_69914_STD_F137,E2_69914_STD_F137,E2_69850_STD_F314,E2_69850_STD_F314,E2_69850_STD_F313,E2_69850_STD_F313,E2_69850_STD_F313,E2_69349_STD_F314,E2_69349_STD_F314,E2_69349_STD_F313,E2_69349_STD_F313,E2_69349_STD_F313,E2_68848_STD_F314,E2_68848_STD_F314,E2_68347_STD_F314,E2_68347_STD_F314,E2_68347_STD_F313,E2_68347_STD_F313,E2_68347_STD_F313,E2_67846_STD_F313,E2_67846_STD_F313,E2_67846_STD_F313,E2_67116_STD_F313,E2_67116_STD_F313,E2_67116_STD_F313,E2_48307_STD_F313,E2_48307_STD_F313,E2_48307_STD_F313,E2_47305_STD_F313,E2_47305_STD_F313,E2_47305_STD_F313,E2_45802_STD_F313,E2_45802_STD_F313,E2_45802_STD_F313,E2_45301_STD_F313,E2_45301_STD_F313,E2_45301_STD_F313,E2_27100_STD_F137,E2_27100_STD_F137,E2_27100_STD_F137,E2_26098_STD_F137,E2_26098_STD_F137,E2_26098_STD_F137,J1_33755_STD_F313,J1_33755_STD_F313,J1_33755_STD_F313,J1_33111_STD_F313,J1_33111_STD_F313,J1_33111_STD_F313,J1_31134_STD_F313,J1_31134_STD_F313,J1_31134_STD_F313,J1_30460_STD_F314,J1_30460_STD_F314,J1_30460_STD_F313,J1_30460_STD_F313,J1_30460_STD_F313,E2_05722_STD_F314,E2_05722_STD_F314,E2_05722_STD_F313,E2_05722_STD_F313,E2_04054_STD_F137,E2_04054_STD_F137,E2_04054_STD_F137,), '2.2, 3.7: check for filtering search results by multiple platforms' );

  $mech->post($surn, { granule_list => 'E2_81230_STD_F289', format => 'metalink' } );
  is($mech->content_type(),'application/metalink+xml', '3.9.2: metalink returns application/metalink+xml content type');

  # testing search restriction by date range: start
  $mech->post_ok($surn, { 'bbox' => '-135,63,-130,67', start => '2010-10-30T11:59:59UTC', format => 'list' } );
  is($mech->content(), qq(E2_81373_STD_F291,E2_81373_STD_F291,E2_81316_STD_F285,E2_81316_STD_F285,E2_81316_STD_F285,E2_81316_STD_F283,E2_81316_STD_F283,E2_81316_STD_F283,E2_81230_STD_F291,E2_81230_STD_F291,E2_81230_STD_F291,E2_81230_STD_F289,E2_81230_STD_F289,E2_81230_STD_F289,E2_81230_STD_F287,E2_81230_STD_F287,E2_81230_STD_F287,E2_81230_STD_F285,E2_81230_STD_F285,E2_81230_STD_F285,E2_81230_STD_F283,E2_81230_STD_F283,E2_81230_STD_F283,E2_81187_STD_F291,E2_81187_STD_F291,E2_81187_STD_F291,E2_81187_STD_F289,E2_81187_STD_F289,E2_81187_STD_F289,E2_81187_STD_F287,E2_81187_STD_F287,E2_81187_STD_F287,E2_81187_STD_F285,E2_81187_STD_F285,E2_81187_STD_F285,E2_81187_STD_F283,E2_81187_STD_F283,E2_81187_STD_F283,), '2.3, 3.4: check for search results bounded by start date' );
  
  $mech->post_ok($surn, { 'bbox' => '-135,63,-130,67', end => '1991-10-01T00:00:00UTC', format => 'list' } );
  is($mech->content(), q(E1_00885_STD_F287,E1_00885_STD_F287,E1_00885_STD_F287,E1_00885_STD_F285,E1_00885_STD_F285,E1_00885_STD_F285,E1_00885_STD_F283,E1_00885_STD_F283,E1_00885_STD_F283,E1_00455_STD_F287,E1_00455_STD_F287,E1_00455_STD_F287,E1_00455_STD_F285,E1_00455_STD_F285,E1_00455_STD_F285,E1_00455_STD_F283,E1_00455_STD_F283,E1_00455_STD_F283,E1_00404_STD_F163,E1_00404_STD_F163,E1_00404_STD_F163,E1_00404_STD_F161,E1_00404_STD_F161,E1_00404_STD_F161,E1_00404_STD_F159,E1_00404_STD_F159,E1_00404_STD_F159,), '2.4, 3.5: check for search results bounded by end date' );

  $mech->post_ok($surn, { 'bbox' => '-135,60,-130,70', start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', format=>'list' } );
  is($mech->content(), q(E2_16687_STD_F285,E2_16687_STD_F285,E2_16687_STD_F285,E2_16687_STD_F283,E2_16687_STD_F283,E2_16687_STD_F283,E2_16687_STD_F281,E2_16687_STD_F281,E2_16687_STD_F281,E2_16687_STD_F279,E2_16687_STD_F279,E2_16687_STD_F279,E2_16687_STD_F277,E2_16687_STD_F277,E2_16687_STD_F277,E2_16687_STD_F275,E2_16687_STD_F275,E2_16687_STD_F275,R1_13778_SNB_F300,R1_13778_SNB_F300,E2_16558_STD_F299,E2_16558_STD_F299,E2_16558_STD_F299,E2_16558_STD_F297,E2_16558_STD_F297,E2_16558_STD_F297,E2_16558_STD_F295,E2_16558_STD_F295,E2_16558_STD_F295,E2_16558_STD_F293,E2_16558_STD_F293,E2_16558_STD_F293,E2_16558_STD_F291,E2_16558_STD_F291,E2_16558_STD_F291,E2_16558_STD_F289,E2_16558_STD_F289,E2_16558_STD_F289,E2_16558_STD_F287,E2_16558_STD_F287,E2_16558_STD_F287,E2_16558_STD_F285,E2_16558_STD_F285,E2_16558_STD_F285,E2_16558_STD_F283,E2_16558_STD_F283,E2_16558_STD_F283,R1_13699_SWB_F174,R1_13699_SWB_F174,R1_13699_SWB_F171,R1_13699_SWB_F171,J1_34609_STD_F275,J1_34609_STD_F275,J1_34579_STD_F279,J1_34579_STD_F279,J1_34579_STD_F277,J1_34579_STD_F277,J1_34579_STD_F277,J1_34579_STD_F275,J1_34579_STD_F275,R1_13499_WD2_F175,R1_13499_WD2_F173,R1_13499_WD2_F172,J1_34549_STD_F285,J1_34549_STD_F285,J1_34549_STD_F285,J1_34549_STD_F284,J1_34549_STD_F284,J1_34549_STD_F283,J1_34549_STD_F283,J1_34549_STD_F283,J1_34549_STD_F282,J1_34549_STD_F282,J1_34549_STD_F281,J1_34549_STD_F281,J1_34549_STD_F281,J1_34549_STD_F280,J1_34549_STD_F280,J1_34549_STD_F279,J1_34549_STD_F279,J1_34549_STD_F278,J1_34549_STD_F278,J1_34549_STD_F277,J1_34549_STD_F277,J1_34549_STD_F277,J1_34549_STD_F276,J1_34549_STD_F276,J1_34549_STD_F275,J1_34549_STD_F275,J1_34549_STD_F275,J1_34534_STD_F287,J1_34534_STD_F287,J1_34534_STD_F287,J1_34534_STD_F285,J1_34534_STD_F285,J1_34534_STD_F285,J1_34534_STD_F283,J1_34534_STD_F283,J1_34534_STD_F283,J1_34534_STD_F281,J1_34534_STD_F281,J1_34534_STD_F279,J1_34534_STD_F279,J1_34534_STD_F277,J1_34534_STD_F277,J1_34534_STD_F277,J1_34534_STD_F275,J1_34534_STD_F275,J1_34504_STD_F293,J1_34504_STD_F293,J1_34504_STD_F291,J1_34504_STD_F291,J1_34504_STD_F289,J1_34504_STD_F289,J1_34504_STD_F289,J1_34504_STD_F287,J1_34504_STD_F287,J1_34504_STD_F285,J1_34504_STD_F285,J1_34504_STD_F285,J1_34504_STD_F283,J1_34504_STD_F283,J1_34504_STD_F283,J1_34504_STD_F281,J1_34504_STD_F281,J1_34504_STD_F279,J1_34504_STD_F279,J1_34504_STD_F277,J1_34504_STD_F277,J1_34504_STD_F277,J1_34504_STD_F275,J1_34504_STD_F275,R1_13442_ST3_F157,R1_13442_ST3_F157,R1_13442_ST3_F157,R1_13442_ST3_F155,R1_13442_ST3_F155,R1_13442_ST3_F155,R1_13442_ST3_F153,R1_13442_ST3_F153,R1_13442_ST3_F153,R1_13442_ST3_F151,R1_13442_ST3_F151,R1_13442_ST3_F151,J1_34489_STD_F297,J1_34489_STD_F297,J1_34489_STD_F297,J1_34489_STD_F296,J1_34489_STD_F296,J1_34489_STD_F295,J1_34489_STD_F295,J1_34489_STD_F295,J1_34489_STD_F294,J1_34489_STD_F294,J1_34489_STD_F293,J1_34489_STD_F293,J1_34489_STD_F292,J1_34489_STD_F292,J1_34489_STD_F291,J1_34489_STD_F291,J1_34489_STD_F290,J1_34489_STD_F290,J1_34489_STD_F289,J1_34489_STD_F289,J1_34489_STD_F289,J1_34489_STD_F288,J1_34489_STD_F288,J1_34489_STD_F287,J1_34489_STD_F287,J1_34489_STD_F287,J1_34489_STD_F286,J1_34489_STD_F286,J1_34489_STD_F285,J1_34489_STD_F285,J1_34489_STD_F285,J1_34489_STD_F284,J1_34489_STD_F284,J1_34489_STD_F283,J1_34489_STD_F283,J1_34489_STD_F283,J1_34489_STD_F282,J1_34489_STD_F282,J1_34489_STD_F281,J1_34489_STD_F281,J1_34489_STD_F281,J1_34489_STD_F280,J1_34489_STD_F280,J1_34489_STD_F279,J1_34489_STD_F279,J1_34489_STD_F278,J1_34489_STD_F278,J1_34489_STD_F277,J1_34489_STD_F277,J1_34489_STD_F277,J1_34489_STD_F276,J1_34489_STD_F276,J1_34489_STD_F275,J1_34489_STD_F275,J1_34489_STD_F275,R1_13435_SNB_F300,R1_13435_SNB_F300,), '2.5, 3.6: check for search results bounded by start and end date' );

  
  $mech->post_ok($surn, { limit => '5', 'bbox' => '-135,60,-130,70', start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', format=>'list' } );
  is($mech->content(), q(R1_13442_ST3_F157,R1_13442_ST3_F157,R1_13442_ST3_F153,R1_13442_ST3_F151,R1_13442_ST3_F151,), 'TC1145: test ability to limit search results via parameter' );

  $mech->post_ok($surn, { 'bbox' => '-135,60,-130,70', start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', format=>'count' } );
  is($mech->content(), '201', 'TC1146: test getting results as count' );

  $mech->post_ok($surn, { 'bbox' => '-135,64.5,-135.1,64.6', end => '2010-10-01T00:00:00UTC', processing => 'BROWSE', format=>'csv' } );
  $mech->content_unlike( qr/zip/, '2.6, 3.8: testing processing level parameter (browse only)');
   
  $mech->post_ok($surn, { 'bbox' => '-135,64.5,-135.1,64.6', end => '2010-10-01T00:00:00UTC', processing => 'L0,L1', format=>'csv' } );
  $mech->content_unlike( qr/jpg/, '2.6, 3.8: testing processing level parameter (L0, L1 only)');

  $mech->post_ok($surn, { 'bbox' => '-135,64,-133,66', start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', processing => 'L0,L1', format=>'csv', platform=>'E2,R1' } );
  is($mech->content_type(),'text/csv', '3.9.1: csv returns text/csv content type');
  unlike($mech->content(), qr/jpg/, '2.8: testing restriction of multiple search parameters to exclude browse images');

  $mech->post_ok($surn, { 'bbox' => '-135,64,-133,66', start => '1998-06-01T00:00:00Z', end => '1998-06-30T11:59:59Z', processing => 'L0,L1', format=>'list', platform=>'E2,R1' } );
  is($mech->content(), q(E2_16687_STD_F285,E2_16687_STD_F285,), '2.8: tests multiple search parameters (start, end, platform, processing)');

  $mech->post_ok($jurn, { query=>'{"bbox":"-135,64,-133,66","start":"1998-06-01T00:00:00Z","end":"1998-06-30T11:59:59Z","processing":["L0","L1"],"format":"list","platform":["E2","R1"]}'} );
  is($mech->content(), q(E2_16687_STD_F285,E2_16687_STD_F285,), '2.8: tests multiple search parameters via JSON request (start, end, platform, processing)');

  $mech->post($surn, {'bbox' => '-135,64.5,-135.1,64.6', granule_list=>'R1_35587_SWB_F356,R1_34558_SWB_F356,R1_34601_SWB_F357', format=>'list'});
  is( $mech->content(), q(R1_34558_SWB_F356,R1_34558_SWB_F356,R1_34601_SWB_F357,R1_34601_SWB_F357,R1_35587_SWB_F356,R1_35587_SWB_F356,), '2.9.1: granule_list overrides other search params if present');

  $mech->post($surn, { granule_list=>'R1_35587_SWB_F356,R1_34558_SWB_F356,R1_34601_SWB_F357', processing => 'browse', format => 'list' });
  unlike($mech->content(), qr/zip/, '2.9.2: processing level parameter can be provided with granule list');

}

BEGIN {

our $raw_xml = q(<?xml version="1.0"?>
<rows>
<ROW><GRANULENAME>R1_35587_SWB_F356</GRANULENAME><PRODUCTNAME>R1_35587_SWB_F356</PRODUCTNAME><PLATFORM>RADARSAT-1</PLATFORM><SENSOR>SAR</SENSOR><BEAMMODETYPE>SWB</BEAMMODETYPE><BEAMMODEDESC>Radarsat-1 SCANSAR Wide Beam B SAR                                                                                                                                                                                                                              </BEAMMODEDESC><ORBIT>35587</ORBIT><PATHNUMBER>NA</PATHNUMBER><FRAMENUMBER>356</FRAMENUMBER><ACQUISITIONDATE>29-AUG-02 02.58.00.338027 PM</ACQUISITIONDATE><PROCESSINGDATE>28-NOV-10 04.52.26.673592 PM</PROCESSINGDATE><PROCESSINGTYPE>BROWSE</PROCESSINGTYPE><STARTTIME>29-AUG-02 02.56.43.339536 PM</STARTTIME><ENDTIME>29-AUG-02 02.58.00.338027 PM</ENDTIME><CENTERLAT>37.6236</CENTERLAT><CENTERLON>-133.2796</CENTERLON><NEARSTARTLAT>39.581685</NEARSTARTLAT><NEARSTARTLON>-129.992791</NEARSTARTLON><NEARENDLAT>35.055549</NEARENDLAT><NEARENDLON>-131.250025</NEARENDLON><FARSTARTLAT>40.132374</FARSTARTLAT><FARSTARTLON>-135.473428</FARSTARTLON><FARENDLAT>35.595865</FARENDLAT><FARENDLON>-136.39153</FARENDLON><FARADAYROTATION>NA</FARADAYROTATION><ASCENDINGDESCENDING>DESCENDING</ASCENDINGDESCENDING><URL>http://test-online.asf.alaska.edu:80/BROWSE/R1/R1_35587_SWB_F356.jpg</URL><BYTES>136151</BYTES><MD5SUM>d7931262cdc8d6020cce2d422d061efd</MD5SUM><GRANULEDESC>Radarsat-1 ScanSAR Data in ASF Frame Size</GRANULEDESC><GRANULETYPE>R1_SCANSAR_FRAME</GRANULETYPE><FILENAME>R1_35587_SWB_F356.jpg</FILENAME><SHAPE><SDO_GTYPE>2003</SDO_GTYPE><SDO_SRID>8307</SDO_SRID><SDO_ELEM_INFO><NUMBER>1</NUMBER><NUMBER>1003</NUMBER><NUMBER>1</NUMBER></SDO_ELEM_INFO><SDO_ORDINATES><NUMBER>-129.992791</NUMBER><NUMBER>39.581685</NUMBER><NUMBER>-135.473428</NUMBER><NUMBER>40.132374</NUMBER><NUMBER>-136.39153</NUMBER><NUMBER>35.595865</NUMBER><NUMBER>-131.250025</NUMBER><NUMBER>35.055549</NUMBER><NUMBER>-129.992791</NUMBER><NUMBER>39.581685</NUMBER></SDO_ORDINATES></SHAPE></ROW>
<ROW><GRANULENAME>R1_35587_SWB_F356</GRANULENAME><PRODUCTNAME>R1_35587_SWB_F356</PRODUCTNAME><PLATFORM>RADARSAT-1</PLATFORM><SENSOR>SAR</SENSOR><BEAMMODETYPE>SWB</BEAMMODETYPE><BEAMMODEDESC>Radarsat-1 SCANSAR Wide Beam B SAR                                                                                                                                                                                                                              </BEAMMODEDESC><ORBIT>35587</ORBIT><PATHNUMBER>NA</PATHNUMBER><FRAMENUMBER>356</FRAMENUMBER><ACQUISITIONDATE>29-AUG-02 02.58.00.338027 PM</ACQUISITIONDATE><PROCESSINGDATE>28-NOV-10 04.52.34.767383 PM</PROCESSINGDATE><PROCESSINGTYPE>L1</PROCESSINGTYPE><STARTTIME>29-AUG-02 02.56.43.339536 PM</STARTTIME><ENDTIME>29-AUG-02 02.58.00.338027 PM</ENDTIME><CENTERLAT>37.6236</CENTERLAT><CENTERLON>-133.2796</CENTERLON><NEARSTARTLAT>39.581685</NEARSTARTLAT><NEARSTARTLON>-129.992791</NEARSTARTLON><NEARENDLAT>35.055549</NEARENDLAT><NEARENDLON>-131.250025</NEARENDLON><FARSTARTLAT>40.132374</FARSTARTLAT><FARSTARTLON>-135.473428</FARSTARTLON><FARENDLAT>35.595865</FARENDLAT><FARENDLON>-136.39153</FARENDLON><FARADAYROTATION>NA</FARADAYROTATION><ASCENDINGDESCENDING>DESCENDING</ASCENDINGDESCENDING><URL>http://test-online.asf.alaska.edu:80/L1/R1/R1_35587_SWB_F356.zip</URL><BYTES>64780747</BYTES><MD5SUM>6d1e8c41d1e873aada9916a1b884b4db</MD5SUM><GRANULEDESC>Radarsat-1 ScanSAR Data in ASF Frame Size</GRANULEDESC><GRANULETYPE>R1_SCANSAR_FRAME</GRANULETYPE><FILENAME>R1_35587_SWB_F356.zip</FILENAME><SHAPE><SDO_GTYPE>2003</SDO_GTYPE><SDO_SRID>8307</SDO_SRID><SDO_ELEM_INFO><NUMBER>1</NUMBER><NUMBER>1003</NUMBER><NUMBER>1</NUMBER></SDO_ELEM_INFO><SDO_ORDINATES><NUMBER>-129.992791</NUMBER><NUMBER>39.581685</NUMBER><NUMBER>-135.473428</NUMBER><NUMBER>40.132374</NUMBER><NUMBER>-136.39153</NUMBER><NUMBER>35.595865</NUMBER><NUMBER>-131.250025</NUMBER><NUMBER>35.055549</NUMBER><NUMBER>-129.992791</NUMBER><NUMBER>39.581685</NUMBER></SDO_ORDINATES></SHAPE></ROW></rows>
);

our $file_list1 = q(R1_38175_ST2_L0_F287.zip,R1_38175_ST2_F287.zip,R1_38175_ST2_F287.jpg);
our $file_list2 = q(E2_59888_STD_F285.jpg,E2_59888_STD_F285.jpg,E2_59888_STD_F285.jpg,E2_59888_STD_F287.jpg,E2_59888_STD_F287.jpg,E2_59888_STD_F287.jpg,E2_62350_STD_F286.jpg,E2_62350_STD_F286.jpg,E2_62350_STD_F287.jpg,E2_62350_STD_F287.jpg,E2_62350_STD_F287.jpg,E2_62614_STD_F163.jpg,E2_62614_STD_F163.jpg,E2_62614_STD_F163.jpg,E2_62614_STD_F164.jpg,E2_62614_STD_F164.jpg,E2_62622_STD_F285.jpg,E2_62622_STD_F285.jpg,E2_62622_STD_F285.jpg,E2_62622_STD_F287.jpg,E2_62622_STD_F287.jpg,E2_62622_STD_F287.jpg,E2_62886_STD_F163.jpg,E2_62886_STD_F163.jpg,E2_62886_STD_F163.jpg,E2_62886_STD_F164.jpg,E2_62886_STD_F164.jpg,E2_62894_STD_F285.jpg,E2_62894_STD_F285.jpg,E2_62894_STD_F285.jpg,E2_62894_STD_F287.jpg,E2_62894_STD_F287.jpg,E2_62894_STD_F287.jpg,E2_63387_STD_F163.jpg,E2_63387_STD_F163.jpg,E2_63387_STD_F163.jpg,E2_63395_STD_F285.jpg,E2_63395_STD_F285.jpg,E2_63395_STD_F285.jpg,E2_63395_STD_F287.jpg,E2_63395_STD_F287.jpg,E2_63395_STD_F287.jpg,E2_63888_STD_F163.jpg,E2_63888_STD_F163.jpg,E2_63888_STD_F163.jpg,E2_63888_STD_F164.jpg,E2_63888_STD_F164.jpg,E2_63896_STD_F285.jpg,E2_63896_STD_F285.jpg,E2_63896_STD_F285.jpg,E2_63896_STD_F287.jpg,E2_63896_STD_F287.jpg,E2_63896_STD_F287.jpg,E2_64661_STD_F163.jpg,E2_64661_STD_F163.jpg,E2_64661_STD_F163.jpg,E2_64890_STD_F163.jpg,E2_64890_STD_F163.jpg,E2_64890_STD_F163.jpg,E2_64898_STD_F287.jpg,E2_64898_STD_F287.jpg,E2_64898_STD_F287.jpg,E2_65127_STD_F287.jpg,E2_65127_STD_F287.jpg,E2_65127_STD_F287.jpg,E2_65356_STD_F287.jpg,E2_65356_STD_F287.jpg,E2_65356_STD_F287.jpg,E2_65391_STD_F163.jpg,E2_65391_STD_F163.jpg,E2_65391_STD_F163.jpg,E2_65399_STD_F287.jpg,E2_65399_STD_F287.jpg,E2_65399_STD_F287.jpg,E2_66129_STD_F287.jpg,E2_66129_STD_F287.jpg,E2_66129_STD_F287.jpg,E2_66859_STD_F287.jpg,E2_66859_STD_F287.jpg,E2_66859_STD_F287.jpg,E2_66902_STD_F287.jpg,E2_66902_STD_F287.jpg,E2_66902_STD_F287.jpg,E2_67632_STD_F286.jpg,E2_67632_STD_F286.jpg,E2_67667_STD_F163.jpg,E2_67667_STD_F163.jpg,E2_67667_STD_F163.jpg,E2_67853_STD_F163.jpg,E2_67853_STD_F163.jpg,E2_67853_STD_F163.jpg,E2_67853_STD_F164.jpg,E2_67853_STD_F164.jpg,E2_67853_STD_F165.jpg,E2_67853_STD_F165.jpg,E2_67853_STD_F165.jpg,E2_67861_STD_F287.jpg,E2_67861_STD_F287.jpg,E2_67861_STD_F287.jpg,E2_68125_STD_F163.jpg);

our $file_list_json = q({"products":["E2_59888_STD_F285.jpg","E2_59888_STD_F285.jpg","E2_59888_STD_F285.jpg","E2_59888_STD_F287.jpg","E2_59888_STD_F287.jpg","E2_59888_STD_F287.jpg","E2_62350_STD_F286.jpg","E2_62350_STD_F286.jpg","E2_62350_STD_F287.jpg","E2_62350_STD_F287.jpg","E2_62350_STD_F287.jpg","E2_62614_STD_F163.jpg","E2_62614_STD_F163.jpg","E2_62614_STD_F163.jpg","E2_62614_STD_F164.jpg","E2_62614_STD_F164.jpg","E2_62622_STD_F285.jpg","E2_62622_STD_F285.jpg","E2_62622_STD_F285.jpg","E2_62622_STD_F287.jpg","E2_62622_STD_F287.jpg","E2_62622_STD_F287.jpg","E2_62886_STD_F163.jpg","E2_62886_STD_F163.jpg","E2_62886_STD_F163.jpg","E2_62886_STD_F164.jpg","E2_62886_STD_F164.jpg","E2_62894_STD_F285.jpg","E2_62894_STD_F285.jpg","E2_62894_STD_F285.jpg","E2_62894_STD_F287.jpg","E2_62894_STD_F287.jpg","E2_62894_STD_F287.jpg","E2_63387_STD_F163.jpg","E2_63387_STD_F163.jpg","E2_63387_STD_F163.jpg","E2_63395_STD_F285.jpg","E2_63395_STD_F285.jpg","E2_63395_STD_F285.jpg","E2_63395_STD_F287.jpg","E2_63395_STD_F287.jpg","E2_63395_STD_F287.jpg","E2_63888_STD_F163.jpg","E2_63888_STD_F163.jpg","E2_63888_STD_F163.jpg","E2_63888_STD_F164.jpg","E2_63888_STD_F164.jpg","E2_63896_STD_F285.jpg","E2_63896_STD_F285.jpg","E2_63896_STD_F285.jpg","E2_63896_STD_F287.jpg","E2_63896_STD_F287.jpg","E2_63896_STD_F287.jpg","E2_64661_STD_F163.jpg","E2_64661_STD_F163.jpg","E2_64661_STD_F163.jpg","E2_64890_STD_F163.jpg","E2_64890_STD_F163.jpg","E2_64890_STD_F163.jpg","E2_64898_STD_F287.jpg","E2_64898_STD_F287.jpg","E2_64898_STD_F287.jpg","E2_65127_STD_F287.jpg","E2_65127_STD_F287.jpg","E2_65127_STD_F287.jpg","E2_65356_STD_F287.jpg","E2_65356_STD_F287.jpg","E2_65356_STD_F287.jpg","E2_65391_STD_F163.jpg","E2_65391_STD_F163.jpg","E2_65391_STD_F163.jpg","E2_65399_STD_F287.jpg","E2_65399_STD_F287.jpg","E2_65399_STD_F287.jpg","E2_66129_STD_F287.jpg","E2_66129_STD_F287.jpg","E2_66129_STD_F287.jpg","E2_66859_STD_F287.jpg","E2_66859_STD_F287.jpg","E2_66859_STD_F287.jpg","E2_66902_STD_F287.jpg","E2_66902_STD_F287.jpg","E2_66902_STD_F287.jpg","E2_67632_STD_F286.jpg","E2_67632_STD_F286.jpg","E2_67667_STD_F163.jpg","E2_67667_STD_F163.jpg","E2_67667_STD_F163.jpg","E2_67853_STD_F163.jpg","E2_67853_STD_F163.jpg","E2_67853_STD_F163.jpg","E2_67853_STD_F164.jpg","E2_67853_STD_F164.jpg","E2_67853_STD_F165.jpg","E2_67853_STD_F165.jpg","E2_67853_STD_F165.jpg","E2_67861_STD_F287.jpg","E2_67861_STD_F287.jpg","E2_67861_STD_F287.jpg","E2_68125_STD_F163.jpg"],"format":"list"});

our $broken_json = q({"products":["abc"});

}

done_testing();

use strict;
use warnings;
use Test::More tests => 11;
use HTTP::Request::Common;
use Data::Dumper;
use Apache2::Const q(:http);
use URSA2::SearchRequest;
use URSA2::Exceptions qw(InvalidParameter);
use Catalyst::Test 'URSA2';
use JSON;

BEGIN { use_ok 'URSA2::Controller::services' }

use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my @granules = qw(
  UA_aleutn_27104_09076_007_090929_L090_CX_01
);
my $platform = 'UA';

my @beams = qw(
  POL
);

my @processing = qw(
  BROWSE
  COMPLEX
  KMZ
  METADATA
  PROJECTED
  STOKES
);

my $surn = 'services/search/param';
my $jurn = 'services/search/json';

my $request = qq(
  $surn?platform=$platform&beam=) . join(',', @beams) . qq(&processing=) .
  join(',', @processing);
my ($response, $c) = ctx_request($request);
my $s = URSA2::SearchRequest->factory($c->request);
$s->decode();
$s->validate();

is_deeply($s->platform, ['UA'], 'UA platform type is accepted.');
is_deeply($s->processing, \@processing, 'UA processing types are accepted.');
is_deeply($s->beam, \@beams, 'UA beam mode types are accepted.');
  
my $mech = Test::WWW::Mechanize::Catalyst->new(
  'catalyst_app' => 'URSA2', 'autolint' => 0
);

$mech->post($surn, {'platform' => $platform, 'beam' => 'BadBeam'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST,
  'PARAM: Bad beam returns 400');
$mech->post($surn, {'platform' => $platform, 'processing' => 'BadProcessing'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST,
  'PARAM: Bad processing returns 400');

$mech->post($jurn,
  {'query' => "{\"platform\":\"$platform\",\"beam\":[\"BadBeam\"]}"});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST,
  'JSON: Bad beam returns 400');
$mech->post($jurn,
  {'query' => "{\"platform\":\"$platform\",\"processing\":[\"BadProcessing\"]}"});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST,
  'JSON: Bad processing returns 400');

#################
# These tests require a DB connection.
# set TEST_DATABASE=1 to run these tests.
################
SKIP: {
  skip 'Skipping tests requiring a database connection.', 2,
    unless $ENV{'TEST_DATABASE'};
  $mech->post($surn, { 'platform' => $platform, 'beam' => join(',', @beams),
    'processing' => join(',', @processing), 'format' => 'count'});
  cmp_ok($mech->content(), '>', '0', 'Find UAVSAR scenes through API');

  $mech->post($surn, { 'granule_list' => join(',', @granules),
    'format' => 'list' });
  my @list = split/,/, $mech->content();
  is_deeply([sort @list], [qw(UA_aleutn_27104_09076_007_090929_L090_CX_01 UA_aleutn_27104_09076_007_090929_L090_CX_01 UA_aleutn_27104_09076_007_090929_L090_CX_01 UA_aleutn_27104_09076_007_090929_L090_CX_01 UA_aleutn_27104_09076_007_090929_L090_CX_01 UA_aleutn_27104_09076_007_090929_L090_CX_01)],
    'Find UAVSAR scenes by name through API');
}

use strict;
use warnings;
use Test::More;
use Data::Dumper;
use Apache2::Const qw(:http);

#
# test descriptions can be found at http://wiki.asf.alaska.edu/asf/Ursa2SearchApiSpec
#

my $surn = 'services/authentication'; # urn of the service were testing
my $user = 'becrevensten'; # should be a valid userid
my $pass = 'bruce'; # should be the above user's password

BEGIN { use_ok 'URSA2::Controller::services' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);

#2.1
$mech->post($surn, { userid=>$user, password=>$pass, extra=>'extra'});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '2.1, 3.2: get HTTP 400 for extra fields');

#2.5
#TODO: investigate: flush for protocol change (!)
$mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);
$mech->get($surn, {userid=>$user, password=>$pass});
is($mech->status(), Apache2::Const::HTTP_METHOD_NOT_ALLOWED, '2.5, 3.1: get HTTP 405 for using GET method');

#3.3
$mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);
$mech->post($surn, {userid=>$user});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '3.3: get HTTP 400 for missing password field');
$mech->post($surn, {password=>$pass});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '3.3: get HTTP 400 for missing userid field');
$mech->post($surn);
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST, '3.3: get HTTP 400 for missing userid & password fields');

SKIP: {
  skip 'lower priority (harder!) tests, skipping until later...', 4;
#3.4
#FIXME: do some magic to break the server temporarily, and then:
$mech->post($surn);
is($mech->status(), Apache2::Const::HTTP_INTERNAL_SERVER_ERROR, '3.4: get HTTP 500 for server freaking out');
#FIXME: and then bring it back up somehow, so we can:
$mech->post($surn);
isnt($mech->status(), Apache2::Const::HTTP_INTERNAL_SERVER_ERROR, '3.4: do NOT get HTTP 500 for server NOT freaking out');

#3.5 - will need to examine testing options
#FIXME: do some magic to make the DB unreachable, and then:
$mech->post($surn);
is($mech->status(), Apache2::Const::HTTP_SERVICE_UNAVAILABLE, '3.5: get HTTP 503 for inaccessible DB');
#FIXME: and then bring it back up somehow, so we can:
$mech->post($surn);
isnt($mech->status(), Apache2::Const::HTTP_SERVICE_UNAVAILABLE, '3.5: do NOT get HTTP 503 for accessible DB');
}

SKIP: {
  skip 'skipping tests requiring database connection', 6 unless $ENV{TEST_DATABASE};

#2.3
$mech->post($surn, {userid=>$user, password=>$pass.'a'});
is($mech->status(), Apache2::Const::HTTP_UNAUTHORIZED, '2.3, 3.3: get HTTP 401 for incorrect password');
$mech->post($surn, {userid=>'BadUser', password=>$pass.'a'});
is($mech->status(), Apache2::Const::HTTP_UNAUTHORIZED, '2.3, 3.3: get HTTP 401 for incorrect user & password');

#2.4.1
my $resp = $mech->post($surn, {userid=>$user, password=>$pass});
ok($resp->header('Set-Cookie'), 'has cookie header');
like($mech->cookie_jar->as_string(), qr/datapool/,
       'datapool cookie was accepted, auth succeeded');

#3.6
$mech->post($surn, {userid=>'badUser', password=>'badPass'});
is($mech->status(), Apache2::Const::HTTP_UNAUTHORIZED, '3.6: get HTTP 401 for authentication failures');
}
done_testing();

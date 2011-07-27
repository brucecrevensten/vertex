use strict;
use warnings;
use Test::More;
use Data::Dumper;
use Apache2::Const qw(:http :common);
use URI::Escape;

#
# test descriptions can be found at http://wiki.asf.alaska.edu/asf/Ursa2SearchApiSpec
#

my $surn = 'services/authentication'; # urn of the service were testing
my $user = 'guest'; # should be a valid userid
my $pass = 'guest'; # should be the above user's password
my $redirect_url = 'http://www.google.com';
my $encoded_redirect_url = uri_escape($redirect_url);

BEGIN { use_ok 'URSA2::Controller::services' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

#2.5
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);
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
  skip 'skipping tests requiring database connection', 14 unless $ENV{TEST_DATABASE};

#2.3
$mech->post($surn, {userid=>$user, password=>$pass.'a'});
is($mech->status(), Apache2::Const::HTTP_UNAUTHORIZED, '3.6, 2.3, 3.3: get HTTP 401 for incorrect password');
$mech->post($surn, {userid=>'BadUser', password=>$pass.'a'});
is($mech->status(), Apache2::Const::HTTP_UNAUTHORIZED, '3.6, 2.3, 3.3: get HTTP 401 for incorrect user & password');

#2.4.1
my $resp = $mech->post($surn, {userid=>$user, password=>$pass});
ok($resp->header('Set-Cookie'), 'has cookie header');
like($mech->cookie_jar->as_string(), qr/datapool/,
       'datapool cookie was accepted, auth succeeded');

$mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);
# Ignore extra fields and procede with request.
$mech->post($surn, { userid=>$user, password=>$pass, extra=>'extra'});
is($mech->status(), Apache2::Const::HTTP_OK, 'Ignore extra fields.');

$mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2',
  autolint => 0, autocheck => 0);
$mech->requests_redirectable([]);
$resp = $mech->post($surn, { userid=>$user, password=>$pass,
  redirect=>$encoded_redirect_url });
is($mech->status(), Apache2::Const::REDIRECT, 'Redirect to URL');
$mech->content_contains($redirect_url, 'Redirect to correct URL');
ok($resp->header('Set-Cookie'), 'Redirect has cookie header');
like($mech->cookie_jar->as_string(), qr/datapool/,
       'Redirect datapool cookie was accepted, auth succeeded');

$mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2',
  autolint => 0, autocheck => 0);
$mech->requests_redirectable([]);
$resp = $mech->post($surn, { userid=>'BAD', password=>'BAD',
  redirect=>$encoded_redirect_url });
is($mech->status(), Apache2::Const::REDIRECT, 'Redirect to URL, auth failed');
$mech->content_contains($redirect_url, 'Redirect to correct URL, auth failed');
unlike($mech->cookie_jar->as_string(), qr/datapool/,
       'Redirect datapool cookie was not accepted, auth failed');
}

done_testing();

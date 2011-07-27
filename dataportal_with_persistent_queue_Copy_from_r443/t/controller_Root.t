use strict;
use warnings;
use Test::More;
use Apache2::Const q(:common);
use Data::Dumper;

BEGIN { use_ok 'URSA2::Controller::Root' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);

$mech->requests_redirectable([]);
$mech->get('/');
is($mech->status(), Apache2::Const::REDIRECT, 'request to root controller should redirect to ASF API information URL');

done_testing();

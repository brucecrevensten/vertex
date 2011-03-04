use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'Catalyst::Test', 'URSA2' }
BEGIN { use_ok 'URSA2::Controller::services' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

ok( request('/services')->is_success, 'Request should succeed' );

# Auth spec -- 4.1
my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);
$mech->get_ok('/services/version');

done_testing();

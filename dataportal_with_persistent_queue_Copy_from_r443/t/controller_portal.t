use strict;
use warnings;
use Test::More;

BEGIN { use_ok 'Catalyst::Test', 'URSA2' }
BEGIN { use_ok 'URSA2::Controller::portal' }

ok( request('/portal')->is_success, 'Request should succeed' );
done_testing();

use Test::More tests => 3;
use URSA2::Exceptions qw(HttpInternalServerError, DbNoResults);
use URSA2::Exception::Http;
use Apache2::Const q(:http);
use Data::Dumper;

use warnings;
use strict;

use Catalyst::Test 'URSA2';

# We'll not test every specific exception subclass, only those that are different.
# Here, we test a subclass of the Http error subclass.
eval { HttpInternalServerError->throw( error => 'testing throwing ursa2 exception') };
my $e;

if ( $e = Exception::Class->caught('URSA2::Exception::Http') ) {
  is($e->responseCode, Apache2::Const::HTTP_INTERNAL_SERVER_ERROR, 'threw/caught HttpException ok');
  is($e->description, 'An internal server error occurred.', 'verify error description is being passed correctly.');
} else {
  fail('throw/catch failed for HttpException');
}
my ($r,$c) = ctx_request('blahblahblah');
eval {$e->dispatch($c);};
diag(Dumper($@));
is(ref($@), 'Catalyst::Exception::Detach', 'Check for Catalyst::Exception::Detach');
  


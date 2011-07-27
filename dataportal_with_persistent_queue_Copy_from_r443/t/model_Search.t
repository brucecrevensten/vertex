use strict;
use warnings;
use Test::More;
use URSA2;

BEGIN { use_ok 'URSA2::Model::Search' }

eval {
  my $res = URSA2::Model::Search->doQuery('some bad SQL');
};
my $e;
if ( $e = Exception::Class->caught('DbException') ) {
  is( $e->description, 'Database exception occurred.', 'caught DbException for invalid SQL');
} else {
  fail('caught DbException for invalid SQL');
}

done_testing();

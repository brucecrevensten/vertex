use strict;
use warnings;
use Test::More;
use Data::Dumper;
use URSA2::Transformer;

# the idea of this test is to cause a known-bad condition,
# in this case, not providing a proper Catalyst context object,
# and ensuring that we get a Transformer exception in response.
my $e;
my $t = URSA2::Transformer->new();
eval {
  $t->transform;
};

if ( $e = Exception::Class->caught('TransformerError') ) {
  like( $e->description, qr/The XSLT transformer encountered an error/, 'ensure that errors in the Transformer throw a TransformerError exception');
} else {
  fail( 'ensure that errors in the Transformer throw a TransformerError exception');
}
done_testing();

use Test::More skip_all => 'Exception hierarchy is not defined enough for tests to make sense.'; # tests => 3;
use URSA2::Exceptions;
use Data::Dumper;
use URSA2::Exception::Http;


eval { URSA2::Exception->throw( error => 'testing throwing ursa2 exception' ) };
my $e;

# catch
if ( $e = Exception::Class->caught('URSA2_Exception') ) {
  print $e->error, "\n", $e->trace->as_string, "\n";
  print join ' ', $e->euid, $e->egid, $e->uid, $e->gid, $e->pid, $e->time;
} else {
print 'nope';
}

if ( $e = Exception::Class->caught('URSA2::Exception::Http') ) {
  is($e->responseCode, 405, 'threw/caught HttpException ok');
} else {
#  print Dumper($e);
  fail('throw/catch failed for HttpException');
}

# testing a subclassed exception
eval { AuthenticationException->throw() };
if ( $e = Exception::Class->caught('AuthenticationException') ) {
  is(403, $e->responseCode, 'threw/caught AuthenticationException ok');
} else {
  fail('throw/catch failed for AuthenticationException');
}

# testing a variation of a subclassed exception with different internal logging behavior
eval { DatabaseUnavailableException->throw() };
if ( $e = Exception::Class->caught('DatabaseUnavailableException') ) {
  is(403, $e->responseCode, 'threw/caught DatabaseUnavailableException ok');
  # can I easily test for the presence of an item in the Apache logs here?? code reviewer: help?
} else {
  fail('throw/catch failed for DatabaseUnavailableException');
}


use strict;
use warnings;
use Test::More tests => 12;
use HTTP::Request::Common;
use Data::Dumper;
use Apache2::Const qw(:http);
use URSA2::Exceptions qw(InvalidParameter);
use Catalyst::Test 'URSA2';
use JSON;

BEGIN { use_ok 'URSA2::Controller::services' }

use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my $surn = 'services/feedback/param';
my $jurn = 'services/feedback/json';

my $comment = 'TEXT';
my $userid = 'guest';
my $email = 'nowhere@nothing.nil';
my $name = 'Guest';

my $request = qq(
  $surn?comment=$comment&userid=$userid&email=$email&name=$name
);
my ($response, $c) = ctx_request($request);
my $s = URSA2::FeedbackRequest->factory($c->request);
$s->decode();
$s->validate();

is($s->comment, $comment, 'Comment field is accepted.');
is($s->userid, $userid, 'Username field is accepted.');
is($s->email, $email, 'E-mail field is accepted.');
is($s->name, $name, 'Name field is accepted.');
  
my $mech = Test::WWW::Mechanize::Catalyst->new(
  'catalyst_app' => 'URSA2', 'autolint' => 0
);

$mech->post($surn, {'userid' => $userid});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST,
  'PARAM: No comment returns 400');

$mech->post($jurn,
  {'query' => qq({"userid":"$userid"})});
is($mech->status(), Apache2::Const::HTTP_BAD_REQUEST,
  'JSON: No comment returns 400');

#################
# These tests require a DB connection.
# set TEST_DATABASE=1 to run these tests.
################
SKIP: {
  skip 'Skipping tests requiring a database connection.', 4
  unless $ENV{'TEST_DATABASE'};
  $mech->post($surn, { 'comment' => $comment, 'userid' => $userid,
    'email' => $email, 'name' => $name});
  is($mech->status, Apache2::Const::HTTP_OK,
    'PARAM: Accept comment with optional parameters.');

  $mech->post($surn, { 'comment' => $comment });
  is($mech->status, Apache2::Const::HTTP_OK,
    'PARAM: Accept comment with out optional parameters.');

  $mech->post($jurn, {'query' => qq({"comment":"$comment","userid":"$userid","email":"$email","name":"$name"})});
  is($mech->status, Apache2::Const::HTTP_OK,
    'JSON: Accept comment with optional parameters.');
  
  $mech->post($jurn, {'query' => qq({"comment":"$comment"})});
  is($mech->status, Apache2::Const::HTTP_OK,
    'JSON: Accept comment with out optional parameters.');
}

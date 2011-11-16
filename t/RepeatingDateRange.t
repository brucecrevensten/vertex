use strict;
use warnings;
use Test::More;
use HTTP::Request::Common;
use Data::Dumper;
use Apache2::Const q(:http);
use URSA2::SearchRequest;
use Catalyst::Test 'URSA2';
use JSON;
use DateTime;

my $surn = 'services/search/param'; # urn of the service were testing

my $bbox = '-140,60,-135,65';
my @test_ranges = (
    {   desc            => 'mid-year, one month',
        start           => '2010-05-01',
        end             => '2010-05-31',
        repeat_start    => 1995,
        repeat_end      => 2005
    },
    {   desc            => 'mid-year, one week',
        start           => '2010-07-01',
        end             => '2010-07-07',
        repeat_start    => 1995,
        repeat_end      => 2005
    },
    {   desc            => 'start of year, first ten days',
        start           => '2010-01-01',
        end             => '2010-01-10',
        repeat_start    => 1993,
        repeat_end      => 2003
    },
    {   desc            => 'end of year, last ten days',
        start           => '2010-12-21',
        end             => '2010-12-31',
        repeat_start    => 1998,
        repeat_end      => 2011
    },
# not properly supported yet
#    {   desc            => 'end of one year through start of next',
#        start           => '2010-12-25',
#        end             => '2011-01-05',
#        repeat_start    => 2003,
#        repeat_end      => 2006
#    },
# not properly supported yet
#    {   desc            => 'repeating period spans more than a full year',
#        start           => '2010-07-01',
#        end             => '2011-10-01',
#        repeat_start    => 1995,
#        repeat_end      => 2005
#    },
);

BEGIN { use_ok 'URSA2::Controller::services' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);

###### needs DB connections
SKIP: {
  skip 'not testing features requiring a database connection', scalar(@test_ranges) * 2, unless $ENV{TEST_DATABASE};
  
  
  foreach my $p (@test_ranges) {
    $mech->post_ok($surn, { bbox => $bbox, start => $p->{start}, end => $p->{end}, repeat_start => $p->{repeat_start}, repeat_end => $p->{repeat_end}, format => 'csv' });
    my @rows = split/\n/, $mech->content();
    my $all_good = 1;
    foreach my $row (@rows) {
      $row =~ s/^"//;
      $row =~ s/"$//;
      my @row = split('","', $row);
      
      unless($row[11] =~ /start time/i) {
        my $date = DateTime::Format::DateParse->parse_datetime($row[11], 'UTC');
        my $start = DateTime::Format::DateParse->parse_datetime($p->{start}, 'UTC');
        my $end = DateTime::Format::DateParse->parse_datetime($p->{end}, 'UTC');
        unless(
          $date->year >= $p->{repeat_start} and $date->year <= $p->{repeat_end} and   # within range of years
          $date->month >= $start->month and $date->month <= $end->month and           # month is acceptable
          ( $date->month == $start->month ? $date->day >= $start->day : 1 ) and       # if it's in the start or end month, check the day
          ( $date->month == $end->month ? $date->day <= $end->day : 1 )
        ) {
          is('invalid results', 'valid results', 'Repeating date range: ' . $p->{desc} . "\n$p->{start} to $p->{end}, years $p->{repeat_start} to $p->{repeat_end}, got $date");
          $all_good = 0;
          last;
        }
      }
    }
    # 'if' here because if the test failed, it happened above for the purpose of useful output. This test is only here to say nothing else failed.
    if($all_good == 1) { is('valid results', 'valid results', 'Repeating date range: ' . $p->{desc}); }
  }
}

done_testing();

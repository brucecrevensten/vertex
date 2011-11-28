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
  { desc            => 'mid-year, one month, ten years',
    season_start    => 05,
    season_end      => 05,
    repeat_start    => 1996,
    repeat_end      => 2005
  },
  { desc            => 'start of year, one month, five years',
    season_start    => 01,
    season_end      => 01,
    repeat_start    => 2001,
    repeat_end      => 2005
  },
  { desc            => 'mid-year, two months, 2 years',
    season_start    => 05,
    season_end      => 06,
    repeat_start    => 2009,
    repeat_end      => 2010
  },
  { desc            => 'end of year, one month, 5 years',
    season_start    => 12,
    season_end      => 12,
    repeat_start    => 2006,
    repeat_end      => 2010
  },
  { desc            => 'new year, two months, 5 years',
    season_start    => 12,
    season_end      => 01,
    repeat_start    => 1996,
    repeat_end      => 2000
  },
);

BEGIN { use_ok 'URSA2::Controller::services' }
use ok "Test::WWW::Mechanize::Catalyst" => "URSA2";

my $mech = Test::WWW::Mechanize::Catalyst->new(catalyst_app => 'URSA2', autolint => 0);

###### needs DB connections
SKIP: {
  skip 'not testing features requiring a database connection', scalar(@test_ranges) * 2, unless $ENV{TEST_DATABASE};
  
  
  foreach my $p (@test_ranges) {
    $mech->post_ok($surn, { bbox => $bbox, season_start => $p->{season_start}, season_end => $p->{season_end}, repeat_start => $p->{repeat_start}, repeat_end => $p->{repeat_end}, format => 'csv' });
    my @rows = split/\n/, $mech->content();
    my $all_good = 1;
    foreach my $row (@rows) {
      $row =~ s/^"//;
      $row =~ s/"$//;
      my @row = split('","', $row);
      
      unless($row[11] =~ /start time/i) {
        my $date = DateTime::Format::DateParse->parse_datetime($row[11], 'UTC');
        unless(
          $date->year >= $p->{repeat_start} and $date->year <= $p->{repeat_end} and   # within range of years
          $date->month >= $p->{season_start} and $date->month <= $p->{season_end} ) {           # within range of months
          is('invalid results', 'valid results', 'Repeating date range: ' . $p->{desc} . "\n$p->{season_start} to $p->{season_send}, years $p->{repeat_start} to $p->{repeat_end}, got $date");
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

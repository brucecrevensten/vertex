#!/usr/bin/perl

use JavaScript::Minifier qw(minify);
use File::Find;

my $dir = $ARGV[0];

find(\&process_js, $dir);

sub process_js {
  my $file = $_;
  return if $file !~ /\.js$/;
  return if $file =~ /min\.js$/;
  open(IN, "<$file")
    || die "Unable to open $File::Find::name: $!";
  my $min = minify('input' => *IN);
  close(IN);
  open(OUT, ">$file")
    || die "Unable to open $File::Find::name: $!";
  print OUT $min;
  close(OUT);
}

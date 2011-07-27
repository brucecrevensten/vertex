#!/usr/bin/env perl
# IMPORTANT: if you delete this file your app will not work as
# expected.  You have been warned.
use inc::Module::Install;
use Module::Install::Catalyst; # Complain loudly if you don't have
                               # Catalyst::Devel installed or haven't said
                               # 'make dist' to create a standalone tarball.

name 'URSA2';
all_from 'lib/URSA2.pm';

# DO NOT MANAGE PACKAGE DEPENDENCIES IN THIS FILE!
# Instead, manage dependencies in the specfile, we need
# to package RPMs of any perl modules we want.
catalyst;

install_script 'script/ursa2_fastcgi.pl';
WriteAll;

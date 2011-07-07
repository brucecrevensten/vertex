package URSA2;

use strict;
use warnings;

use Moose;
use namespace::autoclean;
use Log::Log4perl::Catalyst;

use Catalyst::Runtime 5.80;

# Set flags and add plugins for the application
#
#         -Debug: activates the debug mode for very useful log messages
#   ConfigLoader: will load the configuration from a Config::General file in the
#                 application's home directory
# Static::Simple: will serve static files from the application's root
#                 directory

use Catalyst qw/
    ConfigLoader
    Static::Simple
/;

extends 'Catalyst';

our $VERSION = 'DEV-VERSION-PLACEHOLDER';

# Configure the application.
#
# Note that settings in ursa2.conf (or other external
# configuration file that you set up manually) take precedence
# over this when using ConfigLoader. Thus configuration
# details given here can function as a default configuration,
# with an external configuration file acting as an override for
# local deployment.

__PACKAGE__->config(
   name => 'URSA2',
   version => $VERSION,
    # Disable deprecated behavior needed by old applications
    disable_component_resolution_regex_fallback => 1,
);

__PACKAGE__->log(Log::Log4perl::Catalyst->new(
  __PACKAGE__->path_to('Log4perl.conf')->stringify
));

# Start the application
__PACKAGE__->setup();

1;

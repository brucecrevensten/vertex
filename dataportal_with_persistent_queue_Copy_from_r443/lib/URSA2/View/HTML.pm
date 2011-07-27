package URSA2::View::HTML;
use URSA2;

use strict;
use warnings;

use base 'Catalyst::View::TT';

__PACKAGE__->config(
    TEMPLATE_EXTENSION => '.tt',
    render_die => 1,
    INCLUDE_PATH => [
      URSA2->path_to( 'root', 'portal' ),
    ],
);

1;

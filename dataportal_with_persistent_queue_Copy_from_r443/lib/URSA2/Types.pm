package URSA2::Types;

use URSA2::Exceptions;

# Declare our custom types here.
use MooseX::Types
  -declare => [qw(
    UserId
    UserPassword
  )];

# import builtin moose types.
use MooseX::Types::Moose qw(Str);

# type definition.

# Password type - Check that it isn't empty.
subtype UserPassword,
  => as Str,
  => where { defined($_) && $_ ne '' },
  => message { 'Password cannot be the empty string.' };

subtype UserId,
  => as Str,
  => where { defined($_) && $_ ne '' },
  => message { 'UserId cannot be the empty string.' };

1;

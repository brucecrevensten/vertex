package URSA2::Exceptions;
use warnings;
use strict;
use URSA2::Exception::Http;

use Exception::Class (

  'DbException' => 
  {
    description => 'Database exception occurred.',
    fields => [ 'error', 'message' ],
  },

  'DbNoResults' => 
  {
    description => 'No results found for the specified criteria',
    HttpCode => 204,
  },

  'UnknownParameter' =>
  {
    description => 'A an unknown parameter was provided',
    HttpCode => 400,
  },

  'InvalidParameter' =>
  {
    description => 'A provided parameter was invalid',
    HttpCode => 400,
    fields => [ 'parameter', 'value', 'message' ],
  },

  'MissingParameter' =>
  {
    description => 'A required parameter was missing',
    HttpCode => 400,
    fields => [ 'parameter', 'message' ],
  },

  'TransformerError' => 
  { 
    description => 'The XSLT transformer encountered an error',
    fields => [ 'message' ],
  },

  'BadMethodException' =>
  {
    description => 'The authentication service requires POST',
    HttpCode => 405,
  },

  'AuthorizationFailed' =>
  {
    HttpCode => 401,
  },

  'SessionException' =>
  {
    description => 'Error creating user session.',
  },

  'CookieException' =>
  {
    description => 'Error creating cookie.',
  }

);

1;

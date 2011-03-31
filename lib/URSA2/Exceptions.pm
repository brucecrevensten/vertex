package URSA2::Exceptions;
use warnings;
use strict;
use URSA2::Exception::Http;
use URSA2::Exception::Http::InternalServerError;
use URSA2::Exception::Http::InvalidParameter;
use URSA2::Exception::Http::MissingParameter;
use URSA2::Exception::Http::BadMethod;
use URSA2::Exception::Http::DbNoResults;
use URSA2::Exception::Http::AuthorizationFailed;
use URSA2::Exception::Http::SessionException;
use URSA2::Exception::Http::CookieException;
use URSA2::Exception::Http::InvalidParameter;
use URSA2::Exception::Http::UnknownParameter;
use URSA2::Exception::Http::DbException;
use URSA2::Exception::Http::TransformerError;


use Exception::Class (

  'Http' =>
  {
    description => 'A http exception.',
    isa => 'URSA2::Exception::Http',
    fields => ['responseCode']
  },

  'HttpInternalServerError' =>
  {
    description => 'An internal server error occurred.',
    isa => 'URSA2::Exception::Http::InternalServerError',
  },

  'DbException' => 
  {
    description => 'Database exception occurred.',
    fields => [ 'error', 'message' ],
    isa => 'URSA2::Exception::Http::DbException',
  },

  'DbNoResults' => 
  {
    description => 'No results found for the specified criteria.',
    isa => 'URSA2::Exception::Http::DbNoResults',
  },

  'UnknownParameter' =>
  {
    description => 'A an unknown parameter was provided',
    isa => 'URSA2::Exception::Http::UnknownParameter',
  },

  'InvalidParameter' =>
  {
    description => 'A provided parameter was invalid',
    isa => 'URSA2::Exception::Http::InvalidParameter',
    fields => [ 'parameter', 'value' ],
  },

  'MissingParameter' =>
  {
    description => 'A required parameter was missing',
    isa => 'URSA2::Exception::Http::MissingParameter',
    fields => [ 'parameter', 'message' ],
  },

  'TransformerError' => 
  { 
    description => 'The XSLT transformer encountered an error',
    fields => [ 'message' ],
    isa => 'URSA2::Exception::Http::TransformerError',
  },

  'BadMethod' =>
  {
    description => 'The authentication service requires POST',
    isa => 'URSA2::Exception::Http::BadMethod',
  },

  'AuthorizationFailed' =>
  {
    description => 'Authorization failed.',
    isa => 'URSA2::Exception::Http::AuthorizationFailed',
  },

  'SessionException' =>
  {
    description => 'Error creating user session.',
    isa => 'URSA2::Exception::Http::SessionException',
  },

  'CookieException' =>
  {
    description => 'Error creating cookie.',
    isa => 'URSA2::Exception::Http::CookieException',
  }

);

1;

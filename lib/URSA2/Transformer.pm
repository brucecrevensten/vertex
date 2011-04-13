package URSA2::Transformer;
use Data::Dumper;
use DateTime;
use DateTime::Format::Strptime;
use URSA2::Exceptions;
use XML::LibXSLT;
use XML::LibXML;

sub new {
  my $class = shift;
  my $self = {};
  bless $self, $class;

  $self->{formats} = {
    metalink => {
      xsl => 'metalink.xsl',
      contentType => 'application/metalink+xml; charset=utf-8',
      fileExtension => 'metalink'
    },
    csv => {
      xsl => 'csv.xsl',
      contentType => 'text/csv; charset=utf-8',
      fileExtension => 'csv'
    },
    raw => {
      xsl => 'raw.xsl',
      contentType => 'text/xml; charset=utf-8',
      fileExtension => 'xml'
    },
    count => {
      xsl => 'count.xsl',
      contentType => 'text/plain; charset=utf-8',
      fileExtension => 'txt'
    },
    list => {
      xsl => 'list.xsl',
      contentType => 'text/plain; charset=utf-8',
      fileExtension => 'txt'
    },
    kml => {
      xsl => 'kml.xsl',
      contentType => 'application/vnd.google-earth.kml+xml; charset=utf-8',
      fileExtension => 'kmz'
    },
    json => {
      xsl => 'xml2json.xslt',
      contentType => 'application/json; charset=utf-8',
      fileExtension => 'json'
    },
    jsonp => {
      xsl => 'xml2json.xslt',
      contentType => 'text/javascript; charset=utf-8',
      fileExtension => 'jsonp'
    }

  };

  return $self;
}

sub transform {

  my ($self, $c) = @_;
  $self->validateFormat();
  $self->formatResultsAsXml();
  
  my $parser = XML::LibXML->new();
  my $xslt = XML::LibXSLT->new();

  eval {

    $dom = $parser->parse_string( $self->{xml} );
    my $xsl = $c->path_to( 'doc', 'xslt', $self->{formats}->{$self->{format}}->{xsl} );
    my $xslPath = $xsl->stringify;
    my $style_doc = $parser->parse_file( $xslPath );
    my $stylesheet = $xslt->parse_stylesheet($style_doc);

    if ( undef == $stylesheet ) {
      TransformerError->throw( message => 'XSLT transformation was not valid for '.$xslPath );
    }
    my $results = $stylesheet->transform($dom);

    $self->{output} = $stylesheet->output_string($results);
  };
  if ($@) {
    TransformerError->throw( message => $@ );
  }
}

sub getFilename {
  my $self = shift;
  my $formatter = DateTime::Format::Strptime->new(
    pattern => '%F_%H-%M-%S'
  );
  my $now = DateTime->now( formatter=>$formatter );
  return 'asf-datapool-results-'.$now.'.'.$self->{formats}->{$self->{format}}->{fileExtension};
}

sub formatResultsAsXml {
  my $self = shift;

  my $x = '<?xml version="1.0" encoding="utf-8" ?><results><resultsDate>'
    . localtime()
    . '</resultsDate><rows>';

  foreach $result ( $self->{results} ) {
    foreach $row ( @{$result} ) {
      $x = join("\n", $x, $row->[0]);
    }
  }

  $self->{xml} = $x.'</rows></results>';

}

sub getOutput {
  my $self = shift;
  return $self->{output};
}

sub getContentType {
  my $self = shift;
  return $self->{formats}->{$self->{format}}->{contentType};
}

sub validateFormat {
  my $self = shift;
  if( defined( $self->{format} ) && exists $self->{formats}->{$self->{format}} ) {
    return; # ok
  } else {
    # default format is metalink
    $self->{format} = 'metalink';
  }
}

1;

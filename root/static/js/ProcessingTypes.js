var ProcessingType = Backbone.Model.extend({});
var ProcessingTypes = Backbone.Collection.extend({
  model: ProcessingType
});

var processingTypes = new ProcessingTypes(
    [
     {'level': 'L0', 'id': 'L1.0', 'display': 'Level 1.0', 'description': 'Reconstructed, unprocessed signal data with radiometric- and geometric-correction coefficients appended but not applied.'},
     {'level': 'L1', 'id': 'L1.1', 'display': 'Level 1.1', 'description': 'Single Look Complex products provided in slant range geometry and compressed in range and azimuth. Individual files are provided for each polarization for multi-polarization modes.'},
     {'level': 'L1', 'id': 'L1.5', 'display': 'Level 1.5', 'description': 'Multi-look processed images projected onto map coordinates. Data can be processed either geo-referenced or geo-coded. Individual files are provided for each polarization for multi-polarization modes.'},
     {'level': 'L1', 'id': 'BROWSE', 'display': 'Browse Image', 'description': 'Full size browse image.'},
     {'level': 'L1', 'id': 'BROWSE512', 'display': 'Browse Image (512x512px)', 'description': '512 x 512 pixel browse image.'},
     {'level': 'L1', 'id': 'THUMBNAIL', 'display': 'Thumbnail', 'description': 'Thumbnail image.'},
     {'level': 'L0', 'id': 'L0', 'display': 'Level Zero', 'description': 'Raw signal SAR data processed into frames with an accompanying CEOS format leader file.'},
     {'level': 'L1', 'id': 'L1', 'display': 'Level One Image', 'description': 'Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.'},
     {'level': 'L1', 'id': 'STOKES', 'display': 'Compressed Stokes Matrix', 'description': 'AIRSAR compressed Stokes matrix formatted data for software compatibility (http://airsar.jpl.nasa.gov/data/data_format.pdf). 10 bytes per pixel.'},
     {'level': 'L1', 'id': 'COMPLEX', 'display': 'Multi-look Complex', 'description': 'Calibrated multi-look data, cross products, floating point format, three files 8 bytes per pixel, three files 4 bytes per pixel, little endian.'},
     {'level': 'L1', 'id': 'PROJECTED', 'display': 'Ground Projected', 'description': 'Calibrated complex data, cross products projected to the ground in simple geographic coordinates (latitude, longitude). There is a fixed number of looks for each pixel. Floating point, little endian, 8 or 4 bytes per pixel.'},
     {'level': 'METADATA', 'id': 'METADATA', 'display': 'Annotation file / Metadata', 'description': 'Text file containing metadata.'},
     {'level': 'L1', 'id': 'KMZ', 'display': 'Google Earth KMZ', 'description': 'Compressed KML file for viewing a representation of the file in Google Earth or similar software.'}
    ]
    );

var AsfPlatformConfig = {
    platform: ["UA","A3","R1","E1","E2","J1","AS"], // keep order the same as platformTypes here!
    platformTypes: {
      // value : display name -- order is respected, here
      "UA" : "UAVSAR",
      "A3" : "ALOS PALSAR",
      "R1" : "RADARSAT-1",
      "E1" : "ERS-1",
      "E2" : "ERS-2",
      "J1" : "JERS-1",
      "AS" : "AIRSAR"
    },

    platformInformation: {
      'AS' : {
        name: "AIRSAR",
        imageUrl: "static/images/airsar.jpg",
        launchDate: "1988",
        altitude: "8 km typical",
        cycle: "Non-cyclic",
        status: "Out of service, 2004",
        website: "http://airsar.jpl.nasa.gov/",
        description: "The AIRSAR instrument was mounted aboard a modified NASA DC-8 aircraft. AIRSAR was an all-weather imaging tool able to penetrate through clouds and collect data at night. The longer wavelengths could also penetrate into the forest canopy and in extremely dry areas, through thin sand cover and dry snow pack.<br/><br/>AIRSAR served as a NASA radar technology testbed for demonstrating new radar technology and acquiring data for the development of radar processing techniques and applications.",
        dataDescription: "AIRSAR data are unrestricted and available as JPL pre-processed products through Vertex <br/><br/>AIRSAR data are grouped into three operational modes and have been packaged according to relevant file types ",
        processingType1: "POLSAR Mode: Fully polarimetric AIRSAR data acquired at all three frequencies in P-, L-, C-band  40 Mhz or 20 Mhz. The L-band also provides 80 MHz bandwidth data.<br/>* C-, L- and P-band Compressed Stokes Matrix (SLC) file packages<br/>* 3-Frequency Polarimetry file packages",
        processingType2: "TOPSAR Mode: TOPSAR mode is interferometric AIRSAR data collected using C- and L-band vertically-displaced antenna pairs to produce digital elevation models (DEMs). The radars which are not being used for interferometry collect quad-pol data co-registered with the C-band DEM. Interferometric data can be collected in \"ping-pong\" mode, where each antenna is used alternately to transmit and the effective baseline is doubled, and in \"common-transmitter\" mode where only one antenna is used to transmit.<br/>* C-, L- and P-band Compressed Stokes Matrix (SLC) file packages<br/>* C-, L- and P-band TIF file packages<br/>* TopSAR DEM file packages",
        processingType3: "Along-Track Interferometry (ATI) Mode: ATI mode data can be used to measure velocities of moving targets. Two pairs of antennas, one C-band and one L-band, separated along the body of the plane, were used to collect ATI data.<br/>* Along-Track Interferometry file packages<br/>* Along-Track Interferometry JPGs",
        processingFooter: ' '
        },
      'A3': {
        name: "ALOS",
        imageUrl: "static/images/alos.png",
        launchDate: "24 Jan 2006",
        altitude: "700 km",
        cycle: "46 Days",
        status: "Out of Service April 22, 2011",
        website: "http://www.jaxa.jp/projects/sat/alos/index_e.html",
        description: "Japan launched ALOS (Advanced Land Observing Satellite) in January 2006, aboard an H2-A rocket. The 4000-kilogram satellite, renamed Daichi, was placed in a near-polar orbit. ALOS remote-sensing equipment enables precise land coverage observation and can collect enough data by itself for mapping on a scale of 25,000:1, without relying on points of reference on the ground. Some of its objectives are cartography, disaster monitoring, natural resource surveys and technology development.",
        dataDescription: "ALOS PALSAR data are available from the SDC for US researchers with an approved ALOS PALSAR Proposal. ALOS PALSAR at the SDC is focused on North, South and Central America but global data are available.<br/><br/>PALSAR data are available as:",
        processingType1: "Level 1.0: Reconstructed, unprocessed signal data with radiometric- and geometric-correction coefficients appended but not applied.",
        processingType2: "Level 1.1: Single Look Complex products provided in slant range geometry and compressed in range and azimuth. Individual files are provided for each polarization for multi-polarization modes.",
        processingType3: "Level 1.5: Multi-look processed images projected onto map coordinates. Data can be processed either geo-referenced or geo-coded. Individual files are provided for each polarization for multi-polarization modes.",
        processingFooter: 'PALSAR data are provided in CEOS format. More detailed product descriptions are available from the <a href="http://www.eorc.jaxa.jp/ALOS/en/doc/format.htm">JAXA website</a>.'
      },
      'E1': {
        name: "ERS-1",
        imageUrl: "static/images/ers1.png",
        launchDate: "17 Jan 1991",
        altitude: "785 km",
        cycle: "35 Days",
        status: "Out of Service March 2000",
        website: "http://earth.esa.int/ers/",
        description: "ERS-1 (European Remote Sensing) was a European Space Agency (ESA) satellite for remote sensing from a polar orbit. The 2400 kilogram satellite was inserted into a sun-synchronous polar orbit by an Ariane 4 launcher. The primary mission of ERS-1 was to perform remote sensing of the Earth's oceans, ice caps, and coastal regions.<br/><br/>The satellite provided systematic, repetitive global measurements of wind speed and direction, wave height, surface temperatures, surface altitude, cloud cover, and atmospheric water vapor levels.",
        dataDescription: 'Archived ERS-1 SAR data are available from the ASF SAR Data center for the regions covered by the ASF STGS station mask and the McMurdo station mask. Anyone may search the SDC archive using this interface. However, ERS-1 data are considered restricted data and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to receive the data.<br/><br/>ERS-1 data are available at three different processing levels.',
        processingType1: "Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.",
        processingType2: "Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.",
        processingType3: "Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.",
        processingFooter: ''
      },
      'E2': {
        name: "ERS-2",
        imageUrl: "static/images/ers2.png",
        launchDate: "20 April 1995",
        altitude: "783 km",
        cycle: "35 Days",
        status: "In Service",
        website: "http://earth.esa.int/ers/",
        description: 'ERS-2 (European Remote Sensing) is a European Space Agency (ESA) satellite for remote sensing from a polar orbit. The 2500 kilogram satellite provides global and repetitive observations of the environment using techniques which allow imaging in all weather conditions. The ERS-2 satellite is essentially the same as ERS-1 except that it includes a number of enhancements and it is carrying a new payload instrument to measure the chemical composition of the atmosphere, named the Global Ozone Monitoring Experiment (GOME). ',
        dataDescription: 'Archived ERS-2 SAR data are available from the ASF SAR Data center for the regions covered by the ASF STGS station mask and the McMurdo station mask. Anyone may search the SDC archive using this interface. However, ERS-2 data are considered restricted data and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to receive the data.<br/><br/>ERS-2 data are available at three different processing levels.',
        processingType1: 'Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.',
        processingType2: 'Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.',
        processingType3: 'Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.',
        processingFooter: ''
       },
      'J1': {
        name: "JERS-1",
        imageUrl: "static/images/jers1.png",
        launchDate: "11 Feb 1992",
        altitude: "565&ndash;580 km",
        cycle: "44 Days",
        status: "Out of Service Oct 1998",
        website: "http://www.eorc.jaxa.jp/JERS-1/en/index.html",
        description: 'JERS-1 (Japanese Earth Resources Satellite) was launched by the Japan Aerospace Exploration Agency (JAXA) aboard a Japanese H-1 launcher, to provide global and repetitive observations of the environment using techniques which allow imaging to take place in all weather conditions. Its primary objective was gathering data on global land masses while conducting observation for land surveys, agricultural-forestry-fisheries, environmental protection, disaster prevention and coastal surveillance.',
        dataDescription: 'Archived JERS-1 SAR data are available from the ASF SAR Data and coverage is global. Anyone may search the SDC archive using this interface. However, JERS-1 data are considered restricted data and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to receive the data.<br/><br/>JERS-1 data are available at three different processing levels.',
        processingType1: 'Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.',
        processingType2: 'Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.',
        processingType3: 'Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.',
        processingFooter: ''
       },
      'R1': {
        name: "RADARSAT-1",
        imageUrl: "static/images/radarsat-1.png",
        launchDate: "4 Nov 1995",
        altitude: "798 km (793-821 km)",
        cycle: "24 Days (343 orbits)",
        status: "In Service (SDC archive ends May 2008)",
        website: "http://www.asc-csa.gc.ca/eng/satellites/radarsat1/",
        description: 'RADARSAT-1 is an advanced Earth observation satellite developed by the Canadian Space Agency (CSA) to monitor environmental change and to support resource sustainability. NASA launched RADARSAT-1 aboard a Delta-II rocket in exchange for access to the satellite on a pro rata basis through the Alaska Satellite Facility (ASF).<br/><br/>At the heart of RADARSAT-1 is an advanced radar sensor called Synthetic Aperture Radar (SAR). SAR is a microwave instrument, which sends pulsed signals to the Earth and processes the received reflected pulses. SAR operates day or night, regardless of weather conditions. RADARSAT-1 was placed into a sun-synchronous polar orbit in order to provide global coverage. Research emphasis will be on the Polar Regions, though onboard tape recorders will allow imaging of any region, worldwide.',
        dataDescription: 'RADARSAT-1 data at the SDC is global in nature but only includes data acquired prior to May 3, 2008. Anyone may search the SDC archive using this interface for RADARSAT-1 data. However, most RADARSAT-1 data considered restricted and a <a href="http://www.asf.alaska.edu/program/sdc/proposals">short proposal</a> is required to access the data.<br/><br/>RADARSAT-1 data are available at three different processing levels.',
        processingType1: 'Level Zero: Raw signal data that requires SAR processing before it can be visualized. Data can be received as a swath product in SKY telemetry format or subdivided into frames with an accompanying CEOS format leader file.',
        processingType2: 'Single Look Complex (SLC): Processed SAR data that contains both amplitude and phase information. The data is not multilooked and to be visualized must be further processed to an amplitude image.',
        processingType3: 'Detected Image: Fully processed SAR data which only contains the amplitude information. Image does not require any further SAR processing to be visualized.',
        processingFooter: ''
       },
      'UA': {
        name: 'UAVSAR Uninhabited Aerial Vehicle Synthetic Aperture Radar',
        imageUrl: 'static/images/uavsar.png',
        launchDate: '18 Sept 2007',
        altitude: 'Variable',
        cycle: 'Non-cyclic',
        status: 'In Service',
        website: 'http://uavsar.jpl.nasa.gov/',
        description: 'Uninhabited Aerial Vehicle Synthetic Aperture Radar: UAVSAR, a Jet Propulsion Laboratory (JPL)-built reconfigurable, polarimetric L-band synthetic aperture radar (SAR), is specifically designed to acquire airborne repeat track SAR data for differential interferometric measurements.<br/><br/>The radar is designed to be operable on a UAV (Uninhabited Aerial Vehicle), but will initially be demonstrated on a on a NASA Gulfstream III. The radar is fully polarimetric, with a range bandwidth of 80 MHz (2 m range resolution), and a range swath greater than 16 km.<br/><br/>More information is available at the <a href="http://uavsar.jpl.nasa.gov/">JPL UAVSAR Website</a>.',
        dataDescription: 'UAVSAR data are processed at JPL and are freely available from the SDC. UAVSAR data are available for immediate download using the this interface.<br/><br/>UAVSAR data are provided as Polarimetric Products.',
        processingType1: 'SLC files (.slc): Calibrated single look complex files for each polarization (HH, HV, VH, and VV), floating point format, little endian, 8 bytes per pixel, corresponding to the scattering matrix.',
        processingType2: 'MLC files (.mlc): Calibrated multi-looked cross products, floating point format, three files 8 bytes per pixel, three files 4 bytes per pixel, little endian. ',
        processingType3: 'Compressed Stokes Matrix product (.dat): AIRSAR compressed Stokes matrix format for software compatibility (http://airsar.jpl.nasa.gov/data/data_format.pdf). 10 bytes per pixel.',
        processingType4: 'Ground projected files (.grd): calibrated complex cross products projected to the ground in simple geographic coordinates (latitude, longitude). There is a fixed number of looks for each pixel. Floating point, little endian, 8 or 4 bytes per pixel.',
        processingType5: 'Hgt file: the DEM that the imagery was projected to, in the same geographic coordinates as the ground projected files. Floating point (4 bytes per pixel), little endian, ground elevation in meters.',
        processingType6: 'Annotation file (.ann) : a text file with metadata.',
        processingFooter: ''
      }
    }
};

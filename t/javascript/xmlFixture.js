
//http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?SERVICE=WCS&VERSION=1.0.0&REQUEST=DescribeCoverage
var australia_coverage = 
'<?xml version='+"'1.0'"+' encoding="ISO-8859-1" ?> \
<CoverageDescription \
   version="1.0.0"  \
   updateSequence="0" \
   xmlns="http://www.opengis.net/wcs" \
   xmlns:xlink="http://www.w3.org/1999/xlink" \
   xmlns:gml="http://www.opengis.net/gml" \
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
   xsi:schemaLocation="http://www.opengis.net/wcs http://schemas.opengis.net/wcs/1.0.0/describeCoverage.xsd">\
  <CoverageOffering>\
  <name>northern_australia</name>\
  <label>northern_australia</label>\
    <lonLatEnvelope srsName="urn:ogc:def:crs:OGC:1.3:CRS84">\
      <gml:pos>121.00088135454 -19.99984094179</gml:pos>\
      <gml:pos>147.501182236066 -9.99937503771669</gml:pos>\
    </lonLatEnvelope>\
    <domainSet>\
      <spatialDomain>\
        <gml:Envelope srsName="EPSG:4326">\
          <gml:pos>121.00088135454 -19.99984094179</gml:pos>\
          <gml:pos>147.501182236066 -9.99937503771669</gml:pos>\
        </gml:Envelope>\
        <gml:Envelope srsName="EPSG:4326">\
          <gml:pos>14016976.8661937 -2258404.91794904</gml:pos>\
          <gml:pos>16966976.8661937 -1111404.91794904</gml:pos>\
        </gml:Envelope>\
        <gml:RectifiedGrid dimension="2">\
          <gml:limits>\
            <gml:GridEnvelope>\
              <gml:low>0 0</gml:low>\
              <gml:high>29499 11469</gml:high>\
            </gml:GridEnvelope>\
          </gml:limits>\
          <gml:axisName>x</gml:axisName>\
          <gml:axisName>y</gml:axisName>\
          <gml:origin>\
            <gml:pos>14016976.8661937 -1111404.91794904</gml:pos>\
          </gml:origin>\
          <gml:offsetVector>100 0</gml:offsetVector>\
          <gml:offsetVector>0 -100</gml:offsetVector>\
        </gml:RectifiedGrid>\
      </spatialDomain>\
    </domainSet>\
    <rangeSet>\
      <RangeSet>\
        <name>Range 1</name>\
        <label>My Label</label>\
      </RangeSet>\
    </rangeSet>\
    <supportedCRSs>\
      <requestResponseCRSs>EPSG:4326</requestResponseCRSs>\
      <nativeCRSs>EPSG:4326</nativeCRSs>\
    </supportedCRSs>\
    <supportedFormats>\
      <formats>GTiff</formats>\
    </supportedFormats>\
    <supportedInterpolations default="nearest neighbor">\
      <interpolationMethod>nearest neighbor</interpolationMethod>\
      <interpolationMethod>bilinear</interpolationMethod>\
    </supportedInterpolations>\
  </CoverageOffering>\
</CoverageDescription>';


//http://mapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCapabilities
var australia_capabilities = '<?xml version='+"'1.0'"+' encoding="ISO-8859-1" standalone="no" ?>\
<WCS_Capabilities\
   version="1.0.0" \
   updateSequence="0" \
   xmlns="http://www.opengis.net/wcs" \
   xmlns:xlink="http://www.w3.org/1999/xlink" \
   xmlns:gml="http://www.opengis.net/gml" \
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\
   xsi:schemaLocation="http://www.opengis.net/wcs http://schemas.opengis.net/wcs/1.0.0/wcsCapabilities.xsd">\
<Service>\
  <description>JERS-1 Global Rain Forest Mapping Project Northern Australia (October - November 1996)</description>\
  <name>MapServer WCS</name>\
  <label>JERS-1 SAR Northern Australia</label>\
  <fees>NONE</fees>\
  <accessConstraints>\
    NONE\
  </accessConstraints>\
</Service>\
<Capability>\
  <Request>\
    <GetCapabilities>\
      <DCPType>\
        <HTTP>\
          <Get><OnlineResource xlink:type="simple" xlink:href="http://testmapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?" /></Get>\
        </HTTP>\
      </DCPType>\
      <DCPType>\
        <HTTP>\
          <Post><OnlineResource xlink:type="simple" xlink:href="http://testmapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?" /></Post>\
        </HTTP>\
      </DCPType>\
    </GetCapabilities>\
    <DescribeCoverage>\
      <DCPType>\
        <HTTP>\
          <Get><OnlineResource xlink:type="simple" xlink:href="http://testmapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?" /></Get>\
        </HTTP>\
      </DCPType>\
      <DCPType>\
        <HTTP>\
          <Post><OnlineResource xlink:type="simple" xlink:href="http://testmapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?" /></Post>\
        </HTTP>\
      </DCPType>\
    </DescribeCoverage>\
    <GetCoverage>\
      <DCPType>\
        <HTTP>\
          <Get><OnlineResource xlink:type="simple" xlink:href="http://testmapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?" /></Get>\
        </HTTP>\
      </DCPType>\
      <DCPType>\
        <HTTP>\
          <Post><OnlineResource xlink:type="simple" xlink:href="http://testmapserver.daac.asf.alaska.edu/wcs/GRFMP/australia?" /></Post>\
        </HTTP>\
      </DCPType>\
    </GetCoverage>\
  </Request>\
  <Exception>\
    <Format>application/vnd.ogc.se_xml</Format>\
  </Exception>\
</Capability>\
<ContentMetadata>\
  <CoverageOfferingBrief>\
    <name>northern_australia</name>\
    <label>northern_australia</label>\
    <lonLatEnvelope srsName="urn:ogc:def:crs:OGC:1.3:CRS84">\
      <gml:pos>121.00088135454 -19.99984094179</gml:pos>\
      <gml:pos>147.501182236066 -9.99937503771669</gml:pos>\
    </lonLatEnvelope>\
  </CoverageOfferingBrief>\
</ContentMetadata>\
</WCS_Capabilities>';





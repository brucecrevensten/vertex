<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes" version="1.0" encoding="UTF-8" standalone="yes" cdata-section-elements="description" />
  <xsl:template match="/">
    <kml xmlns="http://www.opengis.net/kml/2.2">
      <Document>
        <name>ASF Datapool Search Results</name>
        <description>Search Performed: <xsl:value-of select="results/resultsDate" /></description>
        <Style id="yellowLineGreenPoly">
          <LineStyle>
            <color>30ff8800</color>
            <width>4</width>
          </LineStyle>
          <PolyStyle>
            <color>7f00ff00</color>
          </PolyStyle>
        </Style>
        <xsl:for-each select="results/rows/ROW">
          <Placemark>
            <name><xsl:value-of select="GRANULENAME"/></name>
            <description>
              <xsl:text disable-output-escaping="yes"><![CDATA[ <![CDATA[  ]]></xsl:text>
              <h1><xsl:value-of select="PLATFORM" /> (<xsl:value-of select="BEAMMODEDESC" />), acquired <xsl:value-of select="ACQUISITIONDATE" /></h1>
              <h2><xsl:value-of select="URL"/></h2>
              <h3>Metadata</h3>
              <ul>
                <li>Processing type: <xsl:value-of select="PROCESSINGTYPE" /></li>
                <li>Frame: <xsl:value-of select="FRAMENUMBER" /></li>
                <li>Path: <xsl:value-of select="PATHNUMBER" /></li>
                <li>Orbit: <xsl:value-of select="ORBIT" /></li>
                <li>Start time: <xsl:value-of select="STARTTIME" /></li>
                <li>End time: <xsl:value-of select="ENDTIME" /></li>
                <li>Faraday Rotation: <xsl:value-of select="FARADAYROTATION" /></li>
                <li>Ascending/Descending: <xsl:value-of select="ASCENDINGDESCENDING" /></li>
                <li>Off Nadir Angle: <xsl:value-of select="OFFNADIRANGLE" /></li>
              </ul>
            </description>
            <styleUrl>#yellowLineGreenPoly</styleUrl>
            <Polygon>
              <extrude>1</extrude>
              <altitudeMode>relativeToGround</altitudeMode>
              <outerBoundaryIs>
                <LinearRing>
                  <coordinates><xsl:value-of select="NEARSTARTLON"/>,<xsl:value-of select="NEARSTARTLAT"/>,2000
                    <xsl:value-of select="NEARENDLON"/>,<xsl:value-of select="NEARENDLAT"/>,2000
                    <xsl:value-of select="FARENDLON"/>,<xsl:value-of select="FARENDLAT"/>,2000
                    <xsl:value-of select="FARSTARTLON"/>,<xsl:value-of select="FARSTARTLAT"/>,2000
                    <xsl:value-of select="NEARSTARTLON"/>,<xsl:value-of select="NEARSTARTLAT"/>,2000
                  </coordinates>
                </LinearRing>
              </outerBoundaryIs>
            </Polygon>
          </Placemark>
        </xsl:for-each>
      </Document>
    </kml>
  </xsl:template>
</xsl:stylesheet>

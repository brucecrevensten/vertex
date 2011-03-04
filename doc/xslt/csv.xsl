<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="text" encoding="utf-8"/>

  <xsl:param name="delim" select="string(',')" />
  <xsl:param name="quote" select="string('&quot;')" />
  <xsl:param name="break" select="string('&#10;')" />


  <xsl:template match="/">
    <xsl:text>"Granule Name","Platform","Sensor","Beam Mode","Beam Mode Description","Orbit","Path Number","Frame Number","Acquisition Date","Processing Date","Processing Level","Start Time","End Time","Center Lat","Center Lon","Near Start Lat","Near Start Lon","Far Start Lat","Far Start Lon","Near End Lat","Near End Lon","Far End Lat","Far End Lon","Faraday Rotation","Ascending or Descending?","URL","Size (MB)","Off Nadir Angle",</xsl:text>
    <xsl:value-of select="$break" />
    <xsl:apply-templates select="rows/ROW" />
  </xsl:template>

  <xsl:template match="ROW">
    <xsl:apply-templates />
    <xsl:if test="following-sibling::*">
      <xsl:value-of select="$break" />
    </xsl:if>
  </xsl:template>

  <xsl:template match="GRANULENAME|PLATFORM|SENSOR|BEAMMODETYPE|BEAMMODEDESC|ORBIT|PATHNUMBER|FRAMENUMBER|ACQUISITIONDATE|PROCESSINGDATE|PROCESSINGTYPE|STARTTIME|ENDTIME|CENTERLAT|CENTERLON|NEARSTARTLAT|NEARSTARTLON|NEARENDLAT|NEARENDLON|FARSTARTLAT|FARSTARTLON|FARENDLAT|FARENDLON|FARADAYROTATION|ASCENDINGDESCENDING|URL|FILESIZE|OFFNADIRANGLE">
    <xsl:value-of select="concat($quote, normalize-space(.), $quote)" />
    <xsl:if test="following-sibling::*">
      <xsl:value-of select="$delim" />
    </xsl:if>
  </xsl:template>

  <xsl:template match="text()" />
</xsl:stylesheet>

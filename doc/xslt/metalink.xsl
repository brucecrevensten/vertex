<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:template match="/">
    <metalink version="3.0" xmlns="http://www.metalinker.org/">
      <publisher>
        <name>Alaska Satellite Facility</name>
        <url>http://www.asf.alaska.edu/</url>
      </publisher>
      <files>
      <xsl:for-each select="results/rows/ROW">
        <file>
          <xsl:attribute name="name">
            <xsl:value-of select="FILENAME" />
          </xsl:attribute>
          <resources>
            <url type="http"><xsl:value-of select="URL"/></url>
          </resources>
          <verification>
            <hash type="md5"><xsl:value-of select="MD5SUM"/></hash>
          </verification>
          <size><xsl:value-of select="BYTES"/></size>
        </file>
      </xsl:for-each>
    </files>
    </metalink>
  </xsl:template>

</xsl:stylesheet>

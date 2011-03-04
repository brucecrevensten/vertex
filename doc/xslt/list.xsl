<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

  <xsl:output method="text" encoding="utf-8"/>
  <xsl:param name="delim" select="string(',')" />

  <xsl:template match="/">
    <xsl:apply-templates select="rows/ROW" />
  </xsl:template>

  <xsl:template match="ROW">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="GRANULENAME">
    <xsl:value-of select="." />
    <xsl:value-of select="$delim" />
  </xsl:template>

  <xsl:template match="text()" />
</xsl:stylesheet>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ccts="urn:un:unece:uncefact:documentation:2" xmlns:clm54217="urn:un:unece:uncefact:codelist:specification:54217:2001" xmlns:clm5639="urn:un:unece:uncefact:codelist:specification:5639:1988" xmlns:clm66411="urn:un:unece:uncefact:codelist:specification:66411:2001" xmlns:clmIANAMIMEMediaType="urn:un:unece:uncefact:codelist:specification:IANAMIMEMediaType:2003" xmlns:fn="http://www.w3.org/2005/xpath-functions" xmlns:link="http://www.xbrl.org/2003/linkbase" xmlns:n1="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:qdt="urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2" xmlns:udt="urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2" xmlns:xbrldi="http://xbrl.org/2006/xbrldi" xmlns:xbrli="http://www.xbrl.org/2003/instance" xmlns:xdt="http://www.w3.org/2005/xpath-datatypes" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" exclude-result-prefixes="cac cbc ccts clm54217 clm5639 clm66411 clmIANAMIMEMediaType fn link n1 qdt udt xbrldi xbrli xdt xlink xs xsd xsi">
  
  <xsl:decimal-format name="european" decimal-separator="," grouping-separator="." NaN="" />
  <xsl:output version="4.0" method="html" indent="no" encoding="UTF-8" doctype-public="-//W3C//DTD HTML 4.01 Transitional//EN" doctype-system="http://www.w3.org/TR/html4/loose.dtd" />
  <xsl:param name="SV_OutputFormat" select="'HTML'" />
  <xsl:variable name="XML" select="/" />
  <xsl:template match="/">
    
  
    <html class="invoicehtml">
      <!-- Custom XSLT Created By Mikro Yazılım -->
      <!-- /////////////////////MİKRO///////////////////////////// -->
      <head>
        <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
        <!-- /////////////////////MİKRO///////////////////////////// -->
        <!-- Tasarımın CSS kodları burada bulunuyor -->
        <xsl:choose>
        <xsl:when test="n1:Invoice/cbc:InvoiceTypeCode = 'SGK'">
  <style type="text/css">
      body {
      background-color: #FFFFFF;
      font-family: 'Tahoma', "Times New Roman", Times, serif;
      font-size: 11px;
      color: black;
      }
      h1, h2 {
      padding-bottom: 3px;
      padding-top: 3px;
      margin-bottom: 5px;
      text-transform: uppercase;
      font-family: Arial, Helvetica, sans-serif;
      }
      h1 {
      font-size: 1.4em;
      text-transform:none;
      }
      h2 {
      font-size: 1em;
      color: brown;
      }
      h3 {
      font-size: 1em;
      color: #333333;
      text-align: justify;
      margin: 0;
      padding: 0;
      }
      h4 {
      font-size: 1.1em;
      font-style: bold;
      font-family: Arial, Helvetica, sans-serif;
      color: #000000;
      margin: 0;
      padding: 0;
      }
      hr {
      height:1px;
      color: #000000;
      background-color: #000000;
      border-bottom: 1px solid #000000;
      }
      p, ul, ol {
      margin-top: 1.5em;
      }
      ul, ol {
      margin-left: 0em;
      }
      blockquote {
      margin-left: 3em;
      margin-right: 3em;
      font-style: italic;
      }
      a {
      text-decoration: none;
      color: #70A300;
      }
      a:hover {
      border: none;
      color: #70A300;
      }
      #despatchTable {
      border-collapse:collapse;
      font-size:11px;
      border-color:gray;
      border-style:solid;
      }
      #despatchTable Td{
      border-collapse:collapse;
      font-size:11px;
      border-color:silver;
      border-style:solid;
      padding-left:4px;
      }
      #ettnTable {
      border-collapse:collapse;
      font-size:11px;
      border-color:gray;
      }
      #customerPartyTable {
      border-width: 0px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      background-color:
      }
      #customerIDTable {
      border-width: 1px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      background-color:
      }
      #customerIDTable Td {
      border-width: 0px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      padding-left:4px;
      background-color:
      }
      #lineTable {
      border-width:1px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      background-color:;
      }
      #lineTableHead {
      border-width: 1px;
      padding: 1px;
      border-style: solid;
      border-color: White;
      background-color: gray;
      border-collapse: collapse;
      color:white;
      }
      #lineTableTd {
      border-width: 1px;
      padding: 1px;
      border-style: solid;
      border-color: gray;
      background-color: white;
      border-collapse: collapse;
      }
      #lineTableTr {
      border-width: 1px;
      padding: 0px;
      border-style: solid;
      border-color: gray;
      background-color: white;
      border-collapse: collapse;
      -moz-border-radius:;
      }
      #lineTableDummyTd {
      border-width: 1px;
      border-color:white;
      padding: 1px;
      border-style: solid;
      border-color: gray;
      background-color: white;
      border-collapse: collapse;
      }
      #lineTableBudgetTd {
      border-width: 1px;
      border-spacing: 0px;
      padding-right: 4px;
      border-style: solid;
      border-color: gray;
      background-color: white;
      align:right;
      border-collapse: collapse;
      -moz-border-radius:;
    
      }
      #notesTable {
      border-width: 0px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      background-color:
      }
      #notesTable Td {
      border-width: 0px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      padding-left:4px;
      background-color:
      }
      table {
      border-spacing:0px;
      }
      #budgetContainerTable {
      border-width: 0px;
      border-spacing: 0px;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      background-color:;
      }
      #bankalarTable {
      border-width: 1px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      background-color:
      }
      #bankalarTable Td {
      border-width:1px;
      border-spacing:;
      border-style: solid;
      border-color: gray;
      border-collapse: collapse;
      padding-left:3px;
      background-color:
      }
      #notesTableNotBorder {
      border-width: 0px;
      border-spacing:;
      border-style: solid;
      border-color: black;
      border-collapse: collapse;
      background-color:
      }
      td {
      border-color:gray;
      }
  </style>
  </xsl:when>
  <xsl:otherwise>
      <style type="text/css">
          .sayfa .stockcode{display:show}#stockcode{display:show}.sayfa .invoicecustomization{display:show}.sayfa .invoiceinvoicetype{display:show}.sayfa .invoiceprofile{display:show}#invoiceqrcode{display:show; text-align:right;}.sayfa .invoiceproductinvoiceorderno{display:show}#invoiceproductinvoiceorderno{display:show}.sayfa .invoicetaxkdv{display:show}.sayfa #brandname{display:none}.sayfa .brandname{display:none}.sayfa .invoiceiskonto{display:show}#invoiceiskonto{display:show}.sayfa .satiraciklama{display:none}.sayfa .faturanotu{display:show}.sayfa div#qrcode > img {display: inline-block !important;}
      </style>
        <style type="text/css">
            .sayfa {
                font-family: 'Arial', 'Tahoma', 'Times New Roman', Times, serif;
                font-size: 11px;
                width: 900;
            }
            .sayfa #logoholder > img {
            max-width: 320px !important;
            max-height: 100px;
            }
            table.ust_tablo.wp td {
                width: 33%;
                vertical-align: top;
            }
            td.ust_tablo_td3 table {
                border-collapse: collapse;
            }
            td.ust_tablo_td3 table tr, td.ust_tablo_td3 table td {
                border: 1px solid;
            }
            table.ust_tablo td.ust_tablo_td3 td {
                padding: 2px 1px;
            }
            table.ust_tablo td.ust_tablo_td3 td.lineTableBudgetTd {
                font-weight: bold;
            }
            table.ust_tablo .buyuk_baslik {
                font-size: 15px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .txt_center {
                text-align: center;
            }
            .txt_center .f_bold_big {
                font-size: 15px;
                font-weight: bold;
                margin: 5px 0px;
            }
            .txt_center img {
                margin: 0 auto;
            }
            #ettnTable {
                margin: 10px 0px;
            }
            #fatura_tbl, #fatura_tbl tr, #fatura_tbl th, #fatura_tbl td {
                border: 1px solid;
                border-collapse: collapse;
            }
            #fatura_tbl thead {
                background-color: #EAEDED;
            }
            #fatura_tbl thead th, #fatura_tbl tbody td {
                padding: 5px 3px;
            }
            table.lineTableBudgetTd, table.lineTableBudgetTd td {
                border: 1px solid;
            }
            table.lineTableBudgetTd td {
                padding: 5px 3px;
            }
            table td.lineTableBudgetTd {
                background-color: #EAEDED;
            }
            div.tbl_capth.tbl_cap.mb-2 {
                border: 1px solid;
                padding: 5px 0px;
            }
            table.mal-hizmet {
                margin: 10px 0px;
                border-collapse: collapse;
            }
            table.mal-hizmet > td {
                margin: 0;
                padding: 0;
            }
            table.mal-hizmet table.lineTableBudgetTd {
                border-collapse: collapse;
            }
            table.mal-hizmet table.lineTableBudgetTd td.lineTableBudgetTd {
                font-weight: bold;
            }
            td.ust_tablo_td1 div.cerceve {
                padding: 8px 0px;
                border-top: 3px solid;
                border-bottom: 3px solid; 
            }
            .alt_toplam_val{text-align:right;}
        </style>
        <!-- Tasarımın CSS kodları burada bitiyor -->
        <!-- /////////////////////MİKRO///////////////////////////// -->
        <style type="text/css">
          <!-- Firmanıza özel tasarım değişiklikleri buradaki style tagının içerisine girebilirsiniz -->
        </style>
  </xsl:otherwise>
  </xsl:choose>
        <title>e-Fatura</title>
      </head>
        <xsl:choose>
  <xsl:when test="n1:Invoice/cbc:InvoiceTypeCode = 'SGK'">
  <body style="margin-top=0.79in; margin-bottom=0.79in">
      <div class="sayfa">
          <xsl:for-each select="$XML">
              <!-- header  -->
              <table style="border-color:blue; " border="0" cellspacing="0px" width="800px" cellpadding="0px">
                  <tbody>
                      <!-- 1. SATIR -->
                      <tr id="firmalogoTr" valign="top">
                          <!-- 1. SATIR SOL ÜST -->
                          <td width="40%" align="left" height="200px">
                              <table align="left" border="0" width="100%">
                                  <tbody>
                                      <tr align="left">
                                          <xsl:for-each select="n1:Invoice">
                                              <xsl:for-each select="cac:AccountingSupplierParty">
                                                  <xsl:for-each select="cac:Party">
                                                      <td align="left">
                                                          <xsl:if test="cac:PartyName">
                                                              <span style="font-size:8pt; font-weight: bold">
                                                                  <xsl:value-of select="cac:PartyName/cbc:Name" />
                                                              </span>
                                                          </xsl:if>
                                                          <xsl:for-each select="cac:Person">
                                                              <xsl:for-each select="cbc:Title">
                                                                  <xsl:apply-templates />
                                                                  <span style="font-weight:bold;">
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:FirstName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:MiddleName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:FamilyName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:NameSuffix">
                                                                  <xsl:apply-templates />
                                                              </xsl:for-each>
                                                          </xsl:for-each>
                                                      </td>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </tr>
                                      <tr align="left">
                                          <xsl:for-each select="n1:Invoice">
                                              <xsl:for-each select="cac:AccountingSupplierParty">
                                                  <xsl:for-each select="cac:Party">
                                                      <td align="left">
                                                          <xsl:for-each select="cac:PostalAddress">
                                                              <xsl:for-each select="cbc:StreetName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:BuildingName">
                                                                  <xsl:apply-templates />
                                                              </xsl:for-each>
                                                              <xsl:if test="cbc:BuildingNumber">
                                                                  <span>
                                                                      <xsl:text> No:</xsl:text>
                                                                  </span>
                                                                  <xsl:for-each select="cbc:BuildingNumber">
                                                                      <xsl:apply-templates />
                                                                  </xsl:for-each>
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:if>
                                                              <br />
                                                              <xsl:for-each select="cbc:PostalZone">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:CitySubdivisionName">
                                                                  <xsl:apply-templates />
                                                              </xsl:for-each>
                                                              <span>
                                                                  <xsl:text>   </xsl:text>
                                                              </span>
                                                              <xsl:for-each select="cbc:CityName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                          </xsl:for-each>
                                                      </td>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </tr>
                                      <xsl:if test="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telephone or //n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telefax">
                                          <tr align="left">
                                              <xsl:for-each select="n1:Invoice">
                                                  <xsl:for-each select="cac:AccountingSupplierParty">
                                                      <xsl:for-each select="cac:Party">
                                                          <td align="left">
                                                              <xsl:for-each select="cac:Contact">
                                                                  <xsl:if test="cbc:Telephone">
                                                                      <span>
                                                                          <xsl:text>Tel: </xsl:text>
                                                                      </span>
                                                                      <xsl:for-each select="cbc:Telephone">
                                                                          <xsl:apply-templates />
                                                                      </xsl:for-each>
                                                                  </xsl:if>
                                                                  <xsl:if test="cbc:Telefax">
                                                                      <span>
                                                                          <xsl:text> Fax: </xsl:text>
                                                                      </span>
                                                                      <xsl:for-each select="cbc:Telefax">
                                                                          <xsl:apply-templates />
                                                                      </xsl:for-each>
                                                                  </xsl:if>
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                          </td>
                                                      </xsl:for-each>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </tr>
                                      </xsl:if>
                                      <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cbc:WebsiteURI">
                                          <tr align="left">
                                              <td>
                                                  <xsl:text>Web Sitesi: </xsl:text>
                                                  <xsl:value-of select="." />
                                              </td>
                                          </tr>
                                      </xsl:for-each>
                                      <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail">
                                          <tr align="left">
                                              <td>
                                                  <xsl:text>E-Posta: </xsl:text>
                                                  <xsl:value-of select="." />
                                              </td>
                                          </tr>
                                      </xsl:for-each>
                                      <tr align="left">
                                          <xsl:for-each select="n1:Invoice">
                                              <xsl:for-each select="cac:AccountingSupplierParty">
                                                  <xsl:for-each select="cac:Party">
                                                      <td align="left">
                                                          <span>
                                                              <xsl:text>Vergi Dairesi: </xsl:text>
                                                          </span>
                                                          <xsl:for-each select="cac:PartyTaxScheme">
                                                              <xsl:for-each select="cac:TaxScheme">
                                                                  <xsl:for-each select="cbc:Name">
                                                                      <xsl:apply-templates />
                                                                  </xsl:for-each>
                                                              </xsl:for-each>
                                                              <span>
                                                                  <xsl:text>  </xsl:text>
                                                              </span>
                                                          </xsl:for-each>
                                                      </td>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </tr>
                                      <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification">
                                          <tr align="left">
                                              <td>
                                                  <xsl:value-of select="cbc:ID/@schemeID" />
                                                  <xsl:text>: </xsl:text>
                                                  <xsl:value-of select="cbc:ID" />
                                              </td>
                                          </tr>
                                      </xsl:for-each>
                                      <xsl:for-each select="n1:Invoice">
                                          <xsl:for-each select="cbc:Note">
                                              <xsl:if test="substring(.,1,13) = 'Ticaret Sicil'">
                                                  <tr align="left">
                                                      <td>
                                                          <xsl:value-of select="." />
                                                      </td>
                                                  </tr>
                                              </xsl:if>
                                          </xsl:for-each>
                                      </xsl:for-each>
                                      <xsl:for-each select="n1:Invoice">
                                          <xsl:for-each select="cbc:Note">
                                              <xsl:if test="substring(.,1,9) = 'Mersis No'">
                                                  <tr align="left">
                                                      <td>
                                                          <xsl:value-of select="." />
                                                      </td>
                                                  </tr>
                                              </xsl:if>
                                          </xsl:for-each>
                                      </xsl:for-each>
                                  </tbody>
                              </table>
                          </td>
                          <!-- 1. SATIR ORTA 
            <td width="20%" align="center">
         
            </td>
            -->
                          <!-- 1. SATIR SAĞ ÜST -->
                          <td width="60%" align="center" valign="middle" colspan="2">
                               <!-- /////////////////////MİKRO///////////////////////////// -->
                                <!-- Faturadaki QR Kod alanı burada bulunuyor @QRKOD-->
                                <div id="invoiceqrcodesgk" >
                                    <div id="qrcodesgk"/>
                                    <div id="qrvalue" style="visibility: hidden; height: 20px;width: 20px; ; display:none">
                                        {"vkntckn":"<xsl:value-of select="n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='TCKN' or @schemeID='VKN']"/>",
                                        "avkntckn":"<xsl:value-of select="n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='TCKN' or @schemeID='VKN']"/>",
                                        "senaryo":"<xsl:value-of select="n1:Invoice/cbc:ProfileID"/>",
                                        "tip":"<xsl:value-of select="n1:Invoice/cbc:InvoiceTypeCode"/>",
                                        "tarih":"<xsl:value-of select="n1:Invoice/cbc:IssueDate"/>",
                                        "no":"<xsl:value-of select="n1:Invoice/cbc:ID"/>",
                                        "ettn":"<xsl:value-of select="n1:Invoice/cbc:UUID" />",
                                        "parabirimi":"<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />",
                                        "malhizmettoplam":"<xsl:value-of select="n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount" />",
                                        <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']">
                                            <xsl:text>"kdvmatrah</xsl:text>(<xsl:value-of select="cbc:Percent"
                                                                                            />)":"<xsl:value-of select="cbc:TaxableAmount"/>",
                                        </xsl:for-each>
                                        <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']">
                                            <xsl:text>"hesaplanankdv</xsl:text>(<xsl:value-of select="cbc:Percent"
                                                />)":"<xsl:value-of select="cbc:TaxAmount"/>",
                                        </xsl:for-each>"vergidahil":"<xsl:value-of select="n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount" />",
                                        "odenecek":"<xsl:value-of select="n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount"/>"
                                        }
                                    </div>
                                    <script type="text/javascript">
                                        <![CDATA[
                                                var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
                                            ]]>
                                        var qrcodesgk = new QRCode(document.getElementById("qrcodesgk"), { width : 180, height : 180, correctLevel : QRCode.CorrectLevel.M }); function makeCode (msg) {    var elText = document.getElementById("text"); qrcodesgk.makeCode(msg); } makeCode(document.getElementById("qrvalue").innerHTML.replace(/\s/g,''));
                                    </script>
                                    <style>
                                        .sayfa div#qrcodesgk > img {
                                        display: inline-block !important;
                                        }

                                        #invoiceqrcodesgk {
                                        text-align: right !important;
                                        }
                                    </style>
                                </div>
                                <!-- QR Kod alanı burada bitiyor -->
                                  
                              <div align="center" valign="middle">
                                  <!-- Firma Logo -->
                              </div>
                          </td>
                      </tr>
                      <!-- 2. SATIR -->
                      <tr id="firmalogoTr" valign="top">
                          <td width="40%" align="center">
                              <table id="customerIDTable" align="center">
                                  <tbody>
                                      <tr>
                                          <xsl:for-each select="n1:Invoice">
                                              <xsl:for-each select="cac:AccountingCustomerParty">
                                                  <xsl:for-each select="cac:Party">
                                                      <td style="width:469px; " align="left">
                                                          <span style="font-weight:bold; ">
                                                              <xsl:text>SAYIN</xsl:text>
                                                          </span>
                                                      </td>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </tr>
                                      <tr>
                                          <xsl:for-each select="n1:Invoice">
                                              <xsl:for-each select="cac:AccountingCustomerParty">
                                                  <xsl:for-each select="cac:Party">
                                                      <td style="width:469px; " align="left">
                                                          <xsl:if test="cac:PartyName">
                                                              <span style="font-weight:bold; ">
                                                                  <xsl:value-of select="cac:PartyName/cbc:Name" />
                                                              </span>
                                                              <br />
                                                          </xsl:if>
                                                          <xsl:for-each select="cac:Person">
                                                              <xsl:for-each select="cbc:Title">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:FirstName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:MiddleName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text>  </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:FamilyName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:NameSuffix">
                                                                  <xsl:apply-templates />
                                                              </xsl:for-each>
                                                          </xsl:for-each>
                                                      </td>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </tr>
                                      <tr>
                                          <xsl:for-each select="n1:Invoice">
                                              <xsl:for-each select="cac:AccountingCustomerParty">
                                                  <xsl:for-each select="cac:Party">
                                                      <td style="width:469px; " align="left">
                                                          <xsl:for-each select="cac:PostalAddress">
                                                              <xsl:for-each select="cbc:StreetName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:BuildingName">
                                                                  <xsl:apply-templates />
                                                              </xsl:for-each>
                                                              <!--
                                                <xsl:for-each select="cbc:BuildingNumber">
                                                <span>
                                                <xsl:text> No:</xsl:text>
                                                </span>
                                                <xsl:apply-templates/>
                                                <span>
                                                <xsl:text>&#160;</xsl:text>
                                                </span>
                                                </xsl:for-each>
                                                <br/>
                                                <xsl:for-each select="cbc:Room">
                                                <span>
                                                <xsl:text>Kapı No:</xsl:text>
                                                </span>
                                                <xsl:apply-templates/>
                                                <span>
                                                <xsl:text>&#160;</xsl:text>
                                                </span>
                                                </xsl:for-each>
                                                <br/>
                                                -->
                                                              <xsl:for-each select="cbc:PostalZone">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:CitySubdivisionName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text>/ </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                              <xsl:for-each select="cbc:CityName">
                                                                  <xsl:apply-templates />
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </xsl:for-each>
                                                          </xsl:for-each>
                                                      </td>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </tr>
                                      <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cbc:WebsiteURI">
                                          <xsl:if test=". != ''">
                                              <tr align="left">
                                                  <td>
                                                      <xsl:text>Web Sitesi: </xsl:text>
                                                      <xsl:value-of select="." />
                                                  </td>
                                              </tr>
                                          </xsl:if>
                                      </xsl:for-each>
                                      <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail">
                                          <xsl:if test=". != ''">
                                              <tr align="left">
                                                  <td>
                                                      <xsl:text>E-Posta: </xsl:text>
                                                      <xsl:value-of select="." />
                                                  </td>
                                              </tr>
                                          </xsl:if>
                                      </xsl:for-each>
                                      <xsl:for-each select="n1:Invoice">
                                          <xsl:for-each select="cac:AccountingCustomerParty">
                                              <xsl:for-each select="cac:Party">
                                                  <xsl:for-each select="cac:Contact">
                                                      <xsl:if test="cbc:Telephone or cbc:Telefax">
                                                          <tr align="left">
                                                              <td style="width:469px; " align="left">
                                                                  <xsl:for-each select="cbc:Telephone">
                                                                      <span>
                                                                          <xsl:text>Tel: </xsl:text>
                                                                      </span>
                                                                      <xsl:apply-templates />
                                                                  </xsl:for-each>
                                                                  <xsl:for-each select="cbc:Telefax">
                                                                      <span>
                                                                          <xsl:text> Fax: </xsl:text>
                                                                      </span>
                                                                      <xsl:apply-templates />
                                                                  </xsl:for-each>
                                                                  <span>
                                                                      <xsl:text> </xsl:text>
                                                                  </span>
                                                              </td>
                                                          </tr>
                                                      </xsl:if>
                                                      <xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">
                                                          <tr align="left">
                                                              <td>
                                                                  <span>
                                                                      <xsl:text>Vergi Dairesi: </xsl:text>
                                                                      <xsl:value-of select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name" />
                                                                  </span>
                                                              </td>
                                                          </tr>
                                                      </xsl:if>
                                                  </xsl:for-each>
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </xsl:for-each>
                                      <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">
                                          <tr align="left">
                                              <td>
                                                  <xsl:value-of select="cbc:ID/@schemeID" />
                                                  <xsl:text>: </xsl:text>
                                                  <xsl:value-of select="cbc:ID" />
                                              </td>
                                          </tr>
                                      </xsl:for-each>
                                  </tbody>
                              </table>
                              <table id="ettnTable" align="left">
                                  <tr style="height:13px;">
                                      <td align="left" valign="top">
                                          <span style="font-weight:bold; ">
                                              <xsl:text>ETTN:</xsl:text>
                                          </span>
                                      </td>
                                      <td align="left">
                                          <xsl:for-each select="n1:Invoice">
                                              <xsl:for-each select="cbc:UUID">
                                                  <xsl:apply-templates />
                                              </xsl:for-each>
                                          </xsl:for-each>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                          <td width="20%" align="center" valign="top">
                              <img style="width:91px;" align="middle" alt="E-Fatura Logo" src="data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAABkAAD/4QMZaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzEzMiA3OS4xNTkyODQsIDIwMTYvMDQvMTktMTM6MTM6NDAgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZDNDJBNEI2QjVCRDExRThCQjM0REIwQkZGMEQxODY0IiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjZDNDJBNEI1QjVCRDExRThCQjM0REIwQkZGMEQxODY0IiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzQgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSIzREVENkU1N0FDREVDNEJBNzkxNUM2M0NCN0RENzM0NyIgc3RSZWY6ZG9jdW1lbnRJRD0iM0RFRDZFNTdBQ0RFQzRCQTc5MTVDNjNDQjdERDczNDciLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/7gAOQWRvYmUAZMAAAAAB/9sAhAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB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" />
                              <h1 align="center">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>e-FATURA</xsl:text>
                                  </span>
                              </h1>
                          </td>
                          <td width="40%" align="center" valign="top">
                              <!-- header - sağ  -->
                              <table width="100%" id="despatchTable" border="1">
                                  <xsl:if test="//n1:Invoice/cbc:CustomizationID">
                                      <tr align="left">
                                          <td width="45%" align="left">
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Özelleştirme No</xsl:text>
                                              </span>
                                          </td>
                                          <td width="55%" align="left">
                                              <xsl:value-of select="//n1:Invoice/cbc:CustomizationID" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cbc:ProfileID">
                                      <tr align="left">
                                          <td>
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Senaryo</xsl:text>
                                              </span>
                                          </td>
                                          <td>
                                              <xsl:value-of select="//n1:Invoice/cbc:ProfileID" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cbc:ID">
                                      <tr align="left">
                                          <td>
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Fatura No</xsl:text>
                                              </span>
                                          </td>
                                          <td>
                                              <xsl:value-of select="//n1:Invoice/cbc:ID" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cbc:IssueDate">
                                      <tr align="left">
                                          <td>
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Fatura Tarihi</xsl:text>
                                              </span>
                                          </td>
                                          <td>
                                              <xsl:value-of select="substring(//n1:Invoice/cbc:IssueDate,9,2)" />-<xsl:value-of select="substring(//n1:Invoice/cbc:IssueDate,6,2)" />-<xsl:value-of select="substring(//n1:Invoice/cbc:IssueDate,1,4)" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cbc:InvoiceTypeCode">
                                      <tr align="left">
                                          <td>
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Fatura Tipi</xsl:text>
                                              </span>
                                          </td>
                                          <td>
                                              <xsl:value-of select="//n1:Invoice/cbc:InvoiceTypeCode" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <!-- SGK : SAGLIK_HAS ... -->
                                  <xsl:if test="//n1:Invoice/cbc:AccountingCost">
                                      <tr align="left">
                                          <td>
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>İlave Fatura Tipi</xsl:text>
                                              </span>
                                          </td>
                                          <td>
                                              <xsl:value-of select="//n1:Invoice/cbc:AccountingCost" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <xsl:for-each select="//n1:Invoice/cac:DespatchDocumentReference">
                                      <xsl:choose>
                                          <xsl:when test="//n1:Invoice/cac:DespatchDocumentReference">
                                              <tr style="height:13px; ">
                                                  <td align="left">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text>İrsaliye No</xsl:text>
                                                      </span>
                                                      <span>
                                                          <xsl:text> </xsl:text>
                                                      </span>
                                                  </td>
                                                  <td align="left">
                                                      <xsl:value-of select="./cbc:ID" />
                                                  </td>
                                              </tr>
                                              <tr style="height:13px; ">
                                                  <td align="left">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text>İrsaliye Tarihi</xsl:text>
                                                      </span>
                                                  </td>
                                                  <td align="left">
                                                      <xsl:value-of select="substring(./cbc:IssueDate,9,2)" />-<xsl:value-of select="substring(./cbc:IssueDate,6,2)" />-<xsl:value-of select="substring(./cbc:IssueDate,1,4)" />
                                                  </td>
                                              </tr>
                                          </xsl:when>
                                      </xsl:choose>
                                  </xsl:for-each>
                                  <xsl:if test="//n1:Invoice/cac:OrderReference/cbc:ID">
                                      <tr style="height:13px">
                                          <td align="left">
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Sipariş No</xsl:text>
                                              </span>
                                          </td>
                                          <td align="left">
                                              <xsl:value-of select="//n1:Invoice/cac:OrderReference/cbc:ID" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cac:OrderReference/cbc:IssueDate">
                                      <tr style="height:13px">
                                          <td align="left">
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Sipariş Tarihi</xsl:text>
                                              </span>
                                          </td>
                                          <td align="left">
                                              <xsl:value-of select="substring(//n1:Invoice/cac:OrderReference/cbc:IssueDate,9,2)" />-<xsl:value-of select="substring(//n1:Invoice/cac:OrderReference/cbc:IssueDate,6,2)" />-<xsl:value-of select="substring(//n1:Invoice/cac:OrderReference/cbc:IssueDate,1,4)" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <!-- SIPARIS_NO -->
                                  <xsl:for-each select="//n1:Invoice/cbc:Note">
                                      <xsl:if test="contains(., '##EA#SIPARIS_NO')">
                                          <tr align="left">
                                              <td>
                                                  <span style="font-weight:bold">
                                                      <xsl:text>Sipariş No</xsl:text>
                                                  </span>
                                              </td>
                                              <td>
                                                  <xsl:value-of select="substring-after(., '||')" />
                                              </td>
                                          </tr>
                                      </xsl:if>
                                  </xsl:for-each>
                                  <!-- SIPARIS_TARIHI-->
                                  <xsl:for-each select="//n1:Invoice/cbc:Note">
                                      <xsl:if test="contains(., '##EA#SIPARIS_TARIHI')">
                                          <tr align="left">
                                              <td>
                                                  <span style="font-weight:bold">
                                                      <xsl:text>Sipariş Tarihi</xsl:text>
                                                  </span>
                                              </td>
                                              <td>
                                                  <xsl:value-of select="substring-after(., '||')" />
                                              </td>
                                          </tr>
                                      </xsl:if>
                                  </xsl:for-each>
                                
                                  <tr class="invoiceprofile senaryo">
                               <td class="lineTableBudgetTd ">
                                    <span style="font-weight:bold; ">
                                        <xsl:text>Son Ödeme Tarihi:</xsl:text>
                                    </span>
                                </td>
                             <td class="lineTableBudgetTr">
                                     <xsl:for-each
                                    select="n1:Invoice/cac:PaymentMeans">
                                        <xsl:for-each select="cbc:PaymentDueDate">
                                            <xsl:value-of select="substring(.,9,2)"
                                                />-<xsl:value-of select="substring(.,6,2)"
                                                />-<xsl:value-of select="substring(.,1,4)"/>
                                        </xsl:for-each>
                                    </xsl:for-each>
                                </td>
                            </tr>
                                 <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                        <xsl:if test="../cbc:DocumentType">
                          <xsl:if test="../cbc:DocumentTypeCode='KOBI_BILGISI'">
                            <tr>
                              <th>
                                <xsl:text>Kobi Bilgisi:</xsl:text>
                              </th>
                              <td>
                                <xsl:value-of select="." />
                              </td>
                            </tr>
                          </xsl:if>
                        </xsl:if>
                      </xsl:for-each>
                      <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                        <xsl:if test="../cbc:DocumentType">
                          <xsl:if test="../cbc:DocumentTypeCode='EYDEP_BILGISI'">
                            <tr>
                              <th>
                                <xsl:text>EYDEP Bilgisi:</xsl:text>
                              </th>
                              <td>
                                <xsl:value-of select="." />
                              </td>
                            </tr>
                          </xsl:if>
                        </xsl:if>
                      </xsl:for-each>
                                
                                  <xsl:if test="//n1:Invoice/cbc:IssueTime">
                                      <tr style="height:13px">
                                          <td align="left">
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Oluşturma Zamanı</xsl:text>
                                              </span>
                                          </td>
                                          <td align="left">
                                              <xsl:value-of select="substring(//n1:Invoice/cbc:IssueTime,1,8)" />
                                          </td>
                                      </tr>
                                  </xsl:if>
                                  <xsl:for-each select="//n1:Invoice/cbc:Note">
                                      <xsl:choose>
                                          <xsl:when test="substring(.,0,5) = 'UPR:'">
                                              <tr style="height:13px">
                                                  <td align="left">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:value-of select="normalize-space(substring-before(substring(.,5),':'))" />
                                                          <xsl:text></xsl:text>
                                                      </span>
                                                  </td>
                                                  <td align="left">
                                                      <xsl:value-of select="normalize-space(substring-after(substring(.,5),':'))" />
                                                  </td>
                                              </tr>
                                          </xsl:when>
                                      </xsl:choose>
                                  </xsl:for-each>
                              </table>
                          </td>
                      </tr>
                      <tr>
                          <td colspan="3" style="background-color:white;height:5mm"> </td>
                      </tr>
                  </tbody>
              </table>
              <!-- urunler  -->
              <table border="1" id="lineTable" width="800">
                  <tbody>
                      <tr id="lineTableTr">
                          <td id="lineTableHead" style="width:3%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>Sıra No</xsl:text>
                              </span>
                          </td>
                        
                        
                        <!--SAS Kalem No Başlık-->                  
               <!-- <td class="lineTableTd" style="width:7%">
                <span style="font-weight:bold; " align="center">
                  <xsl:text>SAS Kalem No</xsl:text>
                </span>
              </td>--> 
                                    
                        <!--Yerlilik Oranı Başlık - KALDIRILDI -->                  
                <!-- Bu sabit başlık kaldırıldı - koşullu başlık kullanılıyor -->
                        
                        
                          <!-- Mal/Hizmet Tablosundaki Marka alanı burada bulunuyor @MARKA -->
                          <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Item/cbc:BrandName">
                              <td id="lineTableHead" align="left">
                                  <xsl:text>Marka</xsl:text>
                              </td>
                          </xsl:if>
                          <!-- Marka alanı burada bitiyor -->
                           <td id="lineTableHead" style="width:7%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>Barkod</xsl:text>
                              </span>
                          </td>
                          <td id="lineTableHead" style="width:10%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>Mal / Hizmet Kodu</xsl:text>
                              </span>
                          </td>
                        
                       <td id="lineTableHead" style="width:10%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>Mal / Hizmet Adı</xsl:text>
                              </span>
                          </td>

                        
                        
                        
                          <td id="lineTableHead" style="width:8%" align="center">
                              <span style="font-weight:bold;">
                                  <xsl:text>Miktar</xsl:text>
                              </span>
                          </td>
                          <td id="lineTableHead" style="width:10%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>Birim Fiyat</xsl:text>
                              </span>
                          </td>
                          <!-- Mal Hizmet Tablosundaki İskonto Nedeni Alanı @ISKONTONEDENI-->
                          <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge/cbc:AllowanceChargeReason">
                              <td id="lineTableHead" align="left">
                                  <xsl:text>İskonto Nedeni</xsl:text>
                              </td>
                          </xsl:if>
                          <!-- İskonto Nedeni alanı burada bitiyor -->
                          <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge/cbc:MultiplierFactorNumeric">
                              <td id="lineTableHead" style="width:5%" align="center">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>İsk.%</xsl:text>
                                  </span>
                              </td>
                          </xsl:if>
                          <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
                              <td id="lineTableHead" style="width:8%" align="center">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>İsk. Tutarı</xsl:text>
                                  </span>
                              </td>
                          </xsl:if>
                          <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
                          <td id="lineTableHead" style="width:10%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>İskonto Uyg.</xsl:text>
                              </span>
                          </td>
                          </xsl:if>
                          <td id="lineTableHead" style="width:10%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>KDV Oranı</xsl:text>
                              </span>
                          </td>
                          <td id="lineTableHead" style="width:5%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>KDV Tutarı</xsl:text>
                              </span>
                          </td>
                          <td id="lineTableHead" style="width:6%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>Diğer V.</xsl:text>
                              </span>
                          </td>
                          <td id="lineTableHead" style="width:10%" align="center">
                              <span style="font-weight:bold; ">
                                  <xsl:text>Tutar</xsl:text>
                              </span>
                          </td>
                      </tr>
                      <xsl:for-each select="//n1:Invoice/cac:InvoiceLine">
                          <xsl:choose>
                              <xsl:when test=".">
                                  <xsl:apply-templates select="." />
                              </xsl:when>
                              <xsl:otherwise>
                                  <xsl:apply-templates select="//n1:Invoice" />
                              </xsl:otherwise>
                          </xsl:choose>
                      </xsl:for-each>
                  </tbody>
              </table>
          </xsl:for-each>
          <div id="lineTableAligner">
              <span>
                  <xsl:text> </xsl:text>
              </span>
          </div>
          <!-- Toplamlar Blok Başlangıcı -->
          <table width="800px" style="padding:0px; margin:0px">
              <tr>
                  <!-- Sol taraf YAZIYLA kısmı -->
                  <td width="50%" align="left" valign="bottom">
                      <table id="lineTableBudget">
                          <tr>
                              <td width="400px" id="lineTableBudgetTd">
                                  <b>Yalnız : </b>
                                  <xsl:for-each select="//n1:Invoice/cbc:Note">
                                      <xsl:if test="contains(.,'Yazıyla:')">
                                          <xsl:value-of select="normalize-space(substring-after(.,'Yalnız '))" />
                                      </xsl:if>
                                  </xsl:for-each>
                              </td>
                          </tr>
                      </table>
                  </td>
                  <!-- Sağ taraf GENEL TOPLAMLAR kısmı -->
                  <td align="right" valign="top" width="%50" style="padding-right:0px">
                      <table align="right" id="lineTableBudget" width="100%">
                          <tr align="right">
                              <td id="lineTableBudgetTd" align="right" width="300px">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>Mal Hizmet Toplam Tutarı</xsl:text>
                                  </span>
                              </td>
                              <td id="lineTableBudgetTd" width="100px" >
                                  <span>
                                      <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '###.##0,00', 'european')" />
                                      <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID">
                                          <xsl:text></xsl:text>
                                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID = 'TRL'">
                                              <xsl:text>TL</xsl:text>
                                          </xsl:if>
                                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRL'">
                                              <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID" />
                                          </xsl:if>
                                      </xsl:if>
                                  </span>
                              </td>
                          </tr>
                          <!-- Toplam İskonto  -->
                          <tr id="budgetContainerTr" align="right">
                              <td id="lineTableBudgetTd" align="right" width="300px">
                                  <span style="font-weight:bold;">
                                      <xsl:text>Toplam İskonto</xsl:text>
                                  </span>
                              </td>
                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                  <span>
                                      <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount, '###.##0,00', 'european')" />
                                      <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID">
                                          <xsl:text></xsl:text>
                                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID = 'TRL'">
                                              <xsl:text>TL</xsl:text>
                                          </xsl:if>
                                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID != 'TRL'">
                                              <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID" />
                                          </xsl:if>
                                      </xsl:if>
                                  </span>
                              </td>
                          </tr>
                          <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                              <!-- KDV Bilgisi  -->
                              <tr id="budgetContainerTr" align="right">
                                  <xsl:if test="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015'">
                                      <xsl:choose>
                                          <xsl:when test="cac:TaxCategory/cbc:TaxExemptionReason">
                                              <!-- KDV İSTİSNASI -->
                                              <td id="lineTableBudgetTd" width="300px" align="right">
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text>Hesaplanan </xsl:text>
                                                      <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name" />
                                                      <xsl:text>(%</xsl:text>
                                                      <xsl:value-of select="cbc:Percent" />
                                                      <xsl:text>)</xsl:text>
                                                  </span>
                                                  <xsl:text></xsl:text>
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text> - İstisna Kodu : </xsl:text>
                                                      <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReasonCode" />
                                                      <xsl:text> ( </xsl:text>
                                                      <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />
                                                      <xsl:text> ) </xsl:text>
                                                  </span>
                                              </td>
                                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                  <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                      <xsl:text></xsl:text>
                                                      <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                                                      <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                                          <xsl:text></xsl:text>
                                                          <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRL'">
                                                              <xsl:text>TL</xsl:text>
                                                          </xsl:if>
                                                          <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRL'">
                                                              <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                                                          </xsl:if>
                                                      </xsl:if>
                                                  </xsl:for-each>
                                              </td>
                                          </xsl:when>
                                          <xsl:otherwise>
                                              <!-- KDV İSTİSNASI YOK İSE -->
                                              <td id="lineTableBudgetTd" width="300px" align="right">
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text>Hesaplanan KDV </xsl:text>
                                                      <xsl:text> (%</xsl:text>
                                                      <xsl:value-of select="cbc:Percent" />
                                                      <xsl:text>) </xsl:text>
                                                  </span>
                                              </td>
                                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                  <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                      <xsl:text></xsl:text>
                                                      <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                                                      <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                                          <xsl:text></xsl:text>
                                                          <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRL'">
                                                              <xsl:text>TL</xsl:text>
                                                          </xsl:if>
                                                          <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRL'">
                                                              <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                                                          </xsl:if>
                                                      </xsl:if>
                                                  </xsl:for-each>
                                              </td>
                                          </xsl:otherwise>
                                      </xsl:choose>
                                  </xsl:if>
                              </tr>
                          </xsl:for-each>
                          <xsl:for-each select="n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal">
                              <!-- Tevkifat Bilgisi  -->
                              <tr id="budgetContainerTr" align="right">
                                  <xsl:choose>
                                      <xsl:when test="cac:TaxCategory/cbc:TaxExemptionReason">
                                          <td id="lineTableBudgetTd" width="300px" align="right">
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Vergi Muafiyet Sebebi </xsl:text>
                                              </span>
                                          </td>
                                          <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                              <xsl:text></xsl:text>
                                              <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />
                                          </td>
                                      </xsl:when>
                                      <xsl:otherwise>
                                          <td id="lineTableBudgetTd" width="300px" align="right">
                                              <span style="font-weight:bold; ">
                                                  <xsl:text>Tevkifat </xsl:text>
                                                  <xsl:text>(%</xsl:text>
                                                  <xsl:value-of select="cbc:Percent" />
                                                  <xsl:text> - Kodu : </xsl:text>
                                                  <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode" />
                                                  <xsl:text>)</xsl:text>
                                              </span>
                                          </td>
                                          <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                              <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                  <xsl:text></xsl:text>
                                                  <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                                                  <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                                      <xsl:text></xsl:text>
                                                      <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRL'">
                                                          <xsl:text>TL</xsl:text>
                                                      </xsl:if>
                                                      <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRL'">
                                                          <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                                                      </xsl:if>
                                                  </xsl:if>
                                              </xsl:for-each>
                                          </td>
                                      </xsl:otherwise>
                                  </xsl:choose>
                              </tr>
                          </xsl:for-each>
                          <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                              <!-- KDV Haricindeki Vergi Bilgisi  -->
                              <xsl:if test="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode != '0015'">
                                  <xsl:choose>
                                      <xsl:when test="cac:TaxCategory/cbc:TaxExemptionReason">
                                          <tr id="budgetContainerTr" align="right">
                                              <td id="lineTableBudgetTd" width="300px" align="right">
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text>Vergi Muafiyet Sebebi </xsl:text>
                                                  </span>
                                              </td>
                                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                  <xsl:text></xsl:text>
                                                  <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />
                                              </td>
                                          </tr>
                                      </xsl:when>
                                      <xsl:otherwise>
                                          <tr id="budgetContainerTr" align="right">
                                              <td id="lineTableBudgetTd" width="300px" align="right">
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text>Hesaplanan </xsl:text>
                                                      <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name" />
                                                      <xsl:text>(%</xsl:text>
                                                      <xsl:value-of select="cbc:Percent" />
                                                      <xsl:text>)</xsl:text>
                                                  </span>
                                              </td>
                                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                  <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                      <xsl:text></xsl:text>
                                                      <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                                                      <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                                          <xsl:text></xsl:text>
                                                          <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRL'">
                                                              <xsl:text>TL</xsl:text>
                                                          </xsl:if>
                                                          <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRL'">
                                                              <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                                                          </xsl:if>
                                                      </xsl:if>
                                                  </xsl:for-each>
                                              </td>
                                          </tr>
                                      </xsl:otherwise>
                                  </xsl:choose>
                              </xsl:if>
                          </xsl:for-each>
                          <!-- Vergi Dahit Toplam tutar Bilgisi  -->
                          <tr id="budgetContainerTr" align="right">
                              <td id="lineTableBudgetTd" width="300px" align="right">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>Vergiler Dahil Toplam Tutar</xsl:text>
                                  </span>
                              </td>
                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                  <xsl:for-each select="n1:Invoice">
                                      <xsl:for-each select="cac:LegalMonetaryTotal">
                                          <xsl:for-each select="cbc:TaxInclusiveAmount">
                                              <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                                              <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID">
                                                  <xsl:text></xsl:text>
                                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID = 'TRL'">
                                                      <xsl:text>TL</xsl:text>
                                                  </xsl:if>
                                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID != 'TRL'">
                                                      <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID" />
                                                  </xsl:if>
                                              </xsl:if>
                                          </xsl:for-each>
                                      </xsl:for-each>
                                  </xsl:for-each>
                              </td>
                          </tr>
                          <!-- Ödenecek Tutar Bilgisi  -->
                          <tr id="budgetContainerTr" align="right">
                              <td id="lineTableBudgetTd" width="300px" align="right">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>Ödenecek Tutar</xsl:text>
                                  </span>
                              </td>
                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                  <xsl:for-each select="n1:Invoice">
                                      <xsl:for-each select="cac:LegalMonetaryTotal">
                                          <xsl:for-each select="cbc:PayableAmount">
                                              <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                                              <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID">
                                                  <xsl:text></xsl:text>
                                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID = 'TRL'">
                                                      <xsl:text>TL</xsl:text>
                                                  </xsl:if>
                                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID != 'TRL'">
                                                      <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID" />
                                                  </xsl:if>
                                              </xsl:if>
                                          </xsl:for-each>
                                      </xsl:for-each>
                                  </xsl:for-each>
                              </td>
                          </tr>
                          <!-- Fatura Dövizli İse TL Tutarlar  -->
                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRY'">
                              <!-- Mal ve Hizmet Tutarı Bilgisi  -->
                              <tr align="right">
                                  <td id="lineTableBudgetTd" align="right" width="300px">
                                      <span style="font-weight:bold; ">
                                          <xsl:text>Mal Hizmet Toplam Tutarı(TL)</xsl:text>
                                      </span>
                                  </td>
                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                      <span>
                                          <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                          <xsl:text> TL</xsl:text>
                                      </span>
                                  </td>
                              </tr>
                              <!-- Toplam İskonto Bilgisi  -->
                              <tr id="budgetContainerTr" align="right">
                                  <td id="lineTableBudgetTd" align="right" width="300px">
                                      <span style="font-weight:bold; ">
                                          <xsl:text>Toplam İskonto</xsl:text>
                                      </span>
                                  </td>
                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                      <span>
                                          <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                          <xsl:text> TL</xsl:text>
                                      </span>
                                  </td>
                              </tr>
                              <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                                  <!-- KDV Bilgisi  -->
                                  <tr id="budgetContainerTr" align="right">
                                      <xsl:if test="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode = '0015'">
                                          <xsl:choose>
                                              <xsl:when test="cac:TaxCategory/cbc:TaxExemptionReason">
                                                  <!-- KDV İSTİSNASI VARSA -->
                                                  <td id="lineTableBudgetTd" width="300px" align="right">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text>Hesaplanan </xsl:text>
                                                          <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name" />
                                                          <xsl:text>(%</xsl:text>
                                                          <xsl:value-of select="cbc:Percent" />
                                                          <xsl:text>)</xsl:text>
                                                      </span>
                                                      <xsl:text></xsl:text>
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text> - İstisna Kodu : </xsl:text>
                                                          <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReasonCode" />
                                                          <xsl:text> ( </xsl:text>
                                                          <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />
                                                          <xsl:text> ) </xsl:text>
                                                      </span>
                                                  </td>
                                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                      <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                          <xsl:text></xsl:text>
                                                          <xsl:value-of select="format-number(../../cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                                          <xsl:text>TL</xsl:text>
                                                      </xsl:for-each>
                                                  </td>
                                              </xsl:when>
                                              <xsl:otherwise>
                                                  <!-- KDV İSTİSNASI YOKSA -->
                                                  <td id="lineTableBudgetTd" width="300px" align="right">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text>Hesaplanan KDV </xsl:text>
                                                          <xsl:text> (%</xsl:text>
                                                          <xsl:value-of select="cbc:Percent" />
                                                          <xsl:text>)</xsl:text>
                                                      </span>
                                                  </td>
                                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                      <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                          <xsl:text></xsl:text>
                                                          <xsl:value-of select="format-number(../../cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                                          <xsl:text>TL</xsl:text>
                                                      </xsl:for-each>
                                                  </td>
                                              </xsl:otherwise>
                                          </xsl:choose>
                                      </xsl:if>
                                  </tr>
                              </xsl:for-each>
                              <xsl:for-each select="n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal">
                                  <!-- Tevkifat Bilgisi  -->
                                  <tr id="budgetContainerTr" align="right">
                                      <xsl:choose>
                                          <xsl:when test="cac:TaxCategory/cbc:TaxExemptionReason">
                                              <td id="lineTableBudgetTd" width="300px" align="right">
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text>Vergi Muafiyet Sebebi </xsl:text>
                                                  </span>
                                              </td>
                                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                  <xsl:text></xsl:text>
                                                  <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />
                                              </td>
                                          </xsl:when>
                                          <xsl:otherwise>
                                              <td id="lineTableBudgetTd" width="300px" align="right">
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text>Tevkifat </xsl:text>
                                                      <xsl:text>(%</xsl:text>
                                                      <xsl:value-of select="cbc:Percent" />
                                                      <xsl:text> - Kodu : </xsl:text>
                                                      <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode" />
                                                      <xsl:text>)</xsl:text>
                                                  </span>
                                              </td>
                                              <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                  <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                      <xsl:text></xsl:text>
                                                      <xsl:value-of select="format-number(../../cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                                      <xsl:text>TL</xsl:text>
                                                  </xsl:for-each>
                                              </td>
                                          </xsl:otherwise>
                                      </xsl:choose>
                                  </tr>
                              </xsl:for-each>
                              <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                                  <!-- KDV Haricindeki Vergi Bilgisi  -->
                                  <xsl:if test="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode != '0015'">
                                      <xsl:choose>
                                          <xsl:when test="cac:TaxCategory/cbc:TaxExemptionReason">
                                              <tr id="budgetContainerTr" align="right">
                                                  <td id="lineTableBudgetTd" width="300px" align="right">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text>Vergi Muafiyet Sebebi </xsl:text>
                                                      </span>
                                                  </td>
                                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                      <xsl:text></xsl:text>
                                                      <xsl:value-of select="cac:TaxCategory/cbc:TaxExemptionReason" />
                                                  </td>
                                              </tr>
                                          </xsl:when>
                                          <xsl:otherwise>
                                              <tr id="budgetContainerTr" align="right">
                                                  <td id="lineTableBudgetTd" width="300px" align="right">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text>Hesaplanan </xsl:text>
                                                          <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name" />
                                                          <xsl:text>(%</xsl:text>
                                                          <xsl:value-of select="cbc:Percent" />
                                                          <xsl:text>)</xsl:text>
                                                      </span>
                                                  </td>
                                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                                      <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                                          <xsl:text></xsl:text>
                                                          <xsl:value-of select="format-number(../../cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                                          <xsl:text>TL</xsl:text>
                                                      </xsl:for-each>
                                                  </td>
                                              </tr>
                                          </xsl:otherwise>
                                      </xsl:choose>
                                  </xsl:if>
                              </xsl:for-each>
                              <!-- Vergi Dahil Toplam Tutar Bilgisi  -->
                              <tr id="budgetContainerTr" align="right">
                                  <td id="lineTableBudgetTd" width="300px" align="right">
                                      <span style="font-weight:bold; ">
                                          <xsl:text>Vergiler Dahil Toplam Tutar(TRY)</xsl:text>
                                      </span>
                                  </td>
                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                      <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                      <xsl:text> TL</xsl:text>
                                  </td>
                              </tr>
                              <!-- Ödenecek Tutar Bilgisi  -->
                              <tr align="right">
                                  <td id="lineTableBudgetTd" width="300px" align="right">
                                      <span style="font-weight:bold; ">
                                          <xsl:text>Ödenecek Tutar(TRY)</xsl:text>
                                      </span>
                                  </td>
                                  <td id="lineTableBudgetTd" style="width:100px; " align="right">
                                      <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                      <xsl:text> TL</xsl:text>
                                  </td>
                              </tr>
                          </xsl:if>
                      </table>
                  </td>
              </tr>
          </table>
          <br />
          <!-- Toplamlar blok sonu -->
          <br />
          
          
          
          
          
          
          <fieldset style="border-color:gray; border-width:1px; width:790px; padding:4px; border-style:solid">
              <legend>SGK Bilgileri</legend>
              <table id="notesTable" width="760px">
                  <tbody>
                      <!-- Mükellef Kodu  -->
                      <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference">
                          <xsl:choose>
                              <xsl:when test="./cbc:DocumentTypeCode = 'MUKELLEF_KODU'">
                                  <tr style="height:13px; ">
                                      <td width="150px">
                                          <span style="font-weight:bold; ">
                                              <xsl:text>Mükellef Kodu</xsl:text>
                                          </span>
                                          <span>
                                              <xsl:text> </xsl:text>
                                          </span>
                                      </td>
                                      <td align="left">
                                          <xsl:value-of select="./cbc:DocumentType" />
                                      </td>
                                  </tr>
                              </xsl:when>
                          </xsl:choose>
                      </xsl:for-each>
                      <!-- SGK Mükellef Adı  -->
                      <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference">
                          <xsl:choose>
                              <xsl:when test="./cbc:DocumentTypeCode = 'MUKELLEF_ADI'">
                                  <tr style="height:13px; ">
                                      <td width="150px">
                                          <span style="font-weight:bold; ">
                                              <xsl:text>Mükellef Adı</xsl:text>
                                          </span>
                                          <span>
                                              <xsl:text> </xsl:text>
                                          </span>
                                      </td>
                                      <td align="left">
                                          <xsl:value-of select="./cbc:DocumentType" />
                                      </td>
                                  </tr>
                              </xsl:when>
                          </xsl:choose>
                      </xsl:for-each>
                      <!-- SGK : SAGLIK_HAS ... -->
                      <xsl:if test="//n1:Invoice/cbc:AccountingCost">
                          <tr align="left">
                              <td width="150px">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>İlave Fatura Tipi</xsl:text>
                                  </span>
                              </td>
                              <td>
                                  <xsl:value-of select="//n1:Invoice/cbc:AccountingCost" />
                              </td>
                          </tr>
                      </xsl:if>
                      <!-- SGK : Dönem Başlangıç Bitiş ... -->
                      <xsl:if test="//n1:Invoice/cac:InvoicePeriod">
                          <tr align="left">
                              <td width="150px">
                                  <span style="font-weight:bold; ">
                                      <xsl:text>Dönem</xsl:text>
                                  </span>
                              </td>
                              <td>
                                  <xsl:value-of select="substring(//n1:Invoice/cac:InvoicePeriod/cbc:StartDate,9,2)" />.<xsl:value-of select="substring(//n1:Invoice/cac:InvoicePeriod/cbc:StartDate,6,2)" />.<xsl:value-of select="substring(//n1:Invoice/cac:InvoicePeriod/cbc:StartDate,1,4)" /><xsl:text> - </xsl:text><xsl:value-of select="substring(//n1:Invoice/cac:InvoicePeriod/cbc:EndDate,9,2)" />.<xsl:value-of select="substring(//n1:Invoice/cac:InvoicePeriod/cbc:EndDate,6,2)" />.<xsl:value-of select="substring(//n1:Invoice/cac:InvoicePeriod/cbc:EndDate,1,4)" />
                              </td>
                          </tr>
                      </xsl:if>
                      <!-- SGK Dosya No  -->
                      <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference">
                          <xsl:choose>
                              <xsl:when test="./cbc:DocumentTypeCode = 'DOSYA_NO'">
                                  <tr style="height:13px; ">
                                      <td width="150px">
                                          <span style="font-weight:bold; ">
                                              <xsl:text>Dosya No</xsl:text>
                                          </span>
                                          <span>
                                              <xsl:text> </xsl:text>
                                          </span>
                                      </td>
                                      <td align="left">
                                          <xsl:value-of select="./cbc:DocumentType" />
                                      </td>
                                  </tr>
                              </xsl:when>
                          </xsl:choose>
                      </xsl:for-each>
                  </tbody>
              </table>
          </fieldset>
          <br />
          <br />
          <fieldset style="border-color:gray; border-width:1px; width:790px; padding:4px; border-style:solid">
              <legend>Notlar</legend>
              <table id="notesTable" width="760px">
                  <tbody>
                      <xsl:for-each select="//n1:Invoice/cbc:Note">
                          <xsl:if test="(substring(.,1,13) != 'Ticaret Sicil') and (substring(.,1,9) != 'Mersis No') and (substring(.,1,13) != 'KDV_IST_TUTAR') and (substring(.,1,19) != 'KDV_IST_DAHIL_TUTAR') and (substring(.,1,9) != '#NoPrint#') and not(contains(.,'Yazıyla:'))">
                              <tr align="left">
                                  <td id="notesTableTd">
                                      <div class="clear" />
                                      <div style="width:100%;text-align:left;float:left;">
                                          <xsl:value-of select="." />
                                      </div>
                                  </td>
                              </tr>
                          </xsl:if>
                      </xsl:for-each>
                  </tbody>
              </table>
          </fieldset>
          <br />
          <br />
          <br />
          <br />         
      </div>
      </body>
  </xsl:when>
  <xsl:otherwise>
      <body class="invoicehtml ">
        <div class="sayfa">
          <xsl:for-each select="$XML">
            <table class="ust_tablo wp" width="100%">
              <tbody>
                <tr>
                  <td class="ust_tablo_td1">
                    <div class="cerceve">
                      <!-- Faturanın sol üst kısmında bulunan unvan alanı burada bulunuyor @SIZINUNVANINIZ -->
                      <div class="buyuk_baslik mt_1x mb_1x sizinunvaniniz">
                        <xsl:for-each select="n1:Invoice">
                          <xsl:for-each select="cac:AccountingSupplierParty">
                            <xsl:for-each select="cac:Party">
                             <xsl:for-each select="cac:PartyName/cbc:Name">
                                        <xsl:apply-templates />
                                        <span>
                                            <xsl:text> </xsl:text>
                                        </span>
                             </xsl:for-each>
                             <br/>      
                              <xsl:for-each select="cac:Person">
                                <xsl:for-each select="cbc:Title">
                                  <xsl:apply-templates />
                                  <span>
                                    <xsl:text> </xsl:text>
                                  </span>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:FirstName">
                                  <xsl:apply-templates />
                                  <xsl:text> </xsl:text>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:MiddleName">
                                  <xsl:apply-templates />
                                  <xsl:text> </xsl:text>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:FamilyName">
                                  <xsl:apply-templates />
                                  <xsl:text> </xsl:text>
                                </xsl:for-each>                             
                                <xsl:for-each select="cbc:NameSuffix">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </xsl:for-each>
                      </div>
                      <!-- Unvan alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Faturada Unvanınızın altında bulunan adres kısmı burada bulunuyor @SIZINADRESİNİZ -->
                      <div class="sizinadresiniz">
                        <span>Adres: </span>
                        <xsl:for-each select="n1:Invoice">
                          <xsl:for-each select="cac:AccountingSupplierParty">
                            <xsl:for-each select="cac:Party">
                              <xsl:for-each select="cac:PostalAddress">
                                <xsl:for-each select="cbc:StreetName">
                                  <xsl:apply-templates />
                                  <span>
                                    <xsl:text> </xsl:text>
                                  </span>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:BuildingName">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                                <xsl:if test="cbc:BuildingNumber">
                                  <span>
                                    <xsl:text> Bina No:</xsl:text>
                                  </span>
                                  <xsl:for-each select="cbc:BuildingNumber">
                                    <xsl:apply-templates />
                                  </xsl:for-each>
                                  <span>
                                    <xsl:text> </xsl:text>
                                  </span>
                                </xsl:if>
                                <xsl:if test="cbc:Room">
                                    <span>
                                        <xsl:text>Kapı No:</xsl:text>
                                    </span>
                                    <xsl:for-each select="cbc:Room">
                                        <xsl:apply-templates />
                                    </xsl:for-each>
                                    <span>
                                        <xsl:text> </xsl:text>
                                    </span>
                                </xsl:if>
                                <br />
                                <xsl:for-each select="cbc:PostalZone">
                                  <xsl:apply-templates />
                                  <span>
                                    <xsl:text> </xsl:text>
                                  </span>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:CitySubdivisionName">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                                <span>
                                  <xsl:text>/ </xsl:text>
                                </span>
                                <xsl:for-each select="cbc:CityName">
                                  <xsl:apply-templates />
                                  <span>
                                    <xsl:text> </xsl:text>
                                  </span>
                                </xsl:for-each>
                                <br/>
                                <xsl:if test="cbc:Region">
                                    <span>
                                        <xsl:text>Kasaba/Köy: </xsl:text>
                                    </span>
                                    <xsl:for-each select="cbc:Region">
                                        <xsl:apply-templates />
                                    </xsl:for-each>
                                    <span>
                                        <xsl:text> </xsl:text>
                                    </span>
                                </xsl:if>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </xsl:for-each>
                      </div>
                      <!-- Sizin adresinizin görüntülendiği alan burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- TCKN, Ticaret Sicil NO, MERSIS No, Şube No gibi bilgiler burada bulunuyor @SIZINTEKILBILGILERINIZ-->
                      <div class="sizintekilbilgileriniz">
                        <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID">
                          <xsl:value-of select="./@schemeID" />
                          <xsl:text>: </xsl:text>
                          <xsl:value-of select="." />
                          <br />
                        </xsl:for-each>
                      </div>
                      <!-- TCKN, Ticaret Sicil NO, MERSIS No Şube No bilgilerinin bulunduğu alan burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Firmanızın Vergi Dairesi alanı burada bulunuyor. @SIZINVERGIDAIRENIZ -->
                      <div class="sizinvergidaireniz">
                        <xsl:for-each select="n1:Invoice">
                          <xsl:for-each select="cac:AccountingSupplierParty">
                            <xsl:for-each select="cac:Party">
                              <xsl:text>Vergi Dairesi: </xsl:text>
                              <xsl:for-each select="cac:PartyTaxScheme">
                                <xsl:for-each select="cac:TaxScheme">
                                  <xsl:for-each select="cbc:Name">
                                    <xsl:apply-templates />
                                  </xsl:for-each>
                                </xsl:for-each>
                                <span>
                                  <xsl:text>  </xsl:text>
                                </span>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </xsl:for-each>
                      </div>
                      <!-- Firmanızın Vergi Dairesi alanı bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Firmanızın Telefon ve Fax bilgisi burada bulunuyor @SIZINTELEFONNUMARANIZ -->
                      <div class="sizintelefonnumaraniz">
                        <xsl:if test="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telephone or //n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:Telefax">
                          <xsl:for-each select="n1:Invoice">
                            <xsl:for-each select="cac:AccountingSupplierParty">
                              <xsl:for-each select="cac:Party">
                                <xsl:for-each select="cac:Contact">
                                  <xsl:if test="cbc:Telephone">
                                    <span>
                                      <xsl:text>Telefon: </xsl:text>
                                    </span>
                                    <xsl:for-each select="cbc:Telephone">
                                      <xsl:apply-templates />
                                    </xsl:for-each>
                                  </xsl:if>
                                  <div id="invoicemyfaxinfo">
                                    <xsl:if test="cbc:Telefax">
                                      <span>
                                        <xsl:text> Fax: </xsl:text>
                                      </span>
                                      <xsl:for-each select="cbc:Telefax">
                                        <xsl:apply-templates />
                                      </xsl:for-each>
                                    </xsl:if>
                                    <span>
                                      <xsl:text> </xsl:text>
                                    </span>
                                  </div>
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </xsl:if>
                      </div>
                      <!-- Firmanızın telefon ve fax alanları burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Firmanızın Web Sitesi ve E-Posta bilgileri burada yer alıyor @SIZINWEBSITENIZ -->
                      <div class="sizinwebsiteniz">
                        <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cbc:WebsiteURI">
                          <xsl:text>Web Sitesi: </xsl:text>
                          <xsl:value-of select="." />
                        </xsl:for-each>
                        <br />
                        <xsl:for-each select="//n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:Contact/cbc:ElectronicMail">
                          <xsl:text>E-Posta: </xsl:text>
                          <xsl:value-of select="." />
                        </xsl:for-each>
                      </div>
                      <!-- Web Sitesi ve E-Posta alanı burada bitiyor -->
                    </div>
                    <br/>
                    <div class="cerceve">
                      
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Alıcının unvanı burada yer alıyor. @ALICININUNVANI -->
                      <xsl:choose>
                      <xsl:when test="n1:Invoice/cbc:ProfileID = 'IHRACAT'">
                      
                      <div class="buyuk_baslik alicininunvani">
                        <xsl:for-each select="n1:Invoice">
                          <xsl:for-each select="cac:BuyerCustomerParty">
                            <xsl:for-each select="cac:Party">
                              <xsl:if test="cac:PartyName">
                                <xsl:value-of select="cac:PartyName/cbc:Name" />
                                <br />
                              </xsl:if>
                              <xsl:for-each select="cac:Person">
                                <xsl:for-each select="cbc:Title">
                                  <xsl:apply-templates />
                                  <xsl:text> </xsl:text>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:FirstName">
                                  <xsl:apply-templates />
                                  <xsl:text> </xsl:text>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:MiddleName">
                                  <xsl:apply-templates />
                                  <xsl:text>  </xsl:text>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:FamilyName">
                                  <xsl:apply-templates />
                                  <xsl:text> </xsl:text>
                                </xsl:for-each>
                                <xsl:for-each select="cbc:NameSuffix">
                                  <xsl:apply-templates />
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </xsl:for-each>
                      </div>
                      
                      
                      </xsl:when>
                      <xsl:otherwise>
                      <xsl:if test="n1:Invoice/cbc:ProfileID != 'YOLCUBERABERFATURA'">
                          <div class="buyuk_baslik alicininunvani">
                             <xsl:choose>
                             <xsl:when test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID/@schemeID = 'VKN'">
                             <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cac:AccountingCustomerParty">
                                <xsl:for-each select="cac:Party">
                             <xsl:if test="cac:PartyName">
                                    <xsl:value-of select="cac:PartyName/cbc:Name" />
                                    <br />
                                  </xsl:if>
                             </xsl:for-each>
                             </xsl:for-each>
                             </xsl:for-each>
                         
                             </xsl:when>
                             <xsl:otherwise>
                         
                             <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cac:AccountingCustomerParty">
                                <xsl:for-each select="cac:Party">
                                    <xsl:for-each select="cac:PartyName/cbc:Name">
                                        <xsl:apply-templates />
                                        <span>
                                            <xsl:text> </xsl:text>
                                        </span>
                                    </xsl:for-each>
                                    <br/>                
                                    <xsl:for-each select="cac:Person">
                                    <xsl:for-each select="cbc:Title">
                                      <xsl:apply-templates />
                                      <xsl:text> </xsl:text>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:FirstName">
                                      <xsl:apply-templates />
                                      <xsl:text> </xsl:text>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:MiddleName">
                                      <xsl:apply-templates />
                                      <xsl:text>  </xsl:text>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:FamilyName">
                                      <xsl:apply-templates />
                                      <xsl:text> </xsl:text>
                                    </xsl:for-each>
                                    <xsl:for-each select="cbc:NameSuffix">
                                      <xsl:apply-templates />
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:for-each>
                             </xsl:otherwise>
                             </xsl:choose>
                          </div>
                         </xsl:if>
                         <xsl:if test="n1:Invoice/cbc:ProfileID = 'YOLCUBERABERFATURA'">
                             <div class="buyuk_baslik alicininunvani">
                                 <xsl:text>SAYIN</xsl:text>
                             </div>
                         </xsl:if>
                       </xsl:otherwise>
                    </xsl:choose>
                      <!-- Alıcının unvanının bulunduğu alan burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Alıcının adresi burada yer alıyor @ALICININADRESI -->
                      <xsl:choose>
                      <xsl:when test="n1:Invoice/cbc:ProfileID = 'IHRACAT'">
                      <xsl:if test="n1:Invoice/cbc:ProfileID != 'YOLCUBERABERFATURA'">
                          <div class="alicininadresi">
                            <span>Adres: </span>
                            <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cac:BuyerCustomerParty">
                                <xsl:for-each select="cac:Party">
                                  <xsl:for-each select="cac:PostalAddress">
                                    <span class="adres_sokak">
                                      <xsl:for-each select="cbc:StreetName">
                                        <xsl:apply-templates />
                                        <xsl:text> </xsl:text>
                                      </xsl:for-each>
                                    </span>
                                    <span class="adres_bina">
                                      <xsl:for-each select="cbc:BuildingName">
                                        <xsl:apply-templates />
                                      </xsl:for-each>
                                      <xsl:if test="cbc:BuildingNumber">
                                        <xsl:text> Bina No:</xsl:text>
                                        <xsl:for-each select="cbc:BuildingNumber">
                                          <xsl:apply-templates />
                                        </xsl:for-each>
                                        <xsl:if test="cbc:Room">
                                          <xsl:text> Kapı No:</xsl:text>
                                          <xsl:for-each select="cbc:Room">
                                          <xsl:apply-templates />
                                        </xsl:for-each>
                                        <xsl:text> </xsl:text>
                                        </xsl:if>
                                        <br/>
                                        <xsl:for-each select="cbc:PostalZone">
                                          <xsl:apply-templates />
                                          <xsl:text> </xsl:text>
                                        </xsl:for-each>
                                      </xsl:if>
                                    </span>
                                    <span class="adres_il_ilce">
                                      <span class="adres_ilce">
                                        <xsl:for-each select="cbc:CitySubdivisionName">
                                          <xsl:apply-templates />
                                        </xsl:for-each>
                                        <xsl:text>/ </xsl:text>
                                      </span>
                                      <span class="adres_il">
                                        <xsl:for-each select="cbc:CityName">
                                          <xsl:apply-templates />
                                        </xsl:for-each>
                                      </span>
                                    </span>
                                    <br/>
                                    <xsl:if test="cbc:Region">
                                        <xsl:text> Kasaba/Köy: </xsl:text>
                                        <xsl:for-each select="cbc:Region">
                                            <xsl:apply-templates />
                                        </xsl:for-each>
                                        <xsl:text> </xsl:text>
                                    </xsl:if>
                                    <br/> 
                                    <span class="adres_il_ilce">
                                    <xsl:for-each select="cac:Country">
                                        <xsl:for-each select="cbc:Name">
                                        <xsl:apply-templates />
                                        </xsl:for-each>
                                    </xsl:for-each>
                                    </span>
                                    <br/>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:for-each>
                            <br/>
                            <xsl:for-each select="//n1:Invoice/cac:BuyerCustomerParty/cac:Party/cac:PartyIdentification">
                                    <xsl:value-of select="cbc:ID/@schemeID" />
                                    <xsl:text>: </xsl:text>
                                  <xsl:value-of select="cbc:ID" />
                            </xsl:for-each>
                          </div>
                      </xsl:if>
                      </xsl:when>
                      <xsl:otherwise>
                      <xsl:if test="n1:Invoice/cbc:ProfileID != 'YOLCUBERABERFATURA'">
                          <div class="alicininadresi">
                            <span>Adres: </span>
                            <xsl:for-each select="n1:Invoice">
                              <xsl:for-each select="cac:AccountingCustomerParty">
                                <xsl:for-each select="cac:Party">
                                  <xsl:for-each select="cac:PostalAddress">
                                    <span class="adres_sokak">
                                      <xsl:for-each select="cbc:StreetName">
                                        <xsl:apply-templates />
                                        <xsl:text> </xsl:text>
                                      </xsl:for-each>
                                    </span>
                                    <span class="adres_bina">
                                      <xsl:for-each select="cbc:BuildingName">
                                        <xsl:apply-templates />
                                      </xsl:for-each>
                                      <xsl:if test="cbc:BuildingNumber">
                                        <xsl:text> Bina No:</xsl:text>
                                        <xsl:for-each select="cbc:BuildingNumber">
                                          <xsl:apply-templates />
                                        </xsl:for-each>
                                        <xsl:text> </xsl:text>
                                        <xsl:if test="cbc:Room">
                                            <span>
                                                <xsl:text>Kapı No:</xsl:text>
                                            </span>
                                            <xsl:for-each select="cbc:Room">
                                                <xsl:apply-templates />
                                            </xsl:for-each>
                                            <span>
                                                <xsl:text> </xsl:text>
                                            </span>
                                        </xsl:if>
                                        <xsl:for-each select="cbc:PostalZone">
                                          <xsl:apply-templates />
                                          <xsl:text> </xsl:text>
                                        </xsl:for-each>
                                      </xsl:if>
                                    </span>
                                    <span class="adres_il_ilce">
                                      <span class="adres_ilce">
                                        <xsl:for-each select="cbc:CitySubdivisionName">
                                          <xsl:apply-templates />
                                        </xsl:for-each>
                                        <xsl:text>/ </xsl:text>
                                      </span>
                                      <span class="adres_il">
                                        <xsl:for-each select="cbc:CityName">
                                          <xsl:apply-templates />
                                        </xsl:for-each>
                                      </span>
                                    </span>
                                    <br/>
                                    <xsl:for-each select="cbc:Region">
                                        <xsl:text>Kasaba/Köy: </xsl:text>
                                        <xsl:apply-templates/>
                                        <xsl:text>&#160;</xsl:text>
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:for-each>
                          </div>
                        </xsl:if>
                      </xsl:otherwise>
                      </xsl:choose>
                      <xsl:choose>
                       <xsl:when test="n1:Invoice/cbc:ProfileID = 'IHRACAT'">
                       
                      </xsl:when>
                      <xsl:otherwise>
                      <!-- Alıcının adresinin yer aldığı alan burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <div>
                        <div>
                          <!-- TCKN, Ticaret Sicil NO, MERSIS No, Şube No gibi bilgiler burada bulunuyor @ALICININTEKILBILGILERI -->
                        <xsl:if test="n1:Invoice/cbc:ProfileID != 'YOLCUBERABERFATURA'">
                          <div class="party_key_val alicinintekilbilgileri">
                            <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification">
                              <xsl:value-of select="cbc:ID/@schemeID" />
                              <xsl:text>: </xsl:text>
                              <xsl:value-of select="cbc:ID" />
                              <br />
                            </xsl:for-each>
                          </div>
                        </xsl:if>
                         <!-- TCKN, Ticaret Sicil NO, MERSIS No Şube No bilgilerinin bulunduğu alan burada bitiyor -->
                            <!--Alıcının Ad ve Soyad bilgileri alanı burada bulunuyor-->
                        <xsl:if test="n1:Invoice/cbc:ProfileID = 'YOLCUBERABERFATURA'">
                          <div class="party_key_val alicinintekilbilgileri">
                            <xsl:for-each select="//n1:Invoice/cac:BuyerCustomerParty/cac:Party/cac:Person">
                              <xsl:value-of select="cbc:FirstName" />
                              <xsl:text> </xsl:text>
                              <xsl:value-of select="cbc:FamilyName" />
                              <br />
                            </xsl:for-each>
                          </div>
                        </xsl:if>
                            <!--Alıcının Ad ve Soyad bilgileri alanı burada bitiyor.-->
                          <!-- /////////////////////MİKRO///////////////////////////// -->
                          <!-- Alıcının Vergi Dairesi alanı burada bulunuyor. @ALICININVERGIDAIRESI -->
                        <xsl:if test="n1:Invoice/cbc:ProfileID != 'YOLCUBERABERFATURA'">
                          <div id="invoicecustomertaxinfo" class="party_key_val alicininvergidairesi">
                            <xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyTaxScheme/cac:TaxScheme/cbc:Name">
                              <xsl:for-each select="n1:Invoice">
                                <xsl:for-each select="cac:AccountingCustomerParty">
                                  <xsl:for-each select="cac:Party">
                                    <span>
                                      <xsl:text>Vergi Dairesi</xsl:text>
                                    </span>
                                    <span>
                                      <xsl:text>: </xsl:text>
                                    </span>
                                    <span>
                                      <xsl:for-each select="cac:PartyTaxScheme">
                                        <xsl:for-each select="cac:TaxScheme">
                                          <xsl:for-each select="cbc:Name">
                                            <xsl:apply-templates />
                                          </xsl:for-each>
                                        </xsl:for-each>
                                      </xsl:for-each>
                                    </span>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:if>
                          </div>
                        </xsl:if>
                            <!-- Alıcının Vergi Dairesi alanı bitiyor -->
                            <!-- Alıcının -yolcuberaber olması durumunda- pasaport no ve ülke bilgileri alanı burada bulunuyor. @ALICININVERGIDAIRESI -->
                        <xsl:if test="n1:Invoice/cbc:ProfileID = 'YOLCUBERABERFATURA'">
                          <div class="party_key_val alicinintekilbilgileri">
                            <xsl:for-each select="//n1:Invoice/cac:BuyerCustomerParty/cac:Party/cac:Person/cac:IdentityDocumentReference">
                              <xsl:text>Pasaport No: </xsl:text>
                              <xsl:value-of select="cbc:ID" />
                              <br />
                            </xsl:for-each>
                          </div>
                        </xsl:if>
                            
                        <xsl:if test="n1:Invoice/cbc:ProfileID = 'YOLCUBERABERFATURA'">
                          <div class="party_key_val alicinintekilbilgileri">
                            <xsl:for-each select="//n1:Invoice/cac:BuyerCustomerParty/cac:Party/cac:Person">
                              <xsl:text>Ülkesi: </xsl:text>
                              <xsl:value-of select="cbc:NationalityID" />
                              <br />
                            </xsl:for-each>
                          </div>
                        </xsl:if>
                          <!-- Alıcının -yolcuberaber olması durumunda- pasaport no ve ülke bilgileri alanı burada bitiyor. @ALICININVERGIDAIRESI -->
                          <!-- /////////////////////MİKRO///////////////////////////// -->
                          <!-- Alıcının Telefon ve Fax bilgisi burada bulunuyor @ALICININTELEFONNUMARASI -->
                          <div class="alicinintelefonnumarasi">
                            <xsl:if test="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telephone or //n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:Telefax">
                              <xsl:for-each select="n1:Invoice">
                                <xsl:for-each select="cac:AccountingCustomerParty">
                                  <xsl:for-each select="cac:Party">
                                    <xsl:for-each select="cac:Contact">
                                      <xsl:if test="cbc:Telephone">
                                        <div class="party_key_val">
                                          <span>
                                            <xsl:text>Telefon</xsl:text>
                                          </span>
                                          <span>
                                            <xsl:text>:</xsl:text>
                                          </span>
                                          <span>
                                            <xsl:for-each select="cbc:Telephone">
                                              <xsl:apply-templates />
                                            </xsl:for-each>
                                          </span>
                                        </div>
                                      </xsl:if>
                                      <span id="invoicecustomerfaxinfo">
                                        <xsl:if test="cbc:Telefax">
                                          <div class="party_key_val">
                                            <span>
                                              <xsl:text>Fax</xsl:text>
                                            </span>
                                            <span>
                                              <xsl:text>:</xsl:text>
                                            </span>
                                            <span>
                                              <xsl:for-each select="cbc:Telefax">
                                                <xsl:apply-templates />
                                              </xsl:for-each>
                                            </span>
                                          </div>
                                        </xsl:if>
                                      </span>
                                    </xsl:for-each>
                                  </xsl:for-each>
                                </xsl:for-each>
                              </xsl:for-each>
                            </xsl:if>
                          </div>
                          <!-- Alıcının telefon ve fax alanları burada bitiyor -->
                          <!-- /////////////////////MİKRO///////////////////////////// -->
                          <!-- Alıcının E-Posta bilgileri burada yer alıyor @ALICININEPOSTASI -->
                          <div class="alicininepostasi">
                            <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:Contact/cbc:ElectronicMail">
                              <div class="party_key_val">
                                <span>
                                  <xsl:text>E-Posta</xsl:text>
                                </span>
                                <span>
                                  <xsl:text>:</xsl:text>
                                </span>
                                <span>
                                  <xsl:value-of select="." />
                                </span>
                              </div>
                            </xsl:for-each>
                          </div>
                          <!-- Alıcının E-Posta alanı burada bitiyor -->

                            <!-- Alıcının Bayi NO bilgileri burada yer alıyor -->
                            <div class="alicininepostasi">
                                <xsl:for-each select="//n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:AgentParty/cac:PartyIdentification/cbc:ID">
                                    <div class="party_key_val">
                                        <span>
                                            <xsl:text>Bayi No</xsl:text>
                                        </span>
                                        <span>
                                            <xsl:text>:</xsl:text>
                                        </span>
                                        <span>
                                            <xsl:value-of select="." />
                                        </span>
                                    </div>
                                </xsl:for-each>
                            </div>
                            <!-- Alıcının Bayi no alanı burada bitiyor -->
                        </div>
                        <xsl:if test="//n1:Invoice/cac:Delivery/cac:DeliveryAddress">
                          <br />
                          <br />
                          <div class="teslimatadresi">
                            <div class="party_key_val">
                              <span>
                                <xsl:text>Teslimat Adresi</xsl:text>
                              </span>
                              <span>
                                <xsl:text>:</xsl:text>
                              </span>
                              <span>
                                <xsl:value-of select="//n1:Invoice/cac:Delivery/cac:DeliveryAddress" />
                              </span>
                            </div>
                          </div>
                        </xsl:if>
                      </div>
                      </xsl:otherwise>
                      </xsl:choose>
                    
                      </div>
                   
                  </td>
                  <td class="ust_tablo_td2">
                    <div class="txt_center ">
                        <img class="gib_logo" alt="E-Fatura Logo" src="data:image/jpeg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAeAAD/4QMpaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjYtYzE0MiA3OS4xNjA5MjQsIDIwMTcvMDcvMTMtMDE6MDY6MzkgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjRCQzE1RTU0QkY1NzExRThBQTUyQzg5NzEyOENBRkFGIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjRCQzE1RTUzQkY1NzExRThBQTUyQzg5NzEyOENBRkFGIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDUzQgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjZDNDJBNEI1QjVCRDExRThCQjM0REIwQkZGMEQxODY0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjZDNDJBNEI2QjVCRDExRThCQjM0REIwQkZGMEQxODY0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+/+4ADkFkb2JlAGTAAAAAAf/bAIQAEAsLCwwLEAwMEBcPDQ8XGxQQEBQb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" />
                        <br />
                        <div class="txt_center mt_1x f_bold_big mb_1x">e-Fatura</div>                      
                    </div>
                  </td>
                  <td class="ust_tablo_td3">
                      
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                        <!-- Faturadaki QR Kod alanı burada bulunuyor @QRKOD-->
                        <div id="invoiceqrcode">
                            <div id="qrcode" style="margin-bottom:10px" />
                            <div id="qrvalue" style="visibility: hidden;height: 20px;width: 20px; display:none">
                            {"vkntckn":"<xsl:value-of select="n1:Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='TCKN' or @schemeID='VKN']"/>",
                            "avkntckn":"<xsl:value-of select="n1:Invoice/cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID[@schemeID='TCKN' or @schemeID='VKN']"/>",
                            "senaryo":"<xsl:value-of select="n1:Invoice/cbc:ProfileID"/>",
                            "tip":"<xsl:value-of select="n1:Invoice/cbc:InvoiceTypeCode"/>",
                            "tarih":"<xsl:value-of select="n1:Invoice/cbc:IssueDate"/>",
                            "no":"<xsl:value-of select="n1:Invoice/cbc:ID"/>",
                            "ettn":"<xsl:value-of select="n1:Invoice/cbc:UUID"/>",
                            "parabirimi":"<xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />",
                            "malhizmettoplam":"<xsl:value-of select="n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount" />",
                            <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']">
                            <xsl:text>"kdvmatrah</xsl:text>(<xsl:value-of select="cbc:Percent"
                            />)":"<xsl:value-of select="cbc:TaxableAmount"/>",
                            </xsl:for-each>
                            <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode='0015']">
                            <xsl:text>"hesaplanankdv</xsl:text>(<xsl:value-of select="cbc:Percent"
                            />)":"<xsl:value-of select="cbc:TaxAmount"/>",
                            </xsl:for-each>"vergidahil":"<xsl:value-of select="n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount" />",
                            "odenecek":"<xsl:value-of select="n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount"/>"
                            }</div>
                            <script type="text/javascript">
                                <![CDATA[
                                        var QRCode;!function(){function a(a){this.mode=c.MODE_8BIT_BYTE,this.data=a,this.parsedData=[];for(var b=[],d=0,e=this.data.length;e>d;d++){var f=this.data.charCodeAt(d);f>65536?(b[0]=240|(1835008&f)>>>18,b[1]=128|(258048&f)>>>12,b[2]=128|(4032&f)>>>6,b[3]=128|63&f):f>2048?(b[0]=224|(61440&f)>>>12,b[1]=128|(4032&f)>>>6,b[2]=128|63&f):f>128?(b[0]=192|(1984&f)>>>6,b[1]=128|63&f):b[0]=f,this.parsedData=this.parsedData.concat(b)}this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239))}function b(a,b){this.typeNumber=a,this.errorCorrectLevel=b,this.modules=null,this.moduleCount=0,this.dataCache=null,this.dataList=[]}function i(a,b){if(void 0==a.length)throw new Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=new Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]}function j(a,b){this.totalCount=a,this.dataCount=b}function k(){this.buffer=[],this.length=0}function m(){return"undefined"!=typeof CanvasRenderingContext2D}function n(){var a=!1,b=navigator.userAgent;return/android/i.test(b)&&(a=!0,aMat=b.toString().match(/android ([0-9]\.[0-9])/i),aMat&&aMat[1]&&(a=parseFloat(aMat[1]))),a}function r(a,b){for(var c=1,e=s(a),f=0,g=l.length;g>=f;f++){var h=0;switch(b){case d.L:h=l[f][0];break;case d.M:h=l[f][1];break;case d.Q:h=l[f][2];break;case d.H:h=l[f][3]}if(h>=e)break;c++}if(c>l.length)throw new Error("Too long data");return c}function s(a){var b=encodeURI(a).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return b.length+(b.length!=a?3:0)}a.prototype={getLength:function(){return this.parsedData.length},write:function(a){for(var b=0,c=this.parsedData.length;c>b;b++)a.put(this.parsedData[b],8)}},b.prototype={addData:function(b){var c=new a(b);this.dataList.push(c),this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw new Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,c){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++){this.modules[d]=new Array(this.moduleCount);for(var e=0;e<this.moduleCount;e++)this.modules[d][e]=null}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(a,c),this.typeNumber>=7&&this.setupTypeNumber(a),null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,c)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=c>=0&&6>=c&&(0==d||6==d)||d>=0&&6>=d&&(0==c||6==c)||c>=2&&4>=c&&d>=2&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);(0==c||a>d)&&(a=d,b=c)}return b},createMovieClip:function(a,b,c){var d=a.createEmptyMovieClip(b,c),e=1;this.make();for(var f=0;f<this.modules.length;f++)for(var g=f*e,h=0;h<this.modules[f].length;h++){var i=h*e,j=this.modules[f][h];j&&(d.beginFill(0,100),d.moveTo(i,g),d.lineTo(i+e,g),d.lineTo(i+e,g+e),d.lineTo(i,g+e),d.endFill())}return d},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2);for(var b=8;b<this.moduleCount-8;b++)null==this.modules[6][b]&&(this.modules[6][b]=0==b%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(var c=0;18>c;c++){var d=!a&&1==(1&b>>c);this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d}},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(1&d>>e);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(var e=0;15>e;e++){var g=!a&&1==(1&d>>e);8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g}this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;h>0;h-=2)for(6==h&&h--;;){for(var i=0;2>i;i++)if(null==this.modules[d][h-i]){var j=!1;g<a.length&&(j=1==(1&a[g]>>>e));var k=f.getMask(b,d,h-i);k&&(j=!j),this.modules[d][h-i]=j,e--,-1==e&&(g++,e=7)}if(d+=c,0>d||this.moduleCount<=d){d-=c,c=-c;break}}}},b.PAD0=236,b.PAD1=17,b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var i=d[h];g.put(i.mode,4),g.put(i.getLength(),f.getLengthInBits(i.mode,a)),i.write(g)}for(var l=0,h=0;h<e.length;h++)l+=e[h].dataCount;if(g.getLengthInBits()>8*l)throw new Error("code length overflow. ("+g.getLengthInBits()+">"+8*l+")");for(g.getLengthInBits()+4<=8*l&&g.put(0,4);0!=g.getLengthInBits()%8;)g.putBit(!1);for(;;){if(g.getLengthInBits()>=8*l)break;if(g.put(b.PAD0,8),g.getLengthInBits()>=8*l)break;g.put(b.PAD1,8)}return b.createBytes(g,e)},b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=new Array(b.length),h=new Array(b.length),j=0;j<b.length;j++){var k=b[j].dataCount,l=b[j].totalCount-k;d=Math.max(d,k),e=Math.max(e,l),g[j]=new Array(k);for(var m=0;m<g[j].length;m++)g[j][m]=255&a.buffer[m+c];c+=k;var n=f.getErrorCorrectPolynomial(l),o=new i(g[j],n.getLength()-1),p=o.mod(n);h[j]=new Array(n.getLength()-1);for(var m=0;m<h[j].length;m++){var q=m+p.getLength()-h[j].length;h[j][m]=q>=0?p.get(q):0}}for(var r=0,m=0;m<b.length;m++)r+=b[m].totalCount;for(var s=new Array(r),t=0,m=0;d>m;m++)for(var j=0;j<b.length;j++)m<g[j].length&&(s[t++]=g[j][m]);for(var m=0;e>m;m++)for(var j=0;j<b.length;j++)m<h[j].length&&(s[t++]=h[j][m]);return s};for(var c={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},d={L:1,M:0,Q:3,H:2},e={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;f.getBCHDigit(b)-f.getBCHDigit(f.G15)>=0;)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;f.getBCHDigit(b)-f.getBCHDigit(f.G18)>=0;)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case e.PATTERN000:return 0==(b+c)%2;case e.PATTERN001:return 0==b%2;case e.PATTERN010:return 0==c%3;case e.PATTERN011:return 0==(b+c)%3;case e.PATTERN100:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case e.PATTERN101:return 0==b*c%2+b*c%3;case e.PATTERN110:return 0==(b*c%2+b*c%3)%2;case e.PATTERN111:return 0==(b*c%3+(b+c)%2)%2;default:throw new Error("bad maskPattern:"+a)}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;a>c;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(b>=1&&10>b)switch(a){case c.MODE_NUMBER:return 10;case c.MODE_ALPHA_NUM:return 9;case c.MODE_8BIT_BYTE:return 8;case c.MODE_KANJI:return 8;default:throw new Error("mode:"+a)}else if(27>b)switch(a){case c.MODE_NUMBER:return 12;case c.MODE_ALPHA_NUM:return 11;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 10;default:throw new Error("mode:"+a)}else{if(!(41>b))throw new Error("type:"+b);switch(a){case c.MODE_NUMBER:return 14;case c.MODE_ALPHA_NUM:return 13;case c.MODE_8BIT_BYTE:return 16;case c.MODE_KANJI:return 12;default:throw new Error("mode:"+a)}}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;b>d;d++)for(var e=0;b>e;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||d+h>=b))for(var i=-1;1>=i;i++)0>e+i||e+i>=b||(0!=h||0!=i)&&g==a.isDark(d+h,e+i)&&f++;f>5&&(c+=3+f-5)}for(var d=0;b-1>d;d++)for(var e=0;b-1>e;e++){var j=0;a.isDark(d,e)&&j++,a.isDark(d+1,e)&&j++,a.isDark(d,e+1)&&j++,a.isDark(d+1,e+1)&&j++,(0==j||4==j)&&(c+=3)}for(var d=0;b>d;d++)for(var e=0;b-6>e;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(var e=0;b>e;e++)for(var d=0;b-6>d;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(var k=0,e=0;b>e;e++)for(var d=0;b>d;d++)a.isDark(d,e)&&k++;var l=Math.abs(100*k/b/b-50)/5;return c+=10*l}},g={glog:function(a){if(1>a)throw new Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;a>=256;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:new Array(256),LOG_TABLE:new Array(256)},h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(var h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(var h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=new Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(this.getLength()-a.getLength()<0)return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=new Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(var d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return new i(c,0).mod(a)}},j.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],j.getRSBlocks=function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw new Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;d>f;f++)for(var g=c[3*f+0],h=c[3*f+1],i=c[3*f+2],k=0;g>k;k++)e.push(new j(h,i));return e},j.getRsBlockTable=function(a,b){switch(b){case d.L:return j.RS_BLOCK_TABLE[4*(a-1)+0];case d.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case d.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case d.H:return j.RS_BLOCK_TABLE[4*(a-1)+3];default:return void 0}},k.prototype={get:function(a){var b=Math.floor(a/8);return 1==(1&this.buffer[b]>>>7-a%8)},put:function(a,b){for(var c=0;b>c;c++)this.putBit(1==(1&a>>>b-c-1))},getLengthInBits:function(){return this.length},putBit:function(a){var b=Math.floor(this.length/8);this.buffer.length<=b&&this.buffer.push(0),a&&(this.buffer[b]|=128>>>this.length%8),this.length++}};var l=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]],o=function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){function g(a,b){var c=document.createElementNS("http://www.w3.org/2000/svg",a);for(var d in b)b.hasOwnProperty(d)&&c.setAttribute(d,b[d]);return c}var b=this._htOption,c=this._el,d=a.getModuleCount();Math.floor(b.width/d),Math.floor(b.height/d),this.clear();var h=g("svg",{viewBox:"0 0 "+String(d)+" "+String(d),width:"100%",height:"100%",fill:b.colorLight});h.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink"),c.appendChild(h),h.appendChild(g("rect",{fill:b.colorDark,width:"1",height:"1",id:"template"}));for(var i=0;d>i;i++)for(var j=0;d>j;j++)if(a.isDark(i,j)){var k=g("use",{x:String(i),y:String(j)});k.setAttributeNS("http://www.w3.org/1999/xlink","href","#template"),h.appendChild(k)}},a.prototype.clear=function(){for(;this._el.hasChildNodes();)this._el.removeChild(this._el.lastChild)},a}(),p="svg"===document.documentElement.tagName.toLowerCase(),q=p?o:m()?function(){function a(){this._elImage.src=this._elCanvas.toDataURL("image/png"),this._elImage.style.display="block",this._elCanvas.style.display="none"}function d(a,b){var c=this;if(c._fFail=b,c._fSuccess=a,null===c._bSupportDataURI){var d=document.createElement("img"),e=function(){c._bSupportDataURI=!1,c._fFail&&_fFail.call(c)},f=function(){c._bSupportDataURI=!0,c._fSuccess&&c._fSuccess.call(c)};return d.onabort=e,d.onerror=e,d.onload=f,d.src="data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",void 0}c._bSupportDataURI===!0&&c._fSuccess?c._fSuccess.call(c):c._bSupportDataURI===!1&&c._fFail&&c._fFail.call(c)}if(this._android&&this._android<=2.1){var b=1/window.devicePixelRatio,c=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(a,d,e,f,g,h,i,j){if("nodeName"in a&&/img/i.test(a.nodeName))for(var l=arguments.length-1;l>=1;l--)arguments[l]=arguments[l]*b;else"undefined"==typeof j&&(arguments[1]*=b,arguments[2]*=b,arguments[3]*=b,arguments[4]*=b);c.apply(this,arguments)}}var e=function(a,b){this._bIsPainted=!1,this._android=n(),this._htOption=b,this._elCanvas=document.createElement("canvas"),this._elCanvas.width=b.width,this._elCanvas.height=b.height,a.appendChild(this._elCanvas),this._el=a,this._oContext=this._elCanvas.getContext("2d"),this._bIsPainted=!1,this._elImage=document.createElement("img"),this._elImage.style.display="none",this._el.appendChild(this._elImage),this._bSupportDataURI=null};return e.prototype.draw=function(a){var b=this._elImage,c=this._oContext,d=this._htOption,e=a.getModuleCount(),f=d.width/e,g=d.height/e,h=Math.round(f),i=Math.round(g);b.style.display="none",this.clear();for(var j=0;e>j;j++)for(var k=0;e>k;k++){var l=a.isDark(j,k),m=k*f,n=j*g;c.strokeStyle=l?d.colorDark:d.colorLight,c.lineWidth=1,c.fillStyle=l?d.colorDark:d.colorLight,c.fillRect(m,n,f,g),c.strokeRect(Math.floor(m)+.5,Math.floor(n)+.5,h,i),c.strokeRect(Math.ceil(m)-.5,Math.ceil(n)-.5,h,i)}this._bIsPainted=!0},e.prototype.makeImage=function(){this._bIsPainted&&d.call(this,a)},e.prototype.isPainted=function(){return this._bIsPainted},e.prototype.clear=function(){this._oContext.clearRect(0,0,this._elCanvas.width,this._elCanvas.height),this._bIsPainted=!1},e.prototype.round=function(a){return a?Math.floor(1e3*a)/1e3:a},e}():function(){var a=function(a,b){this._el=a,this._htOption=b};return a.prototype.draw=function(a){for(var b=this._htOption,c=this._el,d=a.getModuleCount(),e=Math.floor(b.width/d),f=Math.floor(b.height/d),g=['<table style="border:0;border-collapse:collapse;">'],h=0;d>h;h++){g.push("<tr>");for(var i=0;d>i;i++)g.push('<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:'+e+"px;height:"+f+"px;background-color:"+(a.isDark(h,i)?b.colorDark:b.colorLight)+';"></td>');g.push("</tr>")}g.push("</table>"),c.innerHTML=g.join("");var j=c.childNodes[0],k=(b.width-j.offsetWidth)/2,l=(b.height-j.offsetHeight)/2;k>0&&l>0&&(j.style.margin=l+"px "+k+"px")},a.prototype.clear=function(){this._el.innerHTML=""},a}();QRCode=function(a,b){if(this._htOption={width:256,height:256,typeNumber:4,colorDark:"#000000",colorLight:"#ffffff",correctLevel:d.H},"string"==typeof b&&(b={text:b}),b)for(var c in b)this._htOption[c]=b[c];"string"==typeof a&&(a=document.getElementById(a)),this._android=n(),this._el=a,this._oQRCode=null,this._oDrawing=new q(this._el,this._htOption),this._htOption.text&&this.makeCode(this._htOption.text)},QRCode.prototype.makeCode=function(a){this._oQRCode=new b(r(a,this._htOption.correctLevel),this._htOption.correctLevel),this._oQRCode.addData(a),this._oQRCode.make(),this._el.title=a,this._oDrawing.draw(this._oQRCode),this.makeImage()},QRCode.prototype.makeImage=function(){"function"==typeof this._oDrawing.makeImage&&(!this._android||this._android>=3)&&this._oDrawing.makeImage()},QRCode.prototype.clear=function(){this._oDrawing.clear()},QRCode.CorrectLevel=d}();
                                    ]]>
                                var qrcode = new QRCode(document.getElementById("qrcode"), { width : 180, height : 180, correctLevel : QRCode.CorrectLevel.M }); function makeCode (msg) {  var elText = document.getElementById("text"); qrcode.makeCode(msg); } makeCode(document.getElementById("qrvalue").innerHTML.replace(/\s/g,''));
                            </script>
                        </div>
                        <!-- QR Kod alanı burada bitiyor -->
                          
                      <div class="mb_1x"  style="margin-bottom: 10px;">
                                <div class="baslik1 lh_3x">
                                <!-- /////////////////////MİKRO///////////////////////////// -->
                                <!-- Logonuzu aşağıdaki alana ekleyebilirsiniz @LOGO-->
                              <logoholder class="logo-holder mb_1x logo" id="logoholder">
                                 <img src="data:image/jpeg;base64,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" />
                                
                                  </logoholder> 
                                
                                <!-- /////////////////////MİKRO///////////////////////////// -->
                                </div>
                              </div>
                      <table>
                          <tbody>
                              <tr class="invoicecustomization ozellestirmeno">
                                  <td class="lineTableBudgetTd invoicecustomization">
                                      <xsl:text>ÖZELLEŞTİRME NO :</xsl:text>
                                  </td>
                                  <td class="lineTableBudgetTr">
                                        <xsl:for-each select="//n1:Invoice/cbc:CustomizationID">
                                          <xsl:value-of select="."></xsl:value-of>
                                        </xsl:for-each>
                                  </td>
                              </tr>
                              <tr class="invoiceinvoicetype faturatipi">
                                  <td class="lineTableBudgetTd">
                                      <xsl:text>FATURA TİPİ :</xsl:text>
                                  </td>
                                  <td class="lineTableBudgetTr">
                                         <xsl:for-each select="//n1:Invoice/cbc:InvoiceTypeCode">
                                            <xsl:value-of select="."></xsl:value-of>
                                         </xsl:for-each>
                                  </td>
                              </tr>
                              <tr class="invoicenumber faturano">
                                  <td class="lineTableBudgetTd">
                                      <xsl:text>FATURA NO :</xsl:text>
                                  </td>
                                  <td class="lineTableBudgetTr">
                                          <xsl:for-each select="n1:Invoice">
                                             <xsl:for-each select="cbc:ID">
                                             <xsl:apply-templates />
                                            </xsl:for-each>
                                          </xsl:for-each>
                                  </td>
                              </tr>
                              <tr class="faturatarihi">
                                  <td class="lineTableBudgetTd">
                                      <xsl:text>FATURA TARİHİ :</xsl:text>
                                  </td>
                                  <td class="lineTableBudgetTr">
                                         <xsl:for-each select="//n1:Invoice/cbc:IssueDate">
                                            <xsl:value-of select="substring(.,9,2)" />-<xsl:value-of select="substring(.,6,2)" />-<xsl:value-of select="substring(.,1,4)" />
                                         </xsl:for-each>
                                  </td>
                              </tr>
                              <tr class="faturazamanı">
                                  <td class="lineTableBudgetTd">
                                      <xsl:text>FATURA ZAMANI :</xsl:text>
                                  </td>
                                  <td class="lineTableBudgetTr">
                                         <xsl:for-each select="n1:Invoice">
                                          <xsl:for-each select="cbc:IssueTime">
                                            <xsl:apply-templates />
                                          </xsl:for-each>
                                        </xsl:for-each>
                                  </td>
                              </tr>
                              <tr class="invoiceprofile senaryo">
                                  <td class="lineTableBudgetTd ">
                                      <xsl:text>SENARYO :</xsl:text>
                                  </td>
                                  <td class="lineTableBudgetTr">
                                          <xsl:for-each select="//n1:Invoice/cbc:ProfileID">
                                            <xsl:value-of select="."></xsl:value-of>
                                          </xsl:for-each>
                                  </td>
                              </tr>
                            
                            
                            <tr class="invoiceprofile senaryo">
                               <td class="lineTableBudgetTd ">
                                    <span style="font-weight:bold; ">
                                        <xsl:text>Son Ödeme Tarihi:</xsl:text>
                                    </span>
                                </td>
                             <td class="lineTableBudgetTr">
                                     <xsl:for-each
                                    select="n1:Invoice/cac:PaymentMeans">
                                        <xsl:for-each select="cbc:PaymentDueDate">
                                            <xsl:value-of select="substring(.,9,2)"
                                                />-<xsl:value-of select="substring(.,6,2)"
                                                />-<xsl:value-of select="substring(.,1,4)"/>
                                        </xsl:for-each>
                                    </xsl:for-each>
                                </td>
                            </tr>
                            
                            
                             <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                        <xsl:if test="../cbc:DocumentType">
                          <xsl:if test="../cbc:DocumentTypeCode='KOBI_BILGISI'">
                            <tr>
                              <th>
                                <xsl:text>Kobi Bilgisi:</xsl:text>
                              </th>
                              <td>
                                <xsl:value-of select="." />
                              </td>
                            </tr>
                          </xsl:if>
                        </xsl:if>
                      </xsl:for-each>
                            
                      <xsl:for-each select="//n1:Invoice/cac:AdditionalDocumentReference/cbc:DocumentType">
                        <xsl:if test="../cbc:DocumentType">
                          <xsl:if test="../cbc:DocumentTypeCode='EYDEP_BILGISI'">
                            <tr>
                              <th>
                                <xsl:text>EYDEP Bilgisi:</xsl:text>
                              </th>
                              <td>
                                <xsl:value-of select="." />
                              </td>
                            </tr>
                          </xsl:if>
                        </xsl:if>
                      </xsl:for-each>
                            
                            <xsl:if
                                                  
                           test="//n1:Invoice/cac:PaymentMeans/cbc:PaymentDueDate">
                            <tr style="height:13px">
                                <td class="lineTableBudgetTd" align="left">
                                    <span style="font-weight:bold; ">
                                        <xsl:text>Vade Tarihi:</xsl:text>
                                    </span>
                                </td>
                                <td align="left">
                                    <xsl:for-each
                                    select="n1:Invoice/cac:PaymentMeans">
                                        <xsl:for-each select="cbc:PaymentDueDate">
                                            <xsl:value-of select="substring(.,9,2)"
                                                />-<xsl:value-of select="substring(.,6,2)"
                                                />-<xsl:value-of select="substring(.,1,4)"/>
                                        </xsl:for-each>
                                    </xsl:for-each>
                                </td>
                            </tr>
                                            </xsl:if>
                            
                            
                            
                            
                            
                            
                            
                              <tr class="invoiceprofile aracıkurumvkn">
                                  <xsl:if test="n1:Invoice/cbc:ProfileID = 'YOLCUBERABERFATURA'">
                                      <td class="lineTableBudgetTd">
                                          <xsl:text>ARACI KURUM VKN :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr">
                                          <xsl:value-of select="//n1:Invoice/cac:TaxRepresentativeParty/cac:PartyIdentification/cbc:ID" />
                                      </td>
                                  </xsl:if>
                              </tr>
                              <tr class="invoiceprofile aracıkurumunvan">
                                  <xsl:if test="n1:Invoice/cbc:ProfileID = 'YOLCUBERABERFATURA'">
                                      <td class="lineTableBudgetTd invoiceinvoicetype">
                                          <xsl:text>ARACI KURUM UNVAN :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr">
                                          <xsl:for-each select="//n1:Invoice/cac:TaxRepresentativeParty/cac:PartyName/cbc:Name">
                                              <xsl:value-of select="."></xsl:value-of>
                                          </xsl:for-each>
                                      </td>
                                  </xsl:if>
                              </tr>
                              <xsl:if test="n1:Invoice/cbc:ProfileID = 'IHRACAT'">
                              <tr class="odemesekli">                           
                                  <xsl:for-each select="n1:Invoice/cac:PaymentMeans">
                                      <td class="lineTableBudgetTd">
                                          <xsl:text>ÖDEME KODU / ŞEKLİ :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr odemesekli">
                                          <xsl:value-of select="cbc:PaymentMeansCode" />
                                          <xsl:choose>
                                              <xsl:when test="cbc:PaymentChannelCode">
                                                  <span style="font-weight:bold; ">
                                                      <xsl:text>-</xsl:text>
                                                  </span>
                                                  <xsl:value-of select="cbc:PaymentChannelCode" />
                                              </xsl:when>
                                              <xsl:otherwise>
                                                  <xsl:if test="cbc:InstructionNote">
                                                      <span style="font-weight:bold; ">
                                                          <xsl:text>-</xsl:text>
                                                      </span>
                                                      <xsl:value-of select="cbc:InstructionNote" />
                                                  </xsl:if>
                                              </xsl:otherwise>
                                          </xsl:choose>
                                      </td>
                                  </xsl:for-each>                           
                              </tr>
                              <tr class="odemetarihi">
                                  <xsl:for-each select="n1:Invoice/cac:PaymentMeans">
                                      <td class="lineTableBudgetTd">
                                          <xsl:text>ÖDEME TARİHİ :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr">
                                          <xsl:for-each select="cbc:PaymentDueDate">
                                              <xsl:value-of select="substring(.,9,2)" />-<xsl:value-of select="substring(.,6,2)" />-<xsl:value-of select="substring(.,1,4)" />
                                          </xsl:for-each>
                                      </td>
                                  </xsl:for-each>
                              </tr>
                              </xsl:if>
                              <tr class="faturatarihi">
                                  <xsl:for-each select="//n1:Invoice/cac:DespatchDocumentReference">
                                      <td class="lineTableBudgetTd invoiceinvoicetype">
                                          <xsl:text>İRSALİYE NO :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr">
                                           <xsl:for-each select="cbc:ID">
                                             <xsl:value-of select="."></xsl:value-of>
                                           </xsl:for-each>
                                      </td>
                                  </xsl:for-each>
                              </tr>
                              <tr class="faturatarihi">
                                  <xsl:for-each select="//n1:Invoice/cac:DespatchDocumentReference">
                                      <td class="lineTableBudgetTd invoiceinvoicetype">
                                          <xsl:text>İRSALİYE TARİHİ :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr">
                                           <xsl:for-each select="cbc:IssueDate">
                                             <xsl:value-of select="substring(.,9,2)"
                                                            />-<xsl:value-of select="substring(.,6,2)"
                                                            />-<xsl:value-of select="substring(.,1,4)"/>
                                           </xsl:for-each>
                                      </td>
                                  </xsl:for-each>
                              </tr>
                              <tr class="faturatarihi">
                                  <xsl:for-each select="//n1:Invoice/cac:OrderReference">
                                      <td class="lineTableBudgetTd invoiceinvoicetype">
                                          <xsl:text>SİPARİŞ NO :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr">
                                           <xsl:for-each select="cbc:ID">
                                             <xsl:value-of select="."></xsl:value-of>
                                           </xsl:for-each>
                                      </td>
                                  </xsl:for-each>
                              </tr>
                              <tr class="faturatarihi">
                                  <xsl:for-each select="//n1:Invoice/cac:OrderReference">
                                      <td class="lineTableBudgetTd invoiceinvoicetype">
                                          <xsl:text>SİPARİŞ TARİHİ :</xsl:text>
                                      </td>
                                      <td class="lineTableBudgetTr">
                                          <xsl:for-each select="cbc:IssueDate">
                                          <xsl:value-of select="substring(.,9,2)"
                                                        />-<xsl:value-of select="substring(.,6,2)"
                                                        />-<xsl:value-of select="substring(.,1,4)"/>
                                          </xsl:for-each>
                                      </td>
                                  </xsl:for-each>
                              </tr>
                            
                             
                          </tbody>
                      </table>
                  </td>
                </tr>
                <!-- /////////////////////MİKRO///////////////////////////// -->
                <!-- Fatura ETTN alanı burada bulunuyor @ETTN-->
                <tr align="left">
                  <table id="ettnTable">
                    <tr style="height:13px;">
                      <td align="left" valign="top">
                        <span style="font-weight:bold; " class="ETTN">
                          <xsl:text>ETTN:</xsl:text>
                        </span>
                      </td>
                      <td align="left" width="240px">
                        <xsl:for-each select="n1:Invoice">
                          <xsl:for-each select="cbc:UUID">
                            <xsl:apply-templates />
                          </xsl:for-each>
                        </xsl:for-each>
                      </td>
                    </tr>
                  </table>
                </tr>
                <!-- Fatura ETTNalanı burada bitiyor -->
              </tbody>
            </table>
            <div class="mt_2x mb_1x">
              <div id="fatura_tblcontainer">
              <xsl:choose>
              <xsl:when test="n1:Invoice/cbc:ProfileID = 'IHRACAT'">
              <table id="fatura_tbl" class="fatura_tablosu">
                  <thead>
                    <tr id="lineTableTr">
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal/Hizmet Tablosundaki Satır No alanı burada bulunuyor @SATIRNO -->
                      <th class="tbl_capth tbl_cap" id="invoiceproductinvoiceorderno">
                        <xsl:text>#</xsl:text>
                      </th>
                      
                                 <!--SAS Kalem No Başlık-->                  
                <td class="lineTableTd" style="width:7%">
                <span style="font-weight:bold; " align="center">
                  <xsl:text>SAS Kalem No</xsl:text>
                </span>
              </td>
                      
                               
                                 <!--YerlilikBaşlık-->                  
                  <!--<td class="lineTableTd" style="width:7%">
                <span style="font-weight:bold; " align="center">
                  <xsl:text>Yerlilik Oranı</xsl:text>
                </span>
              </td>--> 
                      
                              <!--Yerlilik Oranı  Başlık - KALDIRILDI -->                  
                <!-- Bu sabit başlık kaldırıldı - koşullu başlık kullanılıyor -->
                      
                      
                        <th class="tbl_capth tbl_cap stockcode" id="stockcode" align="left">
                            <xsl:text>Stok Kodu</xsl:text>
                        </th>
                      <!-- Satır No alanı burada bitiyor -->
                      <!-- Mal/Hizmet Tablosundaki Marka alanı burada bulunuyor @MARKA -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Item/cbc:BrandName">
                        <th class="tbl_capth tbl_cap brandname" id="brandname" align="left">
                          <xsl:text>Marka</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Marka alanı burada bitiyor -->
                      
                    
                        <th class="tbl_capth tbl_cap stockcode" id="stockcode" align="left">
                          <xsl:text>Barkod</xsl:text>
                        </th>
                     
                      
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Adı akabı burada bulunuyor @HIZMETADI -->
                      <th class="tbl_capth tbl_cap" align="left">
                        <xsl:text>Mal / Hizmet</xsl:text>
                      </th>
                      
                      <!-- Mal Hizmet Adı alanı burada bitiyor -->
                        <!-- Alıcı Ürün Kodu alanı burada bulunuyor -->                 
                       <th class="tbl_capth tbl_cap stockcode" id="stockcode" align="left">
                                    <xsl:text>Alıcı Ürün Kodu</xsl:text>
                                </th>
                           
                        <!-- Alıcı Ürün Kodu alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki Miktar alanı burada bulunuyor @MIKTAR -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cbc:InvoicedQuantity">
                        <th class="tbl_capth tbl_cap" align="left">
                          <xsl:text>Miktar</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Miktar Alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki Birim Fiyat alanı burada bulunuyor @BIRIMFIYAT -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Price/cbc:PriceAmount">
                        <th class="tbl_capth tbl_cap" align="left">
                          <xsl:text>Birim Fiyat</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Birim Fiyat alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki İskonto Nedeni Alanı @ISKONTONEDENI-->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge/cbc:AllowanceChargeReason">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Nedeni</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- İskonto Nedeni alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki İskonto Oranı Alanı @ISKONTOORANI-->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge/cbc:MultiplierFactorNumeric">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Oran</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- İskonto Oranı alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki İskonto Tutarı Alanı @ISKONTOTUTARI-->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Tutar</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- İskonto Tutarı alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki KDV Tutarı Alanı -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Uyg.</xsl:text>
                        </th>
                      </xsl:if>
                      <!--Teslim şartı burada başlıyor ADO-->
                      
                        <th class="tbl_capth tbl_cap" align="left">
                            <xsl:text>Teslim Şartı</xsl:text>
                        </th>
                                           
                      <!--Teslim şartı burada bitiyor ADO-->
                      <!--Kap cinsi burada başlıyor ADO-->
                      
                        <th class="tbl_capth tbl_cap" align="left">
                            <xsl:text>Kap Cinsi</xsl:text>
                        </th>
                       
                      
                      <!--kap cinsi burada bitiyor ADO-->
                       <!--Kap No burada başlıyor ADO-->
                      
                        <th class="tbl_capth tbl_cap" align="left">
                            <xsl:text>Kap No</xsl:text>
                        </th>
                       
                      
                      <!--kap No burada bitiyor ADO-->
                       <!--Kap adet burada başlıyor ADO-->
                      
                        <th class="tbl_capth tbl_cap" align="left">
                            <xsl:text>Kap Adet</xsl:text>
                        </th>
                       
                      
                      <!--kap adet burada bitiyor ADO-->
                      <!--gönderilme şekli başlıyor ADO-->
                      
                        <th class="tbl_capth tbl_cap" align="left">
                            <xsl:text>Gönderilme Şekli</xsl:text>
                        </th>
                          
                      <!--gönderilme şekli bitiyor ADO-->
                      <!--GTIP no burada başlıyor ADO-->
                      <th class="tbl_capth tbl_cap" align="left">
                            <xsl:text>GTIP No</xsl:text>
                        </th>
                      <!--GTIP no burada bitiyor ADO-->
                        <!-- Diğer Vergiler Tutarı Alanı -->
                        <xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
                            <th class="tbl_capth tbl_cap invoicetaxkdv" align="left">
                                <xsl:text>Diğer Vergiler</xsl:text>
                            </th>
                        </xsl:if>
                      <!-- Diğer Vergiler Tutarı Alanı Burada Bitiyor -->
                      <!-- Mal Hizmet Tablosundaki KDV Tutarı Alanı Burada Bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki Toplam Tutar Alanı -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cbc:LineExtensionAmount">
                        <th class="tbl_capth tbl_cap" align="left">
                          <xsl:text>Tutar</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Mal Hizmet Tablosundaki Toplam Tutar Alanı Burada Bitiyor -->
                      <!-- TEVKIFATIADE faturalarindaki Tevkifatsız KDV Tutarı Alanı -->
                      <xsl:if test="//n1:Invoice/cbc:InvoiceTypeCode='TEVKIFATIADE'">
                        <td class="lineTableTd" style="width:10.6%" align="left">
                          <span style="font-weight:bold;">
                            <xsl:text>Tevkifatsız KDV Tutarı</xsl:text>
                          </span>
                        </td>
                      </xsl:if>
                      <!-- TEVKIFATIADE faturalarindaki Tevkifatsız KDV Tutarı Alanı -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:if test="count(//n1:Invoice/cac:InvoiceLine) &gt;= 20">
                      <xsl:for-each select="//n1:Invoice/cac:InvoiceLine">
                        <xsl:apply-templates select="." />
                      </xsl:for-each>
                    </xsl:if>
                    <xsl:if test="count(//n1:Invoice/cac:InvoiceLine) &lt; 20">
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[1]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[1]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[2]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[2]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[3]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[3]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[4]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[4]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[5]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[5]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[6]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[6]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[7]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[7]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[8]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[8]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[9]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[9]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[10]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[10]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[11]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[11]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[12]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[12]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[13]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[13]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[14]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[14]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[15]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[15]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[16]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[16]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[17]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[17]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[18]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[18]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[19]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[19]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[20]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[20]" />
                        </xsl:when>
                      </xsl:choose>
                    </xsl:if>
                  </tbody>
                </table>
              
              </xsl:when>
              <xsl:otherwise>
            

      
       
   
                <table id="fatura_tbl" class="tbl_capth tbl_cap" width="100%">
                 
                  <thead>
                    <tr id="lineTableTr">
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal/Hizmet Tablosundaki Satır No alanı burada bulunuyor @SATIRNO -->
                      <th class="tbl_capth tbl_cap" id="invoiceproductinvoiceorderno">
                        <xsl:text>#</xsl:text>
                      </th>
                      
                      
                                 <!--SAS Kalem No Başlık-->                  
                <td class="lineTableTd" style="width:7%">
                <span style="font-weight:bold; " align="center">
                  <xsl:text>SAS Kalem No</xsl:text>
                </span>
              </td>
                      
                                     
                                 <!--YerlilikBaşlık-->                  
               <!--  <td class="lineTableTd" style="width:7%">
                <span style="font-weight:bold; " align="center">
                  <xsl:text>Yerlilik Oranı</xsl:text>
                </span>
              </td>-->   
               <!--  Yerlilik Oranı  Başlık - KALDIRILDI -->                  
                <!-- Bu sabit başlık kaldırıldı - koşullu başlık kullanılıyor -->
                    
                      
                      <!-- Satır No alanı burada bitiyor -->
                      <!-- Mal/Hizmet Tablosundaki Marka alanı burada bulunuyor @MARKA -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Item/cbc:BrandName">
                        <th class="tbl_capth tbl_cap brandname" id="brandname" align="left">
                          <xsl:text>Marka</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Marka alanı burada bitiyor -->
                        
                            <th class="tbl_capth tbl_cap stockcode" id="stockcode" align="left">
                                <xsl:text>Barkod</xsl:text>
                            </th>
                       
                        <!-- Mal/Hizmet Tablosundaki Stok kodu alanı burada bulunuyor @MARKA -->
                        <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Item/cac:SellersItemIdentification/cbc:ID">
                            <th class="tbl_capth tbl_cap stockcode" id="stockcode" align="left">
                                <xsl:text>Stok Kodu</xsl:text>
                            </th>
                        </xsl:if>
                        <!-- Stok kodu alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Adı akabı burada bulunuyor @HIZMETADI -->
                      <th class="tbl_capth tbl_cap" align="left">
                        <xsl:text>Mal / Hizmet</xsl:text>
                      </th>
                      <!-- Mal Hizmet Adı alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Alıcı ürün kodu burada bulunuyor -->                  
                         <th class="tbl_capth tbl_cap stockcode" id="stockcode" align="left">
                                <xsl:text>Alıcı Ürün Kodu</xsl:text>
                                </th>
                           
                      <!-- Alıcı ürün kodu alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki Miktar alanı burada bulunuyor @MIKTAR -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cbc:InvoicedQuantity">
                        <th class="tbl_capth tbl_cap" align="left">
                          <xsl:text>Miktar</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Miktar Alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki Birim Fiyat alanı burada bulunuyor @BIRIMFIYAT -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Price/cbc:PriceAmount">
                        <th class="tbl_capth tbl_cap" align="left">
                          <xsl:text>Birim Fiyat</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Birim Fiyat alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki İskonto Nedeni Alanı @ISKONTONEDENI-->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge/cbc:AllowanceChargeReason">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Nedeni</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- İskonto Nedeni alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki İskonto Oranı Alanı @ISKONTOORANI-->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge/cbc:MultiplierFactorNumeric">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Oran</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- İskonto Oranı alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki İskonto Tutarı Alanı @ISKONTOTUTARI-->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Tutar</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- İskonto Tutarı alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki İskonto Uyg Alanı -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
                        <th class="tbl_capth tbl_cap invoiceiskonto" align="left">
                          <xsl:text>İskonto Uyg.</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Mal Hizmet Tablosundaki İskonto Uyg Alanı Burada Bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki KDV Oranı Alanı -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
                        <th class="tbl_capth tbl_cap" align="left">
                          <xsl:choose>
                            <xsl:when test="//n1:Invoice/cbc:InvoiceTypeCode='TEVKIFATIADE'">
                              <xsl:text>İade Edilen Mal Oranı</xsl:text>
                            </xsl:when>
                            <xsl:otherwise>
                              <xsl:text>KDV Oranı</xsl:text>
                            </xsl:otherwise>
                          </xsl:choose>
                        </th>
                      </xsl:if>
                        <!-- Mal Hizmet Tablosundaki KDV Oranı Alanı Burada Bitiyor -->
                        <!-- /////////////////////MİKRO///////////////////////////// -->
                        <!-- Mal Hizmet Tablosundaki Özel Matrah Alanı -->
                        <xsl:if test="//n1:Invoice/cbc:InvoiceTypeCode='OZELMATRAH'">
                            <th class="tbl_capth tbl_cap" align="left">
                                <xsl:text>Özel Matrah Tutarı</xsl:text>
                            </th>
                        </xsl:if>
                        <!-- Mal Hizmet Tablosundaki KDV Tutarı Alanı -->
                        <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
                            <th class="tbl_capth tbl_cap invoicetaxkdv" align="left">
                                <xsl:text>KDV Tutar</xsl:text>
                            </th>
                        </xsl:if>
                      <!-- Mal Hizmet Tablosundaki KDV Tutarı Alanı Burada Bitiyor -->
                      <!--Künye burada yer alıyor ADO-->
                        <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Item/cac:AdditionalItemIdentification/cbc:ID/@schemeID='KUNYENO'">
                         <th class="tbl_capth tbl_cap invoicetaxkdv" align="right">
                          <xsl:text>Künye No</xsl:text>
                        </th>
                        </xsl:if>
                      <!--Künye burada yer alıyor ADO-->
                      <!--Yerlilik Oranı burada yer alıyor ASELSAN-->
                        <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(@schemeID)]">
                         <th class="tbl_capth tbl_cap invoicetaxkdv" align="right">
                          <xsl:text>Yerlilik Oranı</xsl:text>
                        </th>
                        </xsl:if>
                      <!--Yerlilik Oranı burada yer alıyor ASELSAN-->
                      <!-- Diğer Vergiler Tutarı Alanı -->
                        <xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
                            <th class="tbl_capth tbl_cap invoicetaxkdv" align="left">
                                <xsl:text>Diğer Vergiler</xsl:text>
                            </th>
                        </xsl:if>
                      <!-- Diğer Vergiler Tutarı Alanı Burada Bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Mal Hizmet Tablosundaki Toplam Tutar Alanı -->
                      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cbc:LineExtensionAmount">
                        <th class="tbl_capth tbl_cap" align="left">
                          <xsl:text>Tutar</xsl:text>
                        </th>
                      </xsl:if>
                      <!-- Mal Hizmet Tablosundaki Toplam Tutar Alanı Burada Bitiyor -->
                      <!-- TEVKIFATIADE faturalarindaki Tevkifatsız KDV Tutarı Alanı -->
                      <xsl:if test="//n1:Invoice/cbc:InvoiceTypeCode='TEVKIFATIADE'">
                        <td class="lineTableTd" style="width:10.6%" align="left">
                          <span style="font-weight:bold;">
                            <xsl:text>Tevkifatsız KDV Tutarı</xsl:text>
                          </span>
                        </td>
                      </xsl:if>
                      <!-- TEVKIFATIADE faturalarindaki Tevkifatsız KDV Tutarı Alanı -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:if test="count(//n1:Invoice/cac:InvoiceLine) &gt;= 20">
                      <xsl:for-each select="//n1:Invoice/cac:InvoiceLine">
                        <xsl:apply-templates select="." />
                      </xsl:for-each>
                    </xsl:if>
                    <xsl:if test="count(//n1:Invoice/cac:InvoiceLine) &lt; 20">
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[1]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[1]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[2]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[2]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[3]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[3]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[4]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[4]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[5]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[5]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[6]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[6]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[7]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[7]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[8]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[8]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[9]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[9]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[10]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[10]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[11]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[11]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[12]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[12]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[13]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[13]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[14]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[14]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[15]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[15]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[16]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[16]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[17]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[17]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[18]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[18]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[19]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[19]" />
                        </xsl:when>
                      </xsl:choose>
                      <xsl:choose>
                        <xsl:when test="//n1:Invoice/cac:InvoiceLine[20]">
                          <xsl:apply-templates select="//n1:Invoice/cac:InvoiceLine[20]" />
                        </xsl:when>
                      </xsl:choose>
                    </xsl:if>
                  </tbody>
                </table>
                </xsl:otherwise>
                </xsl:choose>
              </div>
            </div>
          </xsl:for-each>
          <table class="ust_tablo wp mal-hizmet" width="100%">
            <tbody>
              <tr>
                <td width="50%" style="min-width: 125px; max-width: 125px">
                  <!-- Faturada bir istisna var ise burada belirtiliyor @FATURAISTISNA-->
                  <xsl:choose>
                  <xsl:when test="//n1:Invoice/cbc:ProfileID = 'IHRACAT'">
                  <xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode">
                    <div style="margin-top:1rem">
                      <span>İstisna: </span>
                      <span>
                        <xsl:value-of select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode" />
                      </span>
                      <span> - </span>
                      <span>
                        <xsl:value-of select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReason" />
                      </span>
                    </div>
                  </xsl:if>
                  </xsl:when>
                  <xsl:otherwise>
                 <xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode">
                    <div style="margin-top:1rem">
                      <span>İstisna: </span>
                      <span>
                          <xsl:value-of select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode" />
                      </span>
                      <span> - </span>
                      <span>
                          <xsl:value-of select="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReason" />
                      </span>
                    </div>
                </xsl:if>
                  </xsl:otherwise>
                  </xsl:choose>
                  
                  
                  <xsl:for-each select="//n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal">
                 <xsl:if test="cac:TaxCategory/cac:TaxScheme">
                    <div style="margin-top:1rem">
                      <span style="font-weight:bold; color:black;">Tevkifat Kodu: </span>
                      <span>
                        <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode" />
                      </span>
                      <span> - </span>
                      <span>
                        <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name" />
                      </span>
                    </div>
                </xsl:if>
                  </xsl:for-each>
                  <!-- Fatura istisna alanı burada bitiyor-->
                    <!-- Faturada bir özel matrah var ise burada belirtiliyor -->

                    <xsl:choose>
                        <xsl:when test="//n1:Invoice/cbc:InvoiceTypeCode = 'OZELMATRAH'">
                            <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode">
                                <div style="margin-top:1rem">
                                    <span>Özel Matrah: </span>
                                    <span>
                                        <xsl:value-of select="//n1:Invoice/cac:InvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReasonCode" />
                                    </span>
                                    <span> - </span>
                                    <span>
                                        <xsl:value-of select="//n1:Invoice/cac:InvoiceLine/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cbc:TaxExemptionReason" />
                                    </span>
                                </div>
                            </xsl:if>
                        </xsl:when>
                    </xsl:choose>
                    <!-- özel matrah alanı burada bitiyor -->
                </td>
                <td width="50%" align="right">
                  <table class="lineTableBudgetTd mb-1">
                    <tbody>
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <!-- Alt Toplamdaki Toplam Tutarı alanı burada başlıyor @TOPLAMTUTAR-->
                      <tr class="lineTableBudgetTr">
                        <td class="lineTableBudgetTd">
                          <xsl:choose>
                            <xsl:when test="//n1:Invoice/cbc:InvoiceTypeCode='TEVKIFATIADE'">
                              <span style="font-weight:bold;">
                                <xsl:text>İadeye Konu İşlem Bedeli Tutarı</xsl:text>
                              </span>
                            </xsl:when>
                            <xsl:otherwise>
                              <span style="font-weight:bold; ">
                                <xsl:text>Mal Hizmet Toplam Tutarı</xsl:text>
                              </span>
                            </xsl:otherwise>
                          </xsl:choose>
                        </td>
                        <td class="alt_toplam_val" >
                          <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount, '###.##0,00', 'european')" />
                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID">
                            <xsl:text></xsl:text>
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID = 'TRY'">
                              <span class="tl_sign">
                                <xsl:text>TL</xsl:text>
                              </span>
                            </xsl:if>
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRY'">
                              <xsl:text> </xsl:text>
                              <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID" />
                            </xsl:if>
                          </xsl:if>
                        </td>
                      </tr>
                      <!-- Toplam Tutar alanı burada bitiyor -->
                      <!-- /////////////////////MİKRO///////////////////////////// -->
                      <!-- Alt toplamdaki Toplam İskonto alanı burada başlıyor @TOPLAMISKONTO -->
                      <tr class="lineTableBudgetTr toplamiskonto">
                        <td class="lineTableBudgetTd invoiceiskonto">
                          <xsl:text>Toplam İskonto</xsl:text>
                        </td>
                        <td class="alt_toplam_val invoiceiskonto">
                          <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount, '###.##0,00', 'european')" />
                          <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID">
                            <xsl:text></xsl:text>
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID = 'TRY'">
                              <xsl:text> TL</xsl:text>
                            </xsl:if>
                            <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID != 'TRY'">
                              <xsl:text> </xsl:text>
                              <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:AllowanceTotalAmount/@currencyID" />
                            </xsl:if>
                          </xsl:if>
                        </td>
                      </tr>
                      <!-- Toplam İskonto alanı burada bitiyor -->
                        <!-- Navlun alanı buradan başlıyor ADO-->
                        <xsl:if test="((//n1:Invoice/cac:InvoiceLine/cac:Delivery/cac:Shipment/cbc:DeclaredForCarriageValueAmount) and (//n1:Invoice/cac:InvoiceLine/cac:Delivery/cac:Shipment/cbc:DeclaredForCarriageValueAmount != '0.00'))">
                        <xsl:for-each select="//n1:Invoice/cbc:Note">
                                <tr class="lineTableBudgetTr">
                                    <td class="lineTableBudgetTd">
                                        <xsl:text>Toplam Navlun Bedeli</xsl:text>
                                    </td>
                                    <td class="alt_toplam_val">

                                        <xsl:value-of select="//n1:Invoice/cac:InvoiceLine/cac:Delivery/cac:Shipment/cbc:DeclaredForCarriageValueAmount"/>


                                        <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                                            <xsl:text>TL</xsl:text>
                                        </xsl:if>
                                        <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                                            <xsl:value-of select="//n1:Invoice/cbc:DocumentCurrencyCode" />
                                        </xsl:if>
                                    </td>
                                </tr>
                        </xsl:for-each>
                        </xsl:if>
                        <!-- Navlun bitiyor ADO-->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                        <!-- Sigorta alanı buradan başlıyor ADO-->
                        <xsl:if test="((//n1:Invoice/cac:InvoiceLine/cac:Delivery/cac:Shipment/cbc:InsuranceValueAmount) and (//n1:Invoice/cac:InvoiceLine/cac:Delivery/cac:Shipment/cbc:InsuranceValueAmount != '0.00'))">
                            <xsl:for-each select="//n1:Invoice/cbc:Note">
                                <tr class="lineTableBudgetTr">
                                    <td class="lineTableBudgetTd">
                                        <xsl:text>Toplam Sigorta Bedeli</xsl:text>
                                    </td>
                                    <td class="alt_toplam_val">

                                        <xsl:value-of select="//n1:Invoice/cac:InvoiceLine/cac:Delivery/cac:Shipment/cbc:InsuranceValueAmount"/>


                                        <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                                            <xsl:text>TL</xsl:text>
                                        </xsl:if>
                                        <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                                            <xsl:value-of select="//n1:Invoice/cbc:DocumentCurrencyCode" />
                                        </xsl:if>
                                    </td>
                                </tr>
                            </xsl:for-each>
                        </xsl:if>
                        <!-- Sigorta alanı burada bitiyor ADO-->
                      <!-- MHesaplanan vergi alanı burada başlıyor @HESAPLANANVERGI -->
                      <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                        <tr class="lineTableBudgetTr hesaplananvergi">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Hesaplanan </xsl:text>
                            <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name" />
                            <xsl:text>(%</xsl:text>
                            <xsl:value-of select="cbc:Percent" />
                            <xsl:text>)</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                              <xsl:text></xsl:text>
                              <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                              <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                <xsl:text></xsl:text>
                                <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">
                                  <span class="tl_sign">
                                    <xsl:text> TL</xsl:text>
                                  </span>
                                </xsl:if>
                                <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">
                                  <xsl:text> </xsl:text>
                                  <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                                </xsl:if>
                              </xsl:if>
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:for-each>
                      <!-- Hesaplanan Vergi alanı bırada bitiyor -->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <!-- Hesaplanan KDV Tevkifat ve Oranı burada başlıyor @HESAPLANANKDVTEVKIFAT -->
                      <xsl:for-each select="n1:Invoice/cac:WithholdingTaxTotal/cac:TaxSubtotal">
                        <tr class="lineTableBudgetTr hesaplanankdvtevkifat">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Hesaplanan KDV Tevkifat</xsl:text>
                            <xsl:text>(%</xsl:text>
                            <xsl:value-of select="cbc:Percent" />
                            <xsl:text>)</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                              <xsl:text></xsl:text>
                              <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                              <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                <xsl:text></xsl:text>
                                <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRL' or ../../cbc:TaxAmount/@currencyID = 'TRY'">
                                  <xsl:text> TL</xsl:text>
                                </xsl:if>
                                <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRL' and ../../cbc:TaxAmount/@currencyID != 'TRY'">
                                  <xsl:text> </xsl:text>
                                  <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                                </xsl:if>
                              </xsl:if>
                            </xsl:for-each>
                          </td>
                        </tr>
                      </xsl:for-each>
                      <!-- Hesaplanan KDV Tevkifat ve Oranı burada bitiyor @HESAPLANANKDVTEVKIFAT -->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <!-- Tevkifata Tabi İşlem Tutarı alanı burada başlıyor @TEVKİFATATABITUTAR -->
                      <xsl:if test="sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount)&gt;0">
                        <tr class="lineTableBudgetTr tevkifatatabirtutar">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Tevkifata Tabi İşlem Tutarı</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            <xsl:value-of select="format-number(sum(n1:Invoice/cac:InvoiceLine[cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:LineExtensionAmount), '###.##0,00', 'european')" />
                            <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                              <xsl:text> TL</xsl:text>
                            </xsl:if>
                            <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                              <xsl:text> </xsl:text>
                              <xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />
                            </xsl:if>
                          </td>
                        </tr>
                        <!-- Tevkifata Tabi İşlem Tutarı alanı burada bitiyor -->
                        <!-- //////////////////////////MİKRO///////////////////////// -->
                        <!-- Tevkifata Tabi İşlem Üzerinden Hesaplanan KDV alanı burada bulunuyor @TEVKIFATKDV-->
                        <tr class="lineTableBudgetTr">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Tevkifata Tabi İşlem Üzerinden Hes. KDV</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            <xsl:value-of select="format-number(sum(n1:Invoice/cac:TaxTotal/cac:TaxSubtotal[cac:TaxCategory/cac:TaxScheme/cbc:TaxTypeCode=9015]/cbc:TaxableAmount), '###.##0,00', 'european')" />
                            <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                              <xsl:text> TL</xsl:text>
                            </xsl:if>
                            <xsl:if test="n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                              <xsl:text> </xsl:text>
                              <xsl:value-of select="n1:Invoice/cbc:DocumentCurrencyCode" />
                            </xsl:if>
                          </td>
                        </tr>
                      </xsl:if>
                      <!-- Tevkifata Tabi İşlem Üzerinden Hesaplanan KDV alanı burada bitiyor -->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <!-- Navlun alanı buradan başlıyor ADO-->
                      
                      
                      <xsl:for-each select="//n1:Invoice/cbc:Note">
                        <xsl:if test="contains(.,'#NoPrint##NavlunToplamD#')">
                        <tr class="lineTableBudgetTr">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Navlun Tutarı</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            
                            <xsl:value-of select="substring-after(.,'#NoPrint##NavlunToplamD#')"/>
                            
                        
                            <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                              <xsl:text> TL</xsl:text>
                            </xsl:if>
                            <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                              <xsl:text> </xsl:text>
                              <xsl:value-of select="//n1:Invoice/cbc:DocumentCurrencyCode" />
                            </xsl:if>
                          </td>
                        </tr>
                        </xsl:if>
                      </xsl:for-each>
                      <!-- Navlun bitiyor ADO-->
                      <!-- Sigorta alanı buradan başlıyor ADO-->
                      
                      
                      <xsl:for-each select="//n1:Invoice/cbc:Note">
                        <xsl:if test="contains(.,'#NoPrint##SigortaToplamiD#')">
                        <tr class="lineTableBudgetTr">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Sigorta Tutarı</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            
                            <xsl:value-of select="substring-after(.,'#NoPrint##SigortaToplamiD#')"/>
                            
                        
                            <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode = 'TRY'">
                              <xsl:text> TL</xsl:text>
                            </xsl:if>
                            <xsl:if test="//n1:Invoice/cbc:DocumentCurrencyCode != 'TRY'">
                              <xsl:text> </xsl:text>
                              <xsl:value-of select="//n1:Invoice/cbc:DocumentCurrencyCode" />
                            </xsl:if>
                          </td>
                        </tr>
                        </xsl:if>
                      </xsl:for-each>
                      <!-- Sigorta bitiyor ADO-->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <!-- Vergiler Dahil Toplam Tutar alanı burada başlıyor @VERGILERDAHILTOPLAM -->
                      <tr class="lineTableBudgetTr vergilerdahiltoplam">
                        <td class="lineTableBudgetTd">
                          <xsl:text>Vergiler Dahil Toplam Tutar</xsl:text>
                        </td>
                        <td class="alt_toplam_val">
                          <xsl:for-each select="n1:Invoice">
                            <xsl:for-each select="cac:LegalMonetaryTotal">
                              <xsl:for-each select="cbc:TaxInclusiveAmount">
                                <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                                <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID">
                                  <xsl:text></xsl:text>
                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID = 'TRY'">
                                    <span class="tl_sign">
                                      <xsl:text> TL</xsl:text>
                                    </span>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID != 'TRY'">
                                    <xsl:text> </xsl:text>
                                    <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount/@currencyID" />
                                  </xsl:if>
                                </xsl:if>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </td>
                      </tr>
                      <!--  Vergiler Dahil Toplam Tutar alanı burada bitiyor -->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <!-- Toplam Masraflar alanı burada başlıyor  -->
                        <xsl:if test="n1:Invoice/cbc:ProfileID = 'HKS' and n1:Invoice/cbc:InvoiceTypeCode = 'HKSKOMISYONCU'">
                            <tr class="lineTableBudgetTr">
                                <td class="lineTableBudgetTd">
                                    <xsl:text>Toplam Masraflar</xsl:text>
                                </td>
                                <td class="alt_toplam_val">
                                    <xsl:for-each select="n1:Invoice">
                                        <xsl:for-each select="cac:LegalMonetaryTotal">
                                            <xsl:for-each select="cbc:ChargeTotalAmount">
                                                <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                                                <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:ChargeTotalAmount/@currencyID">
                                                    <xsl:text></xsl:text>
                                                    <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:ChargeTotalAmount/@currencyID = 'TRY'">
                                                        <span class="tl_sign">
                                                            <xsl:text> TL</xsl:text>
                                                        </span>
                                                    </xsl:if>
                                                    <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:ChargeTotalAmount/@currencyID != 'TRY'">
                                                        <xsl:text> </xsl:text>
                                                        <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:ChargeTotalAmount/@currencyID" />
                                                    </xsl:if>
                                                </xsl:if>
                                            </xsl:for-each>
                                        </xsl:for-each>
                                    </xsl:for-each>
                                </td>
                            </tr>
                        </xsl:if>
                      <!--  Toplam Masraflar alanı burada bitiyor -->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <!-- Alt Toplamlardaki Ödenecek Tutar alanı burada bulunuyor @ODENECEKTUTAR -->
                      <tr class="lineTableBudgetTr">
                        <td class="lineTableBudgetTd">
                          <xsl:text>Ödenecek Tutar</xsl:text>
                        </td>
                        <td class="alt_toplam_val">
                          <xsl:for-each select="n1:Invoice">
                            <xsl:for-each select="cac:LegalMonetaryTotal">
                              <xsl:for-each select="cbc:PayableAmount">
                                <xsl:value-of select="format-number(., '###.##0,00', 'european')" />
                                <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID">
                                  <xsl:text></xsl:text>
                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID = 'TRY'">
                                    <xsl:text> TL</xsl:text>
                                  </xsl:if>
                                  <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID != 'TRY'">
                                    <xsl:text> </xsl:text>
                                    <xsl:value-of select="//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount/@currencyID" />
                                  </xsl:if>
                                </xsl:if>
                              </xsl:for-each>
                            </xsl:for-each>
                          </xsl:for-each>
                        </td>
                      </tr>
                      <!-- Ödenecek Tutar alanı burada bitiyor -->
                      <!-- //////////////////////////MİKRO///////////////////////// -->
                      <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRY'">
                        <xsl:if test="//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount/@currencyID != 'TRL'">
                          <!-- //////////////////////////MİKRO///////////////////////// -->
                          <!-- Alt Toplamlardaki Mal Hizmet Toplam Tutarı(TL) alanı burada bulunuyor @ODENECEKTUTAR -->
                          <!-- !!! Bu alan yalnızca para birimi TL değilse görünecektir !!! -->
                          <tr class="lineTableBudgetTr">
                            <td class="lineTableBudgetTd">
                              <xsl:text>Mal Hizmet Toplam Tutarı(TL)</xsl:text>
                            </td>
                            <td class="alt_toplam_val">
                              <span>
                                <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:LineExtensionAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                <xsl:text> TL</xsl:text>
                              </span>
                            </td>
                          </tr>
                          <!-- Mal Hizmet Toplam Tutarı(TL) alanı burada bitiyor -->
                          <!-- //////////////////////////MİKRO///////////////////////// -->
                            <!-- Alt Toplamlardaki Hesaplanan KDV(TL) alanı burada bulunuyor -->
                            <xsl:for-each select="n1:Invoice/cac:TaxTotal/cac:TaxSubtotal">
                                <tr class="lineTableBudgetTr hesaplananvergi">
                                    <td class="lineTableBudgetTd">
                                        <xsl:text>Hesaplanan </xsl:text>
                                        <xsl:value-of select="cac:TaxCategory/cac:TaxScheme/cbc:Name" />
                                        <xsl:text>(%</xsl:text>
                                        <xsl:value-of select="cbc:Percent" />
                                        <xsl:text>)(TL)</xsl:text>
                                    </td>
                                    <td class="alt_toplam_val">
                                        <xsl:for-each select="cac:TaxCategory/cac:TaxScheme">
                                            <xsl:text></xsl:text>
                                            <xsl:value-of select="format-number(../../cbc:TaxAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                            <xsl:if test="../../cbc:TaxAmount/@currencyID">
                                                <xsl:text></xsl:text>
                                                <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">
                                                    <span class="tl_sign">
                                                        <xsl:text> TL</xsl:text>
                                                    </span>
                                                </xsl:if>
                                                <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">
                                                    <span class="tl_sign">
                                                        <xsl:text> TL</xsl:text>
                                                    </span>
                                                </xsl:if>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </td>
                                </tr>
                            </xsl:for-each>
                            <!-- Alt Toplamlardaki Hesaplanan KDV(TL) alanı burada bitiyor -->
                            <!-- //////////////////////////MİKRO///////////////////////// -->
                          <!--Navlun TL alanı başlıyor ADO-->
                          <xsl:for-each select="//n1:Invoice/cbc:Note">
                        <xsl:if test="contains(.,'#NoPrint##NavlunToplamTl#')">
                        <tr class="lineTableBudgetTr">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Navlun Tutarı(TL)</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            
                            <xsl:value-of select="substring-after(.,'#NoPrint##NavlunToplamTl#')"/>
                            
                        
                            
                              <xsl:text>TL</xsl:text>
                            
                          </td>
                        </tr>
                        </xsl:if>
                      </xsl:for-each>
                      <!--Navlun TL alanı bitiyor ADO-->
                      <!--///////////////////////MİKRO////////////////////-->
                       <!--sigorta TL alanı başlıyor ADO-->
                          <xsl:for-each select="//n1:Invoice/cbc:Note">
                        <xsl:if test="contains(.,'#NoPrint##SigortaToplamiTl#')">
                        <tr class="lineTableBudgetTr">
                          <td class="lineTableBudgetTd">
                            <xsl:text>Sigorta Tutarı(TL)</xsl:text>
                          </td>
                          <td class="alt_toplam_val">
                            
                            <xsl:value-of select="substring-after(.,'#NoPrint##SigortaToplamiTl#')"/>
                            
                        
                            
                              <xsl:text>TL</xsl:text>
                            
                          </td>
                        </tr>
                        </xsl:if>
                      </xsl:for-each>
                      <!--sigorta TL alanı bitiyor ADO-->
                          
                          <!-- Alt Toplamlardaki Vergiler Dahil Toplam Tutar(TL) alanı burada bulunuyor @ODENECEKTUTAR -->
                          <!-- !!! Bu alan yalnızca para birimi TL değilse görünecektir !!! -->
                          <tr class="lineTableBudgetTr">
                            <td class="lineTableBudgetTd">
                              <xsl:text>Vergiler Dahil Toplam Tutar(TL)</xsl:text>
                            </td>
                            <td class="alt_toplam_val">
                              <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:TaxInclusiveAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                              <xsl:text> TL</xsl:text>
                            </td>
                          </tr>
                          <!-- Vergiler Dahil Toplam Tutar(TL) alanı burada bitiyor -->
                            <!-- //////////////////////////MİKRO///////////////////////// -->
                            <!-- Alt Toplamlardaki Toplam MasraflarTL) alanı burada bulunuyor  -->
                            <!-- !!! Bu alan yalnızca para birimi TL değilse görünecektir !!! -->
                            <xsl:if test="n1:Invoice/cbc:ProfileID = 'HKS' and n1:Invoice/cbc:InvoiceTypeCode = 'HKSKOMISYONCU'">
                                <tr class="lineTableBudgetTr">
                                    <td class="lineTableBudgetTd">
                                        <xsl:text>Toplam Masraflar(TL)</xsl:text>
                                    </td>
                                    <td class="alt_toplam_val">
                                        <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:ChargeTotalAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                                        <xsl:text> TL</xsl:text>
                                    </td>
                                </tr>
                            </xsl:if>
                            <!-- Toplam Masraflar(TL) alanı burada bitiyor -->
                          <!-- //////////////////////////MİKRO///////////////////////// -->
                          <!-- Alt Toplamlardaki Ödenecek Tutar(TL) alanı burada bulunuyor @ODENECEKTUTAR -->
                          <!-- !!! Bu alan yalnızca para birimi TL değilse görünecektir !!! -->
                          <tr class="lineTableBudgetTr">
                            <td class="lineTableBudgetTd">
                              <xsl:text>Ödenecek Tutar(TL)</xsl:text>
                            </td>
                            <td class="alt_toplam_val">
                              <xsl:value-of select="format-number(//n1:Invoice/cac:LegalMonetaryTotal/cbc:PayableAmount * //n1:Invoice/cac:PricingExchangeRate/cbc:CalculationRate, '###.##0,00', 'european')" />
                              <xsl:text> TL</xsl:text>
                            </td>
                          </tr>
                          <!-- Ödenecek Tutar(TL) alanı burada bitiyor -->
                          <!-- //////////////////////////MİKRO///////////////////////// -->
                        </xsl:if>
                      </xsl:if>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
             <xsl:if test="//n1:Invoice/cac:BillingReference">
          <table class="fatura_tablosu cancellation-table">
              <thead>
                  <tr>
                    <th style="padding:5px 5px 5px; font-weight:bold">
                        <xsl:text>İadeye Konu Olan Faturalar</xsl:text>
                    </th>
                   </tr>
                  <tr>
                    <th class="cancellation-head">
                        <xsl:text>Fatura No</xsl:text>
                    </th>
                    <th class="cancellation-head">
                        <xsl:text>Tarih</xsl:text>
                    </th>
                   </tr>
              </thead>
              <tbody>
                  <xsl:for-each select="//n1:Invoice/cac:BillingReference">
                  <tr>
                          <td class="cancellation-body"> 
                              <xsl:value-of select="cac:InvoiceDocumentReference/cbc:ID" />
                          </td>
                          <td class="cancellation-body">
                              <xsl:value-of select="cac:InvoiceDocumentReference/cbc:IssueDate" />
                          </td>
                      </tr>
                  </xsl:for-each>
              </tbody>
          </table>
        </xsl:if>
        
        <table id="lineTable" style="width:950px;" border=" 1 ">
                <tr>
                                
                    <td><b>Banka Adı</b></td>
                                  <td><b>Şube Adı</b></td>
                                  <td><b>Şube Kodu</b></td>
                                  <td><b>Döviz Tipi</b></td>
                                  <td><b>Hesap No</b></td>
                                  <td><b>IBAN</b></td>
                </tr>
                <tr>
                  <td>KUVEYTTÜRK KATILIM BANKASI</td>
                  <td>ULUYOL</td>
                  <td>339</td>
                  <td>TL</td>
                  <td>95351072-4</td>
                   <td>TR30 0020 5000 0953 5107 2000 04</td>
                </tr>
            <tr>
                  <td>KUVEYTTÜRK KATILIM BANKASI</td>
                  <td>ULUYOL</td>
                  <td>339</td>
                  <td>USD</td>
                  <td>95351072-110</td>
                   <td>TR78 0020 5000 0953 5107 2001 10</td>
                </tr>
          
           <tr>
                  <td>KUVEYTTÜRK KATILIM BANKASI</td>
                  <td>ULUYOL</td>
                  <td>339</td>
                  <td>EURO</td>
                  <td>95351072-111</td>
                   <td>TR51 0020 5000 0953 5107 2001 11</td>
                </tr>
              
          
          <tr>
                  <td>VAKIF KATILIM BANKASI</td>
                  <td>GÜNEŞLİ</td>
                  <td>63</td>
                  <td>TL</td>
                  <td>272439</td>
                   <td>TR70 0021 0000 0002 7243 9000 01</td>
                </tr>
          
             
          <tr>
                  <td>VAKIF KATILIM BANKASI</td>
                  <td>GÜNEŞLİ</td>
                  <td>63</td>
                  <td>USD</td>
                  <td>272439</td>
                   <td>TR86 0021 0000 0002 7243 9001 01</td>
                </tr>
          
             <tr>
                  <td>VAKIF KATILIM BANKASI</td>
                  <td>GÜNEŞLİ</td>
                  <td>63</td>
                  <td>EURO</td>
                  <td>272439</td>
                   <td>TR59 0021 0000 0002 7243 9001 02</td>
                </tr>
          
          
          
             <tr>
                  <td>ALBARAKA KATILIM BANKASI</td>
                  <td>YENİBOSNA</td>
                  <td>226</td>
                  <td>TL</td>
                  <td>226-8080349-1</td>
                   <td>TR64 0020 3000 0808 0349 0000 01</td>
                </tr>
          
            <tr>
                  <td>ALBARAKA KATILIM BANKASI</td>
                  <td>YENİBOSNA</td>
                  <td>226</td>
                  <td>USD</td>
                  <td>226-8080349-2</td>
                   <td>TR37 0020 3000 0808 0349 0000 02</td>
                </tr>
          
                      <tr>
                  <td>ALBARAKA KATILIM BANKASI</td>
                  <td>YENİBOSNA</td>
                  <td>226</td>
                  <td>EURO</td>
                  <td>226-8080349-3</td>
                   <td>TR10 0020 3000 0808 0349 0000 03</td>
                </tr>
          
          
            <tr>
                  <td>ZİRAAT KATILIM BANKASI</td>
                  <td>BAĞCILAR</td>
                  <td>9300</td>
                  <td>TL</td>
                  <td>1115388-1</td>
                   <td>TR27 0020 9000 0111 5388 0000 01</td>
                </tr>
           <tr>
                  <td>ZİRAAT KATILIM BANKASI</td>
                  <td>BAĞCILAR</td>
                  <td>9300</td>
                  <td>USD</td>
                  <td>1115388-2</td>
                   <td>TR97 0020 9000 0111 5388 0000 02</td>
                </tr>
               <tr>
                  <td>ZİRAAT KATILIM BANKASI</td>
                  <td>BAĞCILAR</td>
                  <td>9300</td>
                  <td>EURO</td>
                  <td>1115388-3</td>
                   <td>TR70 0020 9000 0111 5388 0000 03</td>
                </tr>
          
           <tr>
                  <td>EMLAK KATILIM BANKASI</td>
                  <td>GÜNEŞLİ</td>
                  <td>31</td>
                  <td>TL</td>
                  <td>534613-1</td>
                   <td>TR02 0021 1000 0005 3461 3000 01</td>
                </tr>
          
           <tr>
                  <td>EMLAK KATILIM BANKASI</td>
                  <td>GÜNEŞLİ</td>
                  <td>31</td>
                  <td>USD</td>
                  <td>534613-101</td>
                   <td>TR18 0021 1000 0005 3461 3001 01</td>
                </tr>
          
              <tr>
                  <td>EMLAK KATILIM BANKASI</td>
                  <td>GÜNEŞLİ</td>
                  <td>31</td>
                  <td>EURO</td>
                  <td>534613-102</td>
                   <td>TR88 0021 1000 0005 3461 3001 02</td>
                </tr>
          
          
            <!--   <tr>
                  <td>ZİRAAT KATILIM</td>
                  <td>TR27 0020 9000 0111 5388 0000 01</td>
                  <td>TR97 0020 9000 0111 5388 0000 02</td>
                  <td>TR70 0020 9000 0111 5388 0000 03</td>
                </tr>
                <tr>
                  <td>EMLAK KATILIM</td>
                  <td>TR02 0021 1000 0005 3461 3000 01</td>
                  <td>TR18 0021 1000 0005 3461 3001 01</td>
                  <td>TR88 0021 1000 0005 3461 3001 02</td>
                </tr>
                <tr>
                  <td>VAKIF KATILIM</td>
                  <td>TR70 0021 0000 0002 7243 9000 01</td>
                  <td>TR86 0021 0000 0002 7243 9001 01</td>
                  <td>TR59 0021 0000 0002 7243 9001 02</td>
                </tr>
                <tr>
                  <td>ALBARAKA TÜRK</td>
                  <td>TR64 0020 3000 0808 0349 0000 01</td>
                  <td>TR37 0020 3000 0808 0349 0000 02</td>
                  <td>TR10 0020 3000 0808 0349 0000 03</td>
                </tr>-->


              </table>
        
        
          <div class="tbl_capth tbl_cap mb-2">
                <!-- Fatura açıklama alanı burada bulunuyor @ACIKLAMA-->
                      <xsl:if test="//n1:Invoice/cbc:Note">
                      <span style="font-weight:bold; color:black;"><u>Fatura Açıklaması: </u></span>
                      <xsl:for-each select="//n1:Invoice/cbc:Note">
                      <div class="faturanotu">
                          <xsl:if test="(substring(.,1,13) != 'Ticaret Sicil') and (substring(.,1,9) != 'Mersis No') and (substring(.,1,13) != 'KDV_IST_TUTAR') and (substring(.,1,19) != 'KDV_IST_DAHIL_TUTAR') and (substring(.,1,9) != '#NoPrint#')">
                             <xsl:value-of select="." />
                          </xsl:if></div></xsl:for-each>
                      </xsl:if>
                      <!-- Fatura açıklama alanı burada bitiyor -->
                      <!-- Kullanıcının girdiği açıklama alanı burada bulunuyor @KULLANICIACIKLAMA-->
                      <description id="invoicedescription" class="aciklama"></description>
                      <!-- Kullanıcının girdiği açıklama alanı burada bitiyor -->
                      
                      <!-- Banka Bilgileri ASELSAN -->
                    <!--  <xsl:if test="//n1:Invoice/cac:PaymentMeans">
                      <div class="tbl_capth tbl_cap mb-2">
                          <span style="font-weight:bold; color:black;"><u>Banka Bilgileri: </u></span>
                          <table id="bankalarTable" style="width:100%; margin-top:10px;">
                              <tr>
                                  <td><b>Banka Adı</b></td>
                                  <td><b>Şube Adı</b></td>
                                  <td><b>Şube Kodu</b></td>
                                  <td><b>Döviz Tipi</b></td>
                                  <td><b>Hesap No</b></td>
                                  <td><b>IBAN</b></td>
                              </tr>
                              <xsl:for-each select="//n1:Invoice/cac:PaymentMeans">
                              <tr>
                                  <td><xsl:value-of select="cac:PayeeFinancialAccount/cac:FinancialInstitution/cac:FinancialInstitutionBranch/cac:FinancialInstitution/cbc:Name"/></td>
                                  <td><xsl:value-of select="cac:PayeeFinancialAccount/cac:FinancialInstitution/cac:FinancialInstitutionBranch/cbc:Name"/></td>
                                  <td><xsl:value-of select="cac:PayeeFinancialAccount/cac:FinancialInstitution/cac:FinancialInstitutionBranch/cbc:ID"/></td>
                                  <td><xsl:value-of select="cac:PayeeFinancialAccount/cbc:CurrencyCode"/></td>
                                  <td><xsl:value-of select="cac:PayeeFinancialAccount/cbc:ID"/></td>
                                  <td><xsl:value-of select="cac:PayeeFinancialAccount/cbc:ID"/></td>
                              </tr>
                              </xsl:for-each>
                          </table>
                      </div>
                      </xsl:if>-->
                      <!-- Banka Bilgileri ASELSAN -->
          </div>            
        </div>
      </body>
        </xsl:otherwise>
  </xsl:choose>
    </html>
  </xsl:template>
  <xsl:template match="dateFormatter">
    <xsl:value-of select="substring(.,9,2)" />-
    <xsl:value-of select="substring(.,6,2)" />-
    <xsl:value-of select="substring(.,1,4)" /></xsl:template>
    
  <xsl:template match="//n1:Invoice/cac:InvoiceLine">
    <tr id="lineTableTr">
      <!-- Mal Hizmet Tablosundaki KDV Tutarı Alanı Burada Bitiyor -->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal Hizmet Tablosundaki Satır No alanı burada bulunuyor @SATIRNO -->
      <xsl:if test="./cbc:ID">
        <td class="lineTableBudgetTr invoiceproductinvoiceorderno">
          <span>
            <xsl:text> </xsl:text>
            <xsl:value-of select="./cbc:ID" />
          </span>
        </td>
      </xsl:if>
      
        <!-- KALEM SAS NO VERİ -->          
			      <td class="lineTableTd">
                 <xsl:for-each select="./cac:Item/cac:BuyersItemIdentification/cbc:ID">
                   <xsl:value-of select=".">
                   </xsl:value-of></xsl:for-each>
            </td>
      
        <!-- yerlilik oranı VERİ -->       
       <!--  <xsl:if test="./cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(@schemeID)]">
			      <td class="lineTableTd">
                 <xsl:for-each select="./cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(@schemeID)]">
                   <xsl:value-of select=".">
                   </xsl:value-of></xsl:for-each>
            </td>
        </xsl:if>-->  
      
 
      
      
      <!-- Satır No alanı burada bitiyor -->
      <xsl:if test="./cac:Item/cbc:BrandName">
        <td class="lineTableBudgetTr brandname">
          <span>
            <xsl:text> </xsl:text>
            <xsl:for-each select="./cac:Item/cbc:BrandName">
              <xsl:value-of select="."></xsl:value-of>
            </xsl:for-each>
          </span>
        </td>
      </xsl:if>
      
    
            <td class="lineTableBudgetTr stockcode" id="stockcode">
                <span>
                    <xsl:text> </xsl:text>
                    <xsl:for-each select="./cac:Item/cac:ManufacturersItemIdentification/cbc:ID">
                        <xsl:value-of select="."></xsl:value-of>
                    </xsl:for-each>
                </span>
            </td>
       
      
      <!-- //////////////////////////MİKRO///////////////////////// -->
        <xsl:if test="./cac:Item/cac:SellersItemIdentification/cbc:ID">
            <td class="lineTableBudgetTr stockcode" id="stockcode">
                <span>
                    <xsl:text> </xsl:text>
                    <xsl:for-each select="./cac:Item/cac:SellersItemIdentification/cbc:ID">
                        <xsl:value-of select="."></xsl:value-of>
                    </xsl:for-each>
                </span>
            </td>
        </xsl:if>
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal/Hizmet Adı alanıburada bulunuyor -->
      <xsl:if test="./cac:Item/cbc:Name">
        <td class="lineTableBudgetTr">
          <span>
            <xsl:text> </xsl:text>
            <xsl:value-of select="./cac:Item/cbc:Name" />
          </span>
        </td>
      </xsl:if>
      <!-- Mal/Hizmet adı alanı burada bitiyor -->
      
      
      <!--AÇIKLAMA
       <td class="lineTableTd" align="right">
                <xsl:value-of select="./cbc:Note"/>
                <xsl:text>&#160;</xsl:text>
            </td>  -->
         
        <!-- Alıcı ürün kodu alanı burada bulunuyor -->
      
                 <td class="lineTableBudgetTr stockcode">
                
                <span>
                <xsl:text> </xsl:text>
                <xsl:for-each select="./cac:Item/cac:BuyersItemIdentification/cbc:ID">
                <xsl:value-of select="."></xsl:value-of>
                </xsl:for-each>
                </span>
                </td>
      
      

        <!-- Alıcı ürün kodu alanı burada bitiyor -->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <xsl:if test="./cbc:InvoicedQuantity">
        <td class="lineTableBudgetTr">
          <span>
            <xsl:text> </xsl:text>
            <xsl:value-of select="format-number(./cbc:InvoicedQuantity, '###.##0,########', 'european')" />
            <xsl:if test="./cbc:InvoicedQuantity/@unitCode">
              <xsl:for-each select="./cbc:InvoicedQuantity">
                <xsl:text></xsl:text>
                <xsl:choose>
                  <xsl:when test="@unitCode  = 'TNE'">
                    <span>
                      <xsl:text> Ton</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'PK'">
                    <span>
                      <xsl:text> Koli</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'BX'">
                    <span>
                      <xsl:text> Kutu</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'LTR'">
                    <span>
                      <xsl:text> LT</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'DMK'">
                    <span>
                      <xsl:text> DM2</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'DMQ'">
                    <span>
                      <xsl:text> DM3</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'C62'">
                    <span>
                      <xsl:text> Adet</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'T3'">
                    <span>
                      <xsl:text> 1000 Adet</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'D40'">
                    <span>
                      <xsl:text> 1000 LT</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'R9'">
                    <span>
                      <xsl:text> 1000 M3</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'D30'">
                    <span>
                      <xsl:text> Brüt Kalori</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'PR'">
                    <span>
                      <xsl:text> Çift</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'D61'">
                    <span>
                      <xsl:text> Dakika</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'DMT'">
                    <span>
                      <xsl:text> DM</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'DZN'">
                    <span>
                      <xsl:text> Düzine</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'WEE'">
                    <span>
                      <xsl:text> Hafta</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'NCL'">
                    <span>
                      <xsl:text> Hücre Adet</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'TC'">
                    <span>
                      <xsl:text> Kamyon</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'B32'">
                    <span>
                      <xsl:text> KG M2</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'KWT'">
                    <span>
                      <xsl:text> KW</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MMK'">
                    <span>
                      <xsl:text> MM2</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'PF'">
                    <span>
                      <xsl:text> Palet</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'RO'">
                    <span>
                      <xsl:text> Rulo</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'LPA'">
                    <span>
                      <xsl:text> Saf Alkol LT</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'D62'">
                    <span>
                      <xsl:text> Saniye</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'SET'">
                    <span>
                      <xsl:text> Set</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'CCT'">
                    <span>
                      <xsl:text> Ton Baş. Taşıma Kap.</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'ANN'">
                    <span>
                      <xsl:text> Yıl</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'ACR'">
                    <span>
                      <xsl:text> Dönüm</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'KGM'">
                    <span>
                      <xsl:text> KG</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'KJO'">
                    <span>
                      <xsl:text> kJ</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'GRM'">
                    <span>
                      <xsl:text> G</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MGM'">
                    <span>
                      <xsl:text> MG</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'NT'">
                    <span>
                      <xsl:text> Net Ton</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'GT'">
                    <span>
                      <xsl:text> GT</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MTR'">
                    <span>
                      <xsl:text> M</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MMT'">
                    <span>
                      <xsl:text> MM</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'KTM'">
                    <span>
                      <xsl:text> KM</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MLT'">
                    <span>
                      <xsl:text> ML</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MMQ'">
                    <span>
                      <xsl:text> MM3</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'CLT'">
                    <span>
                      <xsl:text> CL</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'CMK'">
                    <span>
                      <xsl:text> CM2</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'CMQ'">
                    <span>
                      <xsl:text> CM3</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'CMT'">
                    <span>
                      <xsl:text> CM</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'CR'">
                    <span>
                      <xsl:text> Sandık</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MTK'">
                    <span>
                      <xsl:text> M2</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MTQ'">
                    <span>
                      <xsl:text> M3</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'DAY'">
                    <span>
                      <xsl:text> Gün</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MON'">
                    <span>
                      <xsl:text> Ay</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'PA'">
                    <span>
                      <xsl:text> Paket</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'KWH'">
                    <span>
                      <xsl:text> KWH</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'MWH'">
                    <span>
                      <xsl:text> MWH</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'CTM'">
                    <span>
                      <xsl:text> Karat</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'BG'">
                    <span>
                      <xsl:text> Poşet</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'SA'">
                    <span>
                      <xsl:text> Çuval</xsl:text>
                    </span>
                  </xsl:when>
                  <xsl:when test="@unitCode  = 'HUR'">
                    <span>
                      <xsl:text> Saat</xsl:text>
                    </span>
                  </xsl:when>
                 <xsl:when test="@unitCode  = 'CH'">
                    <span>
                      <xsl:text> Konteyner</xsl:text>
                    </span>
                 </xsl:when>
                 <xsl:when test="@unitCode  = 'LM'">
                    <span>
                      <xsl:text> Metre Tül</xsl:text>
                    </span>
                 </xsl:when>
                </xsl:choose>
              </xsl:for-each>
            </xsl:if>
          </span>
        </td>
      </xsl:if>
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal Hizmet Tablosundaki Birim Fiyat alanı burada bulunuyor @BIRIMFIYAt -->
      <xsl:if test="./cac:Price/cbc:PriceAmount">
        <td class="lineTableBudgetTr">
          <span>
            <xsl:text> </xsl:text>
            <xsl:value-of select="format-number(./cac:Price/cbc:PriceAmount, '###.##0,########', 'european')" />
            <xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID">
              <xsl:text></xsl:text>
              <xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID = &quot;TRY&quot; ">
                <xsl:text>TL</xsl:text>
              </xsl:if>
              <xsl:if test="./cac:Price/cbc:PriceAmount/@currencyID != &quot;TRY&quot;">
                <xsl:text> </xsl:text>
                <xsl:value-of select="./cac:Price/cbc:PriceAmount/@currencyID" />
              </xsl:if>
            </xsl:if>
          </span>
        </td>
      </xsl:if>
      <!-- Birim Fiyat alanı burada bitiyor -->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal Hizmet Tablosundaki İskonto Nedeni alanı burada bulunuyor @ISKONTONEDENI -->
      <xsl:choose>
        <xsl:when test="./cac:AllowanceCharge/cbc:AllowanceChargeReason">
          <xsl:if test="./cac:AllowanceCharge/cbc:AllowanceChargeReason">
            <td class="lineTableBudgetTr invoiceiskonto">
              <span>
                <xsl:value-of select="."></xsl:value-of>
              </span>
            </td>
          </xsl:if>
        </xsl:when>
        <!--<xsl:when test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
          <td id="lineTableTd" class="invoiceiskonto" align="right"></td>
        </xsl:when>-->
      </xsl:choose>
      <!-- İskonto Nedeni alanı burada bitiyor -->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal Hizmet Tablosundaki İskonto Oranı Alanı -->
      <xsl:choose>
        <xsl:when test="./cac:AllowanceCharge">
          <td class="lineTableBudgetTr invoiceiskonto">
            <span>
              <xsl:if test="./cac:AllowanceCharge/cbc:MultiplierFactorNumeric">
                <xsl:text> %</xsl:text>
                <xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:MultiplierFactorNumeric * 100, '###.##0,00', 'european')" />
              </xsl:if>
            </span>
          </td>
        </xsl:when>
        <xsl:when test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
          <td class="lineTableBudgetTr invoiceiskonto"></td>
        </xsl:when>
      </xsl:choose>
      <!-- İskonto Oranı Burada Bitiyor -->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal/Hizmet tablosundaki İskonto Tutarı alanı burada bulunuyor @ISKONTOTUTAR -->
      <xsl:choose>
        <xsl:when test="./cac:AllowanceCharge">
          <td class="lineTableBudgetTr invoiceiskonto">
            <span>
              <xsl:text> </xsl:text>
              <xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:Amount, '###.##0,00', 'european')" />
              <xsl:text></xsl:text>
              <xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID = 'TRY'">
                <xsl:text>TL</xsl:text>
              </xsl:if>
              <xsl:if test="./cac:AllowanceCharge/cbc:Amount/@currencyID != 'TRY'">
                <xsl:text> </xsl:text>
                <xsl:value-of select="./cac:AllowanceCharge/cbc:Amount/@currencyID" />
              </xsl:if>
            </span>
          </td>
        </xsl:when>
        <xsl:when test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
          <td class="lineTableBudgetTr invoiceiskonto"></td>
        </xsl:when>
      </xsl:choose>
      <!-- İskonto Tutarı alanı burada bitiyor -->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal/Hizmet tablosundaki İskonto Uygulanan alanı burada bulunuyor @İSKONTOUYGULANAN-->
      <xsl:choose>
        <xsl:when test="./cac:AllowanceCharge/cbc:BaseAmount">
          <td class="lineTableBudgetTr invoiceiskonto">
            <span>
              <xsl:text> </xsl:text>
              <xsl:value-of select="format-number(./cac:AllowanceCharge/cbc:BaseAmount, '###.##0,00', 'european')" />
              <xsl:text></xsl:text>
              <xsl:if test="./cac:AllowanceCharge/cbc:BaseAmount/@currencyID = 'TRY'">
                <xsl:text>TL</xsl:text>
              </xsl:if>
              <xsl:if test="./cac:AllowanceCharge/cbc:BaseAmount/@currencyID != 'TRY'">
                <xsl:text> </xsl:text>
                <xsl:value-of select="./cac:AllowanceCharge/cbc:Amount/@currencyID" />
              </xsl:if>
            </span>
          </td>
        </xsl:when>
        <xsl:when test="//n1:Invoice/cac:InvoiceLine/cac:AllowanceCharge">
          <td class="lineTableBudgetTr invoiceiskonto"></td>
        </xsl:when>
      </xsl:choose>
      <!-- İskonto Uygulanan alanı burada bitiyor -->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <xsl:choose>
      <xsl:when test="//n1:Invoice/cbc:ProfileID = 'IHRACAT'">
      <!--Teslim şartı burada başlıyor ADO-->
      
        <td class="lineTableBudgetTr">
          <span>
            <xsl:value-of select="./cac:Delivery/cac:DeliveryTerms/cbc:ID"/>
          </span>
        </td>
      
      
      <!--Teslim şartı burada bitiyor ADO-->
      <!--kap cinsi başlıyor ADO-->
      
      
        <td class="lineTableBudgetTr">
          <span>
            <xsl:value-of select="./cac:Delivery/cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage/cbc:PackagingTypeCode"/>
          </span>
        </td>
      
      <!--Kap cinsi bitiyor ADO-->
      <!--kap No başlıyor ADO-->
      
      
        <td class="lineTableBudgetTr">
          <span>
            <xsl:value-of select="./cac:Delivery/cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage/cbc:ID"/>
          </span>
        </td>
      
      <!--Kap No bitiyor ADO-->
      <!--kap adet başlıyor ADO-->
      
      
        <td class="lineTableBudgetTr">
          <span>
            <xsl:value-of select="./cac:Delivery/cac:Shipment/cac:TransportHandlingUnit/cac:ActualPackage/cbc:Quantity"/>
          </span>
        </td>
      
      <!--Kap adet bitiyor ADO-->
      <!--gönderilme şekli başlıyor ADO-->
       <td class="lineTableBudgetTr">
          <span>
      <xsl:choose>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=0"></xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=1">Denizyolu</xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=2">Demiryolu</xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=3">Karayolu</xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=4">Havayolu</xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=5">Posta</xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=6">Çok araçlı</xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=7">Sabit taşıma tesisleri</xsl:when>
                                <xsl:when test="./cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode=8">İç su taşımacılığı</xsl:when>
                            <xsl:otherwise>
                                <xsl:value-of select="//n1:Invoice/cac:InvoiceLine/cac:Delivery/cac:Shipment/cac:ShipmentStage/cbc:TransportModeCode"/>
                            </xsl:otherwise>
                            </xsl:choose>
                            </span>
        </td>
      
      <!--gönderilme şekli bitiyor ADO-->
      <!--GTIP no burada başlıyor ADO-->
       <td class="lineTableBudgetTr">
          <span>
          <xsl:value-of select="./cac:Delivery/cac:Shipment/cac:GoodsItem/cbc:RequiredCustomsID"/>
          </span>
       </td>
      <!--GTIP no burada bitiyor ADO-->
      </xsl:when>
      <xsl:otherwise>
      <!-- Mal/Hizmet tablosundaki KDV Oranı alanı burada bulunuyor @KDVORANI-->
      <xsl:if test="./cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
        <td class="lineTableBudgetTr">
          <span>
            <xsl:text> </xsl:text>
            <xsl:for-each select="./cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
              <xsl:if test="cbc:TaxTypeCode='0015' ">
                <xsl:text></xsl:text>
                <xsl:if test="../../cbc:Percent">
                  <xsl:text> %</xsl:text>
                  <xsl:value-of select="format-number(../../cbc:Percent, '###.##0,00', 'european')" />
                </xsl:if>
              </xsl:if>
            </xsl:for-each>
          </span>
        </td>
      </xsl:if>
      <!-- KDV Oranı alanı burada bitiyor -->
      <!-- //////////////////////////MİKRO/////////////////////////-->
        <xsl:if test="//n1:Invoice/cbc:InvoiceTypeCode='OZELMATRAH'">
            <td class="lineTableBudgetTr">
                <span>
                    <xsl:text> </xsl:text>
                    <xsl:for-each select="./cac:TaxTotal/cac:TaxSubtotal/cbc:TaxableAmount">
                        <xsl:value-of select="."></xsl:value-of>
                    </xsl:for-each>
                </span>
            </td>
        </xsl:if>
      <!-- Mal Hizmet Tablosundaki KDV Tutarı Alanı @KDVTUTARI-->
      <xsl:if test="./cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
        <td class="lineTableBudgetTr invoicetaxkdv">
          <span>
            <xsl:text> </xsl:text>
            <xsl:for-each select="./cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
              <xsl:if test="cbc:TaxTypeCode='0015' ">
                <xsl:text></xsl:text>
                <xsl:value-of select="format-number(../../cbc:TaxAmount, '###.##0,00', 'european')" />
                <xsl:if test="../../cbc:TaxAmount/@currencyID">
                  <xsl:text></xsl:text>
                  <xsl:if test="../../cbc:TaxAmount/@currencyID = 'TRY'">
                    <xsl:text>TL</xsl:text>
                  </xsl:if>
                  <xsl:if test="../../cbc:TaxAmount/@currencyID != 'TRY'">
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="../../cbc:TaxAmount/@currencyID" />
                  </xsl:if>
                </xsl:if>
              </xsl:if>
            </xsl:for-each>
          </span>
        </td>
      </xsl:if>
      </xsl:otherwise>
      </xsl:choose>
      <!--künye ado-->
      <xsl:if test="//n1:Invoice/cac:InvoiceLine/cac:Item/cac:AdditionalItemIdentification/cbc:ID/@schemeID='KUNYENO'">
      <td class="lineTableBudgetTr">
          <span>
          <xsl:value-of select="./cac:Item/cac:AdditionalItemIdentification/cbc:ID"/>
          </span>
      </td>
      </xsl:if>
      <!--künye ado-->
      <!--Yerlilik Oranı verisi ASELSAN-->
      <xsl:if test="./cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(@schemeID)]">
      <td class="lineTableBudgetTr">
          <span>
          <xsl:value-of select="./cac:Item/cac:AdditionalItemIdentification/cbc:ID[not(@schemeID)]"/>
          </span>
      </td>
      </xsl:if>
      <!--Yerlilik Oranı verisi ASELSAN-->
      <!-- KDV Tutarı alanı burada bitiyor-->
      <!-- Diğer vergiler alanı-->
        <xsl:if test="//n1:Invoice/cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
        <td class="lineTableBudgetTr invoicetaxkdv">
            <xsl:text>&#160;</xsl:text>
            <xsl:for-each select="./cac:TaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
                <xsl:if test="cbc:TaxTypeCode!='0015' ">
                    <xsl:value-of select="cbc:Name"/>
                    <xsl:if test="../../cbc:Percent">
                        <xsl:text> (%</xsl:text>
                        <xsl:value-of
                            select="format-number(../../cbc:Percent, '###.##0,00', 'european')"/>
                        <xsl:text>)=</xsl:text>
                    </xsl:if>
                    <xsl:for-each select="../../cbc:TaxAmount">
                        <xsl:call-template name="Curr_Type"/>
                        <xsl:text>&#10;</xsl:text>
                    </xsl:for-each>
                    <br></br>
                </xsl:if>
            </xsl:for-each>
            <xsl:for-each
                select="./cac:WithholdingTaxTotal/cac:TaxSubtotal/cac:TaxCategory/cac:TaxScheme">
                <xsl:text>KDV TEVKİFAT </xsl:text>
                <xsl:if test="../../cbc:Percent">
                    <xsl:text> (%</xsl:text>
                    <xsl:value-of
                        select="format-number(../../cbc:Percent, '###.##0,00', 'european')"/>
                    <xsl:text>)=</xsl:text>
                </xsl:if>
                <xsl:for-each select="../../cbc:TaxAmount">
                    <xsl:call-template name="Curr_Type"/>
                    <xsl:text>&#10;</xsl:text>
                </xsl:for-each>
            </xsl:for-each>
        </td>
        </xsl:if>
        <!-- Diğer vergiler alanı burada bitiyor-->
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal Hizmet Tablosundaki Toplam Tutar Alanı @TOPLAMTUTAR-->
      <xsl:if test="./cbc:LineExtensionAmount">
        <td class="lineTableBudgetTr">
          <span>
            <xsl:text> </xsl:text>
            <xsl:value-of select="format-number(./cbc:LineExtensionAmount, '###.##0,00', 'european')" />
            <xsl:if test="./cbc:LineExtensionAmount/@currencyID">
              <xsl:text></xsl:text>
              <xsl:if test="./cbc:LineExtensionAmount/@currencyID = 'TRY' ">
                <xsl:text>TL</xsl:text>
              </xsl:if>
              <xsl:if test="./cbc:LineExtensionAmount/@currencyID != 'TRY' ">
                <xsl:text> </xsl:text>
                <xsl:value-of select="./cbc:LineExtensionAmount/@currencyID" />
              </xsl:if>
            </xsl:if>
          </span>
        </td>
      </xsl:if>
      <!-- Toplam Tutar alanı burada bitiyor-->
      <!-- TEVKIFATIADE Tevkifatsız KDV Tutarı Alani-->
      <xsl:if test="//n1:Invoice/cbc:InvoiceTypeCode='TEVKIFATIADE'">
        <td class="lineTableTd">
          <xsl:text> </xsl:text>
          <xsl:for-each select="./cac:TaxTotal/cac:TaxSubtotal/cbc:TaxableAmount">
            <xsl:call-template name="Curr_Type" />
          </xsl:for-each>
        </td>
      </xsl:if>
      <!-- //////////////////////////MİKRO///////////////////////// -->
      <!-- Mal Hizmet Tablosundaki Toplam Tutar Alanı @TOPLAMTUTAR-->
    </tr>
    <xsl:if test="./cbc:Note">
    <xsl:choose>
    <xsl:when test="contains(.,'ACK:')">
    <tr>
        <td colspan="100" class="satiraciklama">
          <div style="padding: 10px;">
            Açıklama:
            <xsl:for-each select="./cbc:Note">
                          <xsl:if test="contains(.,'ACK:')">
                          <xsl:value-of select="substring-after(.,'ACK:')" />
                          </xsl:if>
            </xsl:for-each>
           
            <!--<xsl:for-each select="./cbc:Note"><xsl:if test="contains(.,'ACK')"><xsl:value-of select="substring-after(.,'ACK:')"/></xsl:if></xsl:for-each>--></div>
        </td>
      </tr>
    </xsl:when>
    <xsl:otherwise>
      <tr>
        <td colspan="100" class="satiraciklama">
          <div style="padding: 10px;">
            Açıklama:
            <xsl:for-each select="./cbc:Note">
                          <xsl:if test="(substring(.,1,6) != 'Birim:') and (substring(.,1,8) != 'Birim_1:') and (substring(.,1,14) != 'Birim1_Miktar:') and (substring(.,1,8) != 'Birim_2:') and (substring(.,1,12) != 'Birim2_Oran:') and (substring(.,1,14) != 'Birim2_Miktar:') and (substring(.,1,8) != 'Birim_3:') and (substring(.,1,12) != 'Birim3_Oran:') and (substring(.,1,14) != 'Birim3_Miktar:') and (substring(.,1,4) != 'ACK:') and (substring(.,1,9) != '#NoPrint#') and (substring(.,1,7) != 'IND1|m|') and (substring(.,1,7) != 'IND2|m|') and (substring(.,1,7) != 'IND3|m|') and (substring(.,1,7) != 'IND4|m|') and (substring(.,1,7) != 'IND5|m|') and (substring(.,1,7) != 'IND6|m|') and (substring(.,1,18) != 'DigerVergiToplami:')">
                            <xsl:value-of select="." />
                          </xsl:if></xsl:for-each>
            
           
            <!--<xsl:for-each select="./cbc:Note"><xsl:if test="contains(.,'ACK')"><xsl:value-of select="substring-after(.,'ACK:')"/></xsl:if></xsl:for-each>--></div>
        </td>
      </tr>
   </xsl:otherwise>
   </xsl:choose>
   </xsl:if>
  </xsl:template>
  <xsl:template name="Curr_Type">
  <xsl:value-of select="format-number(., '###.##0,0000', 'european')" />
    <xsl:if test="@currencyID">
      <xsl:text></xsl:text>
      <xsl:choose>
        <xsl:when test="@currencyID = 'TRL' or @currencyID = 'TRY'">
          <xsl:text>TL</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@currencyID" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>
 
</xsl:stylesheet>
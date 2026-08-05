"""Renders invoices through admin/user-supplied XSLT stylesheets.

XSLT 1.0 (what libxslt/lxml supports) has no XSL-FO/PDF processor available
here, so the output of this module is always HTML text — never a PDF
directly. The HTML this module produces is fed into the same Playwright
print-to-PDF step already used for visual templates (see pdf_service.py).

Security: XSLT stylesheets are untrusted input (uploaded by admins or, once
enabled, end users). lxml's XSLT processor can otherwise execute the
document() function and read/write files or network resources from within a
stylesheet. Every parse in this module uses a locked-down XMLParser (no DTD
loading, no entity resolution, no network access) to prevent XXE, and every
transform is compiled with XSLTAccessControl.DENY_ALL to block document(),
file I/O, and network I/O from the stylesheet itself.
"""

from decimal import Decimal

from lxml import etree

from app.models.invoice import Invoice

_SAFE_PARSER = etree.XMLParser(
    resolve_entities=False,
    no_network=True,
    load_dtd=False,
    dtd_validation=False,
    huge_tree=False,
)

_DENY_ALL_ACCESS_CONTROL = etree.XSLTAccessControl.DENY_ALL


class XsltValidationError(ValueError):
    """Raised when uploaded XSLT content is malformed or fails to compile."""


def _money(value: Decimal) -> str:
    return f"{value:.2f}"


def build_invoice_xml(
    invoice: Invoice,
    field_values: dict[str, str],
    line_items: list[dict],
    totals: dict[str, str],
) -> etree._Element:
    """Serializes invoice + customer + line item data into an <Invoice> XML
    tree that an uploaded stylesheet can query via XPath."""
    root = etree.Element("Invoice")

    fields_el = etree.SubElement(root, "Fields")
    for key, value in field_values.items():
        field_el = etree.SubElement(fields_el, "Field", key=key)
        field_el.text = value

    line_items_el = etree.SubElement(root, "LineItems")
    for item in line_items:
        item_el = etree.SubElement(line_items_el, "LineItem")
        etree.SubElement(item_el, "Description").text = str(item["description"])
        etree.SubElement(item_el, "Quantity").text = str(item["quantity"])
        etree.SubElement(item_el, "UnitPrice").text = str(item["unit_price"])
        etree.SubElement(item_el, "LineTotal").text = str(item["line_total"])

    totals_el = etree.SubElement(root, "Totals")
    etree.SubElement(totals_el, "Subtotal").text = totals["subtotal"]
    etree.SubElement(totals_el, "Tax").text = totals["tax_total"]
    etree.SubElement(totals_el, "GrandTotal").text = totals["grand_total"]
    etree.SubElement(totals_el, "Currency").text = totals["currency"]

    customer = invoice.customer
    customer_el = etree.SubElement(root, "Customer")
    for tag, value in {
        "Name": customer.name,
        "Email": customer.email,
        "Address": customer.address,
        "City": customer.city,
        "PostalCode": customer.postal_code,
        "Country": customer.country,
        "Phone": customer.phone,
        "TaxOffice": customer.tax_office,
        "TaxNumber": customer.tax_number,
    }.items():
        etree.SubElement(customer_el, tag).text = value or ""

    return root


def _parse_xslt(xslt_content: str) -> etree.XSLT:
    try:
        xslt_tree = etree.fromstring(xslt_content.encode("utf-8"), parser=_SAFE_PARSER)
    except etree.XMLSyntaxError as exc:
        raise XsltValidationError(f"Geçersiz XSLT içeriği: {exc}") from exc

    try:
        return etree.XSLT(xslt_tree, access_control=_DENY_ALL_ACCESS_CONTROL)
    except etree.XSLTParseError as exc:
        raise XsltValidationError(f"XSLT derlenemedi: {exc}") from exc


def validate_xslt(xslt_content: str) -> None:
    """Raises XsltValidationError if xslt_content is not well-formed XML or
    fails to compile as an XSLT stylesheet. Callers turn this into HTTP 400."""
    _parse_xslt(xslt_content)


def render_xslt_html(
    template_xslt_content: str,
    invoice: Invoice,
    field_values: dict[str, str],
    line_items: list[dict],
    totals: dict[str, str],
) -> str:
    transform = _parse_xslt(template_xslt_content)
    xml_doc = build_invoice_xml(invoice, field_values, line_items, totals)
    try:
        result_tree = transform(xml_doc)
    except etree.XSLTApplyError as exc:
        raise XsltValidationError(f"XSLT dönüşümü uygulanamadı: {exc}") from exc
    return str(result_tree)

import urllib.request
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from xml.etree import ElementTree

TCMB_URL = "https://www.tcmb.gov.tr/kurlar/today.xml"
CACHE_TTL = timedelta(minutes=15)

_cache: dict[str, tuple[datetime, Decimal]] = {}


def _fetch_rates() -> dict[str, Decimal]:
    # httpx/httpcore fails TLS negotiation against TCMB's server in some environments
    # (SSL record layer failure); stdlib urllib connects fine, so it's used here instead.
    req = urllib.request.Request(TCMB_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        content = resp.read()
    root = ElementTree.fromstring(content)

    rates: dict[str, Decimal] = {}
    for currency_el in root.findall("Currency"):
        code = currency_el.get("Kod")
        if not code:
            continue
        selling = currency_el.findtext("ForexSelling")
        buying = currency_el.findtext("ForexBuying")
        value = selling or buying
        if value:
            rates[code] = Decimal(value)
    return rates


def get_exchange_rate(currency_code: str) -> Decimal:
    if currency_code == "TRY":
        return Decimal("1")

    cached = _cache.get(currency_code)
    if cached is not None:
        cached_at, rate = cached
        if datetime.now(timezone.utc) - cached_at < CACHE_TTL:
            return rate

    rates = _fetch_rates()
    rate = rates.get(currency_code)
    if rate is None:
        raise ValueError(f"Desteklenmeyen para birimi: {currency_code}")

    _cache[currency_code] = (datetime.now(timezone.utc), rate)
    return rate

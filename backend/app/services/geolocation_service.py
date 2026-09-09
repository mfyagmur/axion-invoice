import ipaddress
import logging
import threading
import time
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)

_IP_API_URL = "http://ip-api.com/json/{ip}"
_RATE_LIMIT_PER_MINUTE = 40
_CACHE_TTL_SECONDS = 6 * 60 * 60

_lock = threading.Lock()
_cache: dict[str, tuple["GeoLocation | None", float]] = {}
_request_timestamps: list[float] = []


@dataclass
class GeoLocation:
    country: str | None
    city: str | None
    lat: float | None
    lon: float | None


def _is_public_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return not (addr.is_private or addr.is_loopback or addr.is_link_local or addr.is_reserved)


def _rate_limit_allows() -> bool:
    now = time.monotonic()
    with _lock:
        while _request_timestamps and now - _request_timestamps[0] > 60:
            _request_timestamps.pop(0)
        if len(_request_timestamps) >= _RATE_LIMIT_PER_MINUTE:
            return False
        _request_timestamps.append(now)
        return True


def lookup(ip: str | None) -> GeoLocation | None:
    if not ip or not _is_public_ip(ip):
        return None

    now = time.monotonic()
    with _lock:
        cached = _cache.get(ip)
        if cached is not None and now - cached[1] < _CACHE_TTL_SECONDS:
            return cached[0]

    if not _rate_limit_allows():
        logger.warning("Geolocation rate limit reached, skipping lookup for %s", ip)
        return None

    try:
        response = httpx.get(
            _IP_API_URL.format(ip=ip),
            params={"fields": "status,country,city,lat,lon"},
            timeout=2.0,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("status") != "success":
            result = None
        else:
            result = GeoLocation(
                country=data.get("country"),
                city=data.get("city"),
                lat=data.get("lat"),
                lon=data.get("lon"),
            )
    except Exception:
        logger.warning("Geolocation lookup failed for %s", ip, exc_info=True)
        result = None

    with _lock:
        _cache[ip] = (result, now)
    return result

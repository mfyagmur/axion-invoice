import threading
from collections import deque
from dataclasses import dataclass
from datetime import datetime, timezone

SLOW_REQUEST_THRESHOLD_MS = 500.0
_MAX_RECORDS = 500


@dataclass
class RequestRecord:
    timestamp: datetime
    duration_ms: float
    status_code: int
    path: str
    method: str
    error_detail: str | None = None


_lock = threading.Lock()
_records: deque[RequestRecord] = deque(maxlen=_MAX_RECORDS)


def record_request(
    duration_ms: float,
    status_code: int,
    path: str,
    method: str,
    error_detail: str | None = None,
) -> None:
    with _lock:
        _records.append(
            RequestRecord(
                timestamp=datetime.now(timezone.utc),
                duration_ms=duration_ms,
                status_code=status_code,
                path=path,
                method=method,
                error_detail=error_detail,
            )
        )


def get_records() -> list[RequestRecord]:
    with _lock:
        return list(_records)

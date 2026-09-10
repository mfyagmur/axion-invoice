import threading
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

_DEFAULT_WINDOW_SECONDS = 45


@dataclass
class PresenceEntry:
    client_id: str
    user_id: uuid.UUID | None
    is_demo: bool
    last_seen: datetime


_lock = threading.Lock()
_entries: dict[str, PresenceEntry] = {}


def record_heartbeat(client_id: str, user_id: uuid.UUID | None, is_demo: bool) -> None:
    with _lock:
        _entries[client_id] = PresenceEntry(
            client_id=client_id,
            user_id=user_id,
            is_demo=is_demo,
            last_seen=datetime.now(timezone.utc),
        )


def get_online_counts(window_seconds: int = _DEFAULT_WINDOW_SECONDS) -> tuple[int, int]:
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=window_seconds)
    with _lock:
        stale = [client_id for client_id, entry in _entries.items() if entry.last_seen < cutoff]
        for client_id in stale:
            del _entries[client_id]

        total = len(_entries)
        registered_user_ids = {
            entry.user_id for entry in _entries.values() if entry.user_id is not None and not entry.is_demo
        }
        return total, len(registered_user_ids)

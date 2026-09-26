"""
app/db/client.py
Supabase client singleton.

Supports both key formats:
  - Legacy JWT (eyJ...) — used by supabase-py create_client directly
  - New secret key (sb_secret_...) — requires passing as a header directly;
    supabase-py validates the key format and rejects non-JWT keys, so we
    patch the client options to skip that validation.

On first import, verifies DB connectivity. Fails with a clear message on
second failure (single retry). Never loops forever.
"""
import os
import time
from functools import lru_cache

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@lru_cache
def get_supabase():
    """Return a cached Supabase client (or httpx-based shim for new key format)."""
    settings = get_settings()
    key = settings.SUPABASE_SERVICE_ROLE_KEY

    if key.startswith("sb_secret_") or key.startswith("sb_publishable_"):
        # New key format — supabase-py rejects it; use our thin HTTP shim
        client = _SupabaseShim(settings.SUPABASE_URL, key)
    else:
        # Legacy JWT — use supabase-py directly
        from supabase import create_client
        client = create_client(settings.SUPABASE_URL, key)

    _verify_connection(client)
    return client


def _verify_connection(client, retried: bool = False) -> None:
    """Single-retry connectivity check."""
    try:
        client.table("concepts").select("id").limit(1).execute()
        logger.info("db_connected", status="ok")
    except RuntimeError as exc:
        err_str = str(exc)
        # PGRST205 = table not found in schema cache — auth succeeded, schema not run yet
        if "PGRST205" in err_str or "schema cache" in err_str:
            logger.info("db_connected", status="ok_schema_pending",
                        note="concepts table missing — run docs/schema.sql first")
            return
        if retried:
            raise RuntimeError(
                f"Database connection failed after retry: {exc}. "
                "Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            ) from exc
        logger.warning("db_connection_failed", error=err_str, retry="yes")
        time.sleep(2)
        _verify_connection(client, retried=True)
    except Exception as exc:
        if retried:
            raise RuntimeError(
                f"Database connection failed after retry: {exc}. "
                "Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            ) from exc
        logger.warning("db_connection_failed", error=str(exc), retry="yes")
        time.sleep(2)
        _verify_connection(client, retried=True)


class _TableQuery:
    """Chainable query builder for the HTTP shim."""

    def __init__(self, base_url: str, headers: dict, table: str):
        self._base = base_url
        self._headers = headers
        self._table = table
        self._params: dict = {}
        self._insert_data = None
        self._upsert_data = None
        self._on_conflict = None
        self._method = "GET"

    def select(self, columns: str = "*"):
        self._params["select"] = columns
        self._method = "GET"
        return self

    def insert(self, data):
        self._insert_data = data
        self._method = "POST"
        return self

    def upsert(self, data, on_conflict: str = None):
        self._upsert_data = data
        self._on_conflict = on_conflict
        self._method = "POST"
        return self

    def eq(self, column: str, value):
        self._params[column] = f"eq.{value}"
        return self

    def limit(self, n: int):
        self._params["limit"] = n
        return self

    def execute(self):
        import httpx, json as _json

        url = f"{self._base}/rest/v1/{self._table}"
        headers = dict(self._headers)

        if self._upsert_data is not None:
            headers["Prefer"] = "resolution=merge-duplicates,return=representation"
            r = httpx.post(url, headers=headers, json=self._upsert_data, timeout=10)
        elif self._insert_data is not None:
            headers["Prefer"] = "return=representation"
            r = httpx.post(url, headers=headers, json=self._insert_data, timeout=10)
        else:
            # Build query params — filter params use key=value, select/limit direct
            params = {}
            for k, v in self._params.items():
                params[k] = v
            r = httpx.get(url, headers=headers, params=params, timeout=10)

        if r.status_code not in (200, 201, 204):
            raise RuntimeError(f"Supabase HTTP {r.status_code}: {r.text[:300]}")

        try:
            data = r.json() if r.text else []
        except Exception:
            data = []

        return _Result(data if isinstance(data, list) else [data])


class _Result:
    def __init__(self, data):
        self.data = data


class _SupabaseShim:
    """
    Minimal Supabase REST shim for new-format secret keys (sb_secret_...).
    Implements the same .table(...).select/insert/upsert/eq/limit/execute()
    interface used by the service layer.
    """

    def __init__(self, url: str, key: str):
        self._url = url.rstrip("/")
        self._headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }

    def table(self, name: str) -> _TableQuery:
        return _TableQuery(self._url, self._headers, name)

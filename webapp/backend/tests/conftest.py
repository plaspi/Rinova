import os
import pytest
from unittest.mock import MagicMock, patch
from typing import Any, Dict, List, Optional
from fastapi.testclient import TestClient

# 1. Setup Environment before imports
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-secret")

# 2. Fake DB Classes
class ExecResult:
    def __init__(self, data: Optional[List[Dict[str, Any]]]):
        self.data = data or []

class FakeAsyncQuery:
    def __init__(self, db: "FakeAsyncDB", table: str):
        self.db = db
        self.table = table
        self._filters = []
        self._order = None

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self._filters.append(("eq", key, value))
        return self

    def gte(self, key, value):
        self._filters.append(("gte", key, value))
        return self

    def lte(self, key, value):
        self._filters.append(("lte", key, value))
        return self

    def lt(self, key, value):
        self._filters.append(("lt", key, value))
        return self

    def in_(self, key, values):
        self._filters.append(("in", key, values))
        return self

    def order(self, key, desc: bool = False):
        self._order = (key, desc)
        return self

    def limit(self, _n):
        return self

    async def execute(self) -> ExecResult:
        data = list(self.db.datasets.get(self.table, []))
        for op, key, value in self._filters:
            if op == "eq":
                data = [d for d in data if d.get(key) == value]
            elif op == "in":
                data = [d for d in data if d.get(key) in set(value)]
            elif op in ("gte", "lte", "lt"):
                if op == "gte":
                    data = [d for d in data if d.get(key) is not None and d.get(key) >= value]
                elif op == "lte":
                    data = [d for d in data if d.get(key) is not None and d.get(key) <= value]
                elif op == "lt":
                    data = [d for d in data if d.get(key) is not None and d.get(key) < value]
        if self._order:
            k, desc = self._order
            data.sort(key=lambda d: d.get(k), reverse=bool(desc))
        return ExecResult(data)

class FakeAsyncDB:
    def __init__(self, datasets: Optional[Dict[str, List[Dict[str, Any]]]] = None):
        self.datasets = datasets if datasets is not None else {}

    def table(self, name: str) -> FakeAsyncQuery:
        return FakeAsyncQuery(self, name)

class FakeSyncQuery:
    def __init__(self, db: "FakeSyncDB", table: str):
        self.db = db
        self.table = table
        self._filters = []
        self._order = None
        self._limit = None

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self._filters.append(("eq", key, value))
        return self

    def gte(self, key, value):
        self._filters.append(("gte", key, value))
        return self

    def lte(self, key, value):
        self._filters.append(("lte", key, value))
        return self

    def order(self, key, desc: bool = False):
        self._order = (key, desc)
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    def execute(self) -> ExecResult:
        data = list(self.db.datasets.get(self.table, []))
        for op, key, value in self._filters:
            if op == "eq":
                data = [d for d in data if d.get(key) == value]
            elif op == "gte":
                data = [d for d in data if d.get(key) is not None and d.get(key) >= value]
            elif op == "lte":
                data = [d for d in data if d.get(key) is not None and d.get(key) <= value]
        if self._order:
            k, desc = self._order
            data.sort(key=lambda d: d.get(k), reverse=bool(desc))
        if self._limit is not None:
            data = data[: self._limit]
        return ExecResult(data)

class FakeSyncDB:
    def __init__(self, datasets: Optional[Dict[str, List[Dict[str, Any]]]] = None):
        self.datasets = datasets if datasets is not None else {}

    def table(self, name: str) -> FakeSyncQuery:
        return FakeSyncQuery(self, name)

# 3. Global Instances
_global_async_db = FakeAsyncDB()
_global_sync_db = FakeSyncDB()

# 4. Session Fixture to PATCH BEFORE IMPORT
@pytest.fixture(scope="session", autouse=True)
def patch_db_client():
    """
    Patches the supabase client at the module level BEFORE the app is imported.
    This ensures the app uses our FakeDB and not the real/default one.
    """
    with patch("backend.services.supabase_client.get_db", return_value=_global_async_db), \
         patch("backend.services.supabase_client._db", _global_async_db), \
         patch("backend.services.supabase_client.init_db", return_value=None), \
         patch("backend.routers.reports.sync_db", _global_sync_db):
        yield

@pytest.fixture(scope="session")
def app(patch_db_client):
    # Import app AFTER patching is active
    from backend.main import app as fastapi_app
    return fastapi_app

@pytest.fixture(autouse=True)
def reset_db_state():
    # Clear data before every test function
    _global_async_db.datasets.clear()
    _global_sync_db.datasets.clear()
    yield
    _global_async_db.datasets.clear()
    _global_sync_db.datasets.clear()

@pytest.fixture()
def client(app):
    from backend.services import auth as auth_mod
    # Override auth to simulate logged-in user
    app.dependency_overrides[auth_mod.get_current_user] = lambda: {"sub": "user-1", "role": "user"}
    
    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides = {}

@pytest.fixture()
def fake_db():
    return _global_async_db, _global_sync_db
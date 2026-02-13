from datetime import datetime, timedelta

# Valid UUIDs
PLANT_A_ID = "00000000-0000-0000-0000-000000000001"
PLANT_B_ID = "00000000-0000-0000-0000-000000000002"

def test_dashboard_plants_empty(client, fake_db):
    async_db, _ = fake_db
    r = client.get("/api/dashboard/plants")
    assert r.status_code == 200
    assert r.json() == []

def test_dashboard_plants_some(client, fake_db):
    async_db, _ = fake_db
    async_db.datasets["impianti"] = [
        {"id": PLANT_A_ID, "nome": "Impianto A", "status": "attivo", "user_id": "user-1"},
        {"id": PLANT_B_ID, "nome": "Impianto B", "status": "offline", "user_id": "user-1"},
    ]
    r = client.get("/api/dashboard/plants")
    assert r.status_code == 200
    plants = r.json()
    assert len(plants) == 2
    assert {p["id"] for p in plants} == {PLANT_A_ID, PLANT_B_ID}

def test_dashboard_live_no_plants(client, fake_db):
    async_db, _ = fake_db
    r = client.get("/api/production/live")
    assert r.status_code == 200
    j = r.json()
    assert j["plants"] == []
    assert j["kpi"]["totalEnergy"] == 0

def test_dashboard_live_with_data(client, fake_db):
    async_db, _ = fake_db
    now = datetime.now()
    start = now - timedelta(hours=1)

    async_db.datasets["impianti"] = [
        {"id": PLANT_A_ID, "nome": "Impianto A", "status": "attivo", "user_id": "user-1"},
    ]
    async_db.datasets["misurazioni"] = [
        {"impianto_id": PLANT_A_ID, "timestamp": start.isoformat(), "produzione_kw": 1.2},
        {"impianto_id": PLANT_A_ID, "timestamp": (start + timedelta(minutes=5)).isoformat(), "produzione_kw": 2.0},
    ]

    r = client.get("/api/production/live")
    assert r.status_code == 200
    j = r.json()
    assert j["plants"][0]["id"] == PLANT_A_ID
    assert PLANT_A_ID in j["charts"]
    assert j["kpi"]["peak"] >= 2.0
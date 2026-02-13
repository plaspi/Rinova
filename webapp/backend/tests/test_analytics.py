from datetime import datetime, timedelta

# Valid UUID
TEST_PLANT_ID = "00000000-0000-0000-0000-000000000001"

def test_history_day_no_data(client, fake_db):
    async_db, _ = fake_db
    # Use valid UUID
    r = client.get("/api/production/history", params={"period": "day", "plantId": TEST_PLANT_ID})
    assert r.status_code == 200
    j = r.json()
    assert j["kpi"]["totalEnergy"] == 0
    assert j["chart"] == [] or isinstance(j["chart"], list)

def test_history_week_with_data(client, fake_db):
    async_db, _ = fake_db
    now = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    async_db.datasets["impianti"] = [
        {"id": TEST_PLANT_ID, "user_id": "user-1"}
    ]

    # 2. Existing data for the history chart
    async_db.datasets["vista_settimanale"] = [
        {"impianto_id": TEST_PLANT_ID, "timestamp": (now - timedelta(days=2)).isoformat(), "produzione": 3.0},
        {"impianto_id": TEST_PLANT_ID, "timestamp": (now - timedelta(days=1)).isoformat(), "produzione": 7.0},
    ]
    
    r = client.get("/api/production/history", params={"period": "week", "plantId": TEST_PLANT_ID})
    assert r.status_code == 200
    j = r.json()
    assert j["kpi"]["totalEnergy"] == 10.0
    assert any(pt["Produzione"] > 0 for pt in j["chart"])
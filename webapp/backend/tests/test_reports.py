from datetime import datetime, timedelta

TEST_PLANT_ID = "00000000-0000-0000-0000-000000000001"

def test_report_download_live_with_data(client, fake_db):
    _async_db, sync_db = fake_db
    now = datetime.now()
    start = now - timedelta(hours=1)

    #Give the fake user ownership of the plant so the validation passes
    sync_db.datasets["impianti"] = [
        {"id": TEST_PLANT_ID, "user_id": "user-1"} 
    ]

    #Insert the dummy measurement data
    sync_db.datasets["misurazioni"] = [
        {"impianto_id": TEST_PLANT_ID, "timestamp": start.isoformat(), "produzione_kw": 1.0},
        {"impianto_id": TEST_PLANT_ID, "timestamp": (start + timedelta(minutes=10)).isoformat(), "produzione_kw": 2.0},
    ]

    r = client.get("/api/report/download", params={"period": "live", "plantId": TEST_PLANT_ID})
    
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("application/pdf")
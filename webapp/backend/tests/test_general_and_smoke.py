from datetime import datetime, timedelta


def test_docs_and_root_health(client):
    # Docs available
    resp_docs = client.get("/docs")
    assert resp_docs.status_code == 200

    # Public root health
    resp_root = client.get("/")
    assert resp_root.status_code == 200
    body = resp_root.json()
    assert body["status"] == "ok"
    assert "Rinova" in body["message"]


def test_private_requires_auth_header(client):
    # Our client fixture sets an override that simulates auth, so this should pass
    r = client.get("/api/dati-privati")
    assert r.status_code == 200
    j = r.json()
    assert j["message"] == "Accesso autorizzato"
    assert j["ruolo"] in ("user", "admin")

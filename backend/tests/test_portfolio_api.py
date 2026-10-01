import os
import uuid

import requests


BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://design-showcase-2058.preview.emergentagent.com").rstrip("/")


def test_contact_create_and_validation():
    payload = {
        "name": f"TEST_{uuid.uuid4().hex[:8]}",
        "email": "test@example.com",
        "project_type": "UI/UX",
        "message": "Portfolio regression test",
    }
    response = requests.post(f"{BASE_URL}/api/contact", json=payload, timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]
    assert data["id"] and data["created_at"]

    invalid = requests.post(f"{BASE_URL}/api/contact", json={"name": "only"}, timeout=20)
    assert invalid.status_code == 422


def test_api_root_and_status_collection():
    root = requests.get(f"{BASE_URL}/api/", timeout=20)
    assert root.status_code == 200
    assert root.json()["message"] == "Ved portfolio API"
    status = requests.get(f"{BASE_URL}/api/status", timeout=20)
    assert status.status_code == 200
    assert isinstance(status.json(), list)


def test_contact_honeypot_rejected():
    payload = {
        "name": "TEST_spam",
        "email": "spam@example.com",
        "project_type": "UI/UX",
        "message": "bot",
        "website": "https://spam.invalid",
    }
    response = requests.post(f"{BASE_URL}/api/contact", json=payload, timeout=20)
    assert response.status_code == 400
    assert response.json()["detail"] == "Spam check failed"


def test_contact_rate_limit_after_three_attempts():
    responses = []
    for index in range(4):
        responses.append(requests.post(f"{BASE_URL}/api/contact", json={
            "name": f"TEST_rate_{uuid.uuid4().hex[:8]}",
            "email": f"rate{index}@example.com",
            "project_type": "UI/UX",
            "message": "Rate limit regression test",
        }, timeout=20))
    assert [response.status_code for response in responses] == [200, 200, 200, 429]
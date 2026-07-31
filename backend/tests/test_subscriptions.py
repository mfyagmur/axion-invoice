def test_list_plans_returns_three_plans(client):
    response = client.get("/api/v1/plans")
    assert response.status_code == 200
    keys = {plan["key"] for plan in response.json()}
    assert keys == {"free", "pro", "business"}


def test_my_subscription_defaults_to_free(client, auth_headers: dict[str, str]):
    response = client.get("/api/v1/subscriptions/me", headers=auth_headers)
    assert response.status_code == 200
    body = response.json()
    assert body["plan"]["key"] == "free"
    assert body["status"] == "active"
    assert body["invoices_used_this_month"] == 0
    assert body["templates_used"] == 0


def test_checkout_without_stripe_key_returns_503(client, auth_headers: dict[str, str]):
    response = client.post(
        "/api/v1/subscriptions/checkout",
        json={"plan_key": "pro", "interval": "monthly"},
        headers=auth_headers,
    )
    assert response.status_code == 503


def test_portal_without_stripe_key_returns_503(client, auth_headers: dict[str, str]):
    # Stripe isn't configured in the test env (empty STRIPE_SECRET_KEY), so
    # create_portal_session's _require_configured() check fires before the
    # "no stripe_customer_id yet" 400 case ever gets reached.
    response = client.post("/api/v1/subscriptions/portal", headers=auth_headers)
    assert response.status_code == 503

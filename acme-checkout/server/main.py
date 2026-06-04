import os
import httpx
import stripe
import jwt
from fastapi import Depends, FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from svix.webhooks import Webhook, WebhookVerificationError

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
WEBHOOK_SECRET = os.environ["STRIPE_WEBHOOK_SECRET"]
ORDERS_SERVICE_URL = os.environ["ORDERS_SERVICE_URL"]
ORDERS_SERVICE_TOKEN = os.environ["ORDERS_SERVICE_TOKEN"]
CLERK_JWT_ISSUER = os.environ["CLERK_JWT_ISSUER"]
CLERK_JWKS_URL = f"{CLERK_JWT_ISSUER}/.well-known/jwks.json"
CLERK_WEBHOOK_SECRET = os.environ["CLERK_WEBHOOK_SECRET"]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
bearer_scheme = HTTPBearer()
jwks_client = jwt.PyJWKClient(CLERK_JWKS_URL)


def verify_clerk_jwt(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(creds.credentials).key
        payload = jwt.decode(
            creds.credentials,
            signing_key,
            algorithms=["RS256"],
            issuer=CLERK_JWT_ISSUER,
            options={"require": ["exp", "iat", "sub"]},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"invalid token: {e}")
    return payload["sub"]


class CheckoutRequest(BaseModel):
    amount_cents: int
    currency: str = "usd"


@app.post("/create-payment-intent")
def create_payment_intent(
    req: CheckoutRequest,
    idempotency_key: str = Header(...),
    user_id: str = Depends(verify_clerk_jwt),
):
    intent = stripe.PaymentIntent.create(
        amount=req.amount_cents,
        currency=req.currency,
        automatic_payment_methods={"enabled": True},
        metadata={"user_id": user_id},
        idempotency_key=idempotency_key,
    )
    return {"client_secret": intent.client_secret, "id": intent.id}


@app.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(...)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="invalid signature")

    if event.type == "payment_intent.succeeded":
        pi = event.data.object
        user_id = (pi.metadata or {}).get("user_id")
        mark_order_paid(
            payment_intent_id=pi.id,
            amount=pi.amount,
            currency=pi.currency,
            user_id=user_id,
        )
    elif event.type == "payment_intent.payment_failed":
        pi = event.data.object
        err = pi.last_payment_error or {}
        print(f"failed: {pi.id} code={err.get('code')} decline_code={err.get('decline_code')} message={err.get('message')}")
    else:
        print(f"unhandled event: {event.type} id={event.id}")
    return {"received": True}


@app.post("/clerk-webhook")
async def clerk_webhook(request: Request):
    payload = await request.body()
    try:
        event = Webhook(CLERK_WEBHOOK_SECRET).verify(payload, dict(request.headers))
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="invalid signature")

    event_type = event.get("type")
    data = event.get("data", {})
    if event_type == "user.created":
        provision_user(user_id=data["id"], email=_primary_email(data))
    elif event_type == "user.deleted":
        delete_user(user_id=data["id"])
    else:
        print(f"unhandled clerk event: {event_type}")
    return {"received": True}


def _primary_email(user_data: dict) -> str | None:
    addresses = user_data.get("email_addresses") or []
    primary_id = user_data.get("primary_email_address_id")
    for addr in addresses:
        if addr.get("id") == primary_id:
            return addr.get("email_address")
    return addresses[0].get("email_address") if addresses else None


def provision_user(*, user_id: str, email: str | None) -> None:
    response = httpx.post(
        f"{ORDERS_SERVICE_URL}/users/provision",
        json={"user_id": user_id, "email": email},
        headers={"Authorization": f"Bearer {ORDERS_SERVICE_TOKEN}"},
        timeout=10.0,
    )
    response.raise_for_status()


def delete_user(*, user_id: str) -> None:
    response = httpx.delete(
        f"{ORDERS_SERVICE_URL}/users/{user_id}",
        headers={"Authorization": f"Bearer {ORDERS_SERVICE_TOKEN}"},
        timeout=10.0,
    )
    response.raise_for_status()


def mark_order_paid(
    *, payment_intent_id: str, amount: int, currency: str, user_id: str | None
) -> None:
    # Raise on non-2xx: Stripe will retry the webhook, so the orders service
    # must be idempotent on payment_intent_id.
    response = httpx.post(
        f"{ORDERS_SERVICE_URL}/orders/mark-paid",
        json={
            "payment_intent_id": payment_intent_id,
            "amount": amount,
            "currency": currency,
            "user_id": user_id,
        },
        headers={"Authorization": f"Bearer {ORDERS_SERVICE_TOKEN}"},
        timeout=10.0,
    )
    response.raise_for_status()



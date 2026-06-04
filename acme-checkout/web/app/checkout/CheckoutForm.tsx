'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '@clerk/nextjs';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';

function PayButton() {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/done` },
    });
    if (error) setErr(error.message ?? 'payment failed');
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || busy} style={{ marginTop: 16 }}>
        {busy ? 'Processing…' : 'Pay $49.99'}
      </button>
      {err && <p style={{ color: 'red' }}>{err}</p>}
    </form>
  );
}

export function CheckoutForm() {
  const { getToken } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const idempotencyKey = crypto.randomUUID();
      const token = await getToken();
      const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount_cents: 4999, currency: 'usd' }),
      });
      const data = await res.json();
      setClientSecret(data.client_secret);
    })();
  }, [getToken]);

  if (!clientSecret) return <p>Loading…</p>;
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PayButton />
    </Elements>
  );
}

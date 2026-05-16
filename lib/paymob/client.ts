import "server-only";

const PAYMOB_BASE = "https://accept.paymob.com/api";

type AuthResponse = { token: string };
type OrderResponse = { id: number };
type PaymentKeyResponse = { token: string };

async function authenticate(): Promise<string> {
  const res = await fetch(`${PAYMOB_BASE}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayMob auth failed: ${res.status}`);
  const data = (await res.json()) as AuthResponse;
  return data.token;
}

async function registerOrder(
  authToken: string,
  params: { amount_cents: number; merchant_order_id: string }
): Promise<number> {
  const res = await fetch(`${PAYMOB_BASE}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: params.amount_cents,
      currency: "EGP",
      merchant_order_id: params.merchant_order_id,
      items: [],
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayMob order failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as OrderResponse;
  return data.id;
}

async function getPaymentKey(
  authToken: string,
  params: {
    amount_cents: number;
    order_id: number;
    integration_id: string;
    billing: Record<string, string>;
  }
): Promise<string> {
  const res = await fetch(`${PAYMOB_BASE}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: authToken,
      amount_cents: params.amount_cents,
      expiration: 3600,
      order_id: params.order_id,
      billing_data: params.billing,
      currency: "EGP",
      integration_id: params.integration_id,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayMob payment_key failed: ${res.status}`);
  const data = (await res.json()) as PaymentKeyResponse;
  return data.token;
}

export type PaymobInitParams = {
  amount: number; // in major currency unit (e.g. EGP)
  merchantOrderId: string;
  integrationId: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
};

export type PaymobInitResult = {
  paymobOrderId: number;
  paymentKey: string;
  iframeUrl: string;
};

export async function initPaymobPayment(
  params: PaymobInitParams
): Promise<PaymobInitResult> {
  const iframeId = process.env.PAYMOB_IFRAME_ID;
  if (!iframeId) throw new Error("PAYMOB_IFRAME_ID not configured");
  if (!process.env.PAYMOB_API_KEY) throw new Error("PAYMOB_API_KEY not configured");

  const amountCents = Math.round(params.amount * 100);
  const billing = {
    apartment: "NA",
    email: params.billing.email,
    floor: "NA",
    first_name: params.billing.first_name,
    street: "NA",
    building: "NA",
    phone_number: params.billing.phone_number,
    shipping_method: "NA",
    postal_code: "NA",
    city: "NA",
    country: "EG",
    last_name: params.billing.last_name,
    state: "NA",
  };

  const authToken = await authenticate();
  const paymobOrderId = await registerOrder(authToken, {
    amount_cents: amountCents,
    merchant_order_id: params.merchantOrderId,
  });
  const paymentKey = await getPaymentKey(authToken, {
    amount_cents: amountCents,
    order_id: paymobOrderId,
    integration_id: params.integrationId,
    billing,
  });

  return {
    paymobOrderId,
    paymentKey,
    iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`,
  };
}

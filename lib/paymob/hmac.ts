import "server-only";
import { createHmac } from "node:crypto";

// PayMob HMAC ordered fields for transaction callbacks
// Reference: https://docs.paymob.com/docs/hmac-calculation
const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
];

function pickPath(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
}

export function buildHmacString(payload: Record<string, unknown>): string {
  return HMAC_FIELDS.map((f) => {
    const v = pickPath(payload, f);
    return v === null || v === undefined ? "" : String(v);
  }).join("");
}

export function verifyPaymobHmac(
  payload: Record<string, unknown>,
  receivedHmac: string,
  secret: string
): boolean {
  const concatenated = buildHmacString(payload);
  const expected = createHmac("sha512", secret).update(concatenated).digest("hex");
  return expected === receivedHmac;
}

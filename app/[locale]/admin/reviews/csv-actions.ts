"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { serializeCsv, parseBool, parseInteger } from "@/lib/csv/serialize";
import { parseCsv, rowsToObjects } from "@/lib/csv/parse";
import type { ImportResult, ExportResult } from "@/lib/csv/types";
import { revalidatePath } from "next/cache";

/**
 * Reviews CSV exports use:
 *   - id            — review row id (for updates)
 *   - order_number  — human-readable order ref (ORD-000001)
 *   - service_slug  — service slug
 *   - customer_email — customer's email (read-only, for context)
 *
 * Import semantics:
 *   - If `id` is provided → update the review (rating, comment, admin_reply, is_visible)
 *   - If `id` is empty AND `order_number` is provided → create a new review
 *     linked to that order. Fails if the order doesn't exist or already has a review.
 */
const COLUMNS = [
  "id",
  "order_number",
  "service_slug",
  "customer_email",
  "rating",
  "comment",
  "admin_reply",
  "is_visible",
  "created_at",
];

export async function exportReviewsAction(): Promise<ExportResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment, admin_reply, is_visible, created_at,
      orders!inner(order_number),
      services!inner(slug),
      profiles!reviews_customer_id_fkey(email)
    `)
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message };

  const csvRows = ((data ?? []) as unknown as Array<{
    id: string;
    rating: number;
    comment: string | null;
    admin_reply: string | null;
    is_visible: boolean;
    created_at: string;
    orders: { order_number: string } | null;
    services: { slug: string } | null;
    profiles: { email: string | null } | null;
  }>).map((r) => ({
    id: r.id,
    order_number: r.orders?.order_number ?? "",
    service_slug: r.services?.slug ?? "",
    customer_email: r.profiles?.email ?? "",
    rating: r.rating,
    comment: r.comment,
    admin_reply: r.admin_reply,
    is_visible: r.is_visible,
    created_at: r.created_at,
  }));

  return {
    success: true,
    csv: serializeCsv(csvRows, COLUMNS),
    filename: `reviews-${new Date().toISOString().slice(0, 10)}.csv`,
  };
}

export async function templateReviewsAction(): Promise<ExportResult> {
  await requireAdmin();
  const sample = [
    {
      id: "",
      order_number: "ORD-000001",
      service_slug: "website-development",
      customer_email: "customer@example.com",
      rating: 5,
      comment: "خدمة ممتازة وسرعة في التسليم",
      admin_reply: "شكراً لتعاملك معنا",
      is_visible: true,
      created_at: "",
    },
  ];
  return {
    success: true,
    csv: serializeCsv(sample, COLUMNS),
    filename: "reviews-template.csv",
  };
}

export async function importReviewsAction(csv: string): Promise<ImportResult> {
  await requireAdmin();
  const result: ImportResult = {
    success: true,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };
  const rows = rowsToObjects(parseCsv(csv));
  if (rows.length === 0) {
    return { ...result, success: false, errors: [{ row: 0, message: "Empty CSV" }] };
  }

  const supabase = await createClient();

  for (const [idx, row] of rows.entries()) {
    const rowNum = idx + 2;

    const rating = parseInteger(row.rating);
    if (rating === null || rating < 1 || rating > 5) {
      result.errors.push({ row: rowNum, message: "rating must be 1-5" });
      result.skipped++;
      continue;
    }

    const payload = {
      rating,
      comment: row.comment || null,
      admin_reply: row.admin_reply || null,
      is_visible: parseBool(row.is_visible) ?? true,
    };

    if (row.id) {
      // Update existing review
      const { error } = await supabase.from("reviews").update(payload).eq("id", row.id);
      if (error) {
        result.errors.push({ row: rowNum, message: error.message });
        result.skipped++;
      } else {
        result.updated++;
      }
      continue;
    }

    // Create new review — look up order
    if (!row.order_number) {
      result.errors.push({
        row: rowNum,
        message: "Either `id` (update) or `order_number` (create) is required",
      });
      result.skipped++;
      continue;
    }

    const { data: order } = await supabase
      .from("orders")
      .select("id, customer_id, service_id, status")
      .eq("order_number", row.order_number)
      .single();

    if (!order) {
      result.errors.push({ row: rowNum, message: `Order "${row.order_number}" not found` });
      result.skipped++;
      continue;
    }

    // Optional sanity: order should be delivered/completed
    if (!["delivered", "completed"].includes((order as { status: string }).status)) {
      result.errors.push({
        row: rowNum,
        message: `Order "${row.order_number}" is not delivered/completed`,
      });
      result.skipped++;
      continue;
    }

    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", (order as { id: string }).id)
      .maybeSingle();
    if (existingReview) {
      result.errors.push({
        row: rowNum,
        message: `Order "${row.order_number}" already has a review (use its id to update)`,
      });
      result.skipped++;
      continue;
    }

    const o = order as { id: string; customer_id: string; service_id: string };
    const { error } = await supabase.from("reviews").insert({
      order_id: o.id,
      customer_id: o.customer_id,
      service_id: o.service_id,
      ...payload,
    });
    if (error) {
      result.errors.push({ row: rowNum, message: error.message });
      result.skipped++;
    } else {
      result.inserted++;
    }
  }

  result.success = result.errors.length === 0;
  revalidatePath("/admin/reviews");
  return result;
}

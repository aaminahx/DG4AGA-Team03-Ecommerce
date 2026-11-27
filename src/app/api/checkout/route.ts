
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503 }
      );
    }

    // Verify the current customer using Supabase Auth.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to place an order." },
        { status: 401 }
      );
    }
    // Verify the customer's account status.
const { data: profile, error: profileError } =
  await supabase
    .from("profiles")
    .select("is_suspended")
    .eq("id", user.id)
    .single();

// Fail securely if account verification is unavailable.
if (profileError || !profile) {
  return NextResponse.json(
    {
      error:
        "We could not verify your account status. Please try again later.",
    },
    { status: 503 }
  );
}

// Prevent suspended customers from placing orders.
if (profile.is_suspended !== false) {
  return NextResponse.json(
    {
      error:
        "Your account has been suspended. Please contact EcoHome customer support.",
    },
    { status: 403 }
  );
}

    // Limit request size to avoid oversized payloads.
    const rawBody = await request.text();

    if (rawBody.length > 20000) {
      return NextResponse.json(
        { error: "Checkout request is too large." },
        { status: 413 }
      );
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid checkout request." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid checkout request." },
        { status: 400 }
      );
    }

    const payload = body as Record<string, unknown>;
    const { items, customer, idempotencyKey } = payload;

    if (
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 50 ||
      typeof idempotencyKey !== "string" ||
      !UUID_PATTERN.test(idempotencyKey) ||
      !customer ||
      typeof customer !== "object" ||
      Array.isArray(customer)
    ) {
      return NextResponse.json(
        { error: "Invalid basket or customer details." },
        { status: 400 }
      );
    }

    // Pass only product IDs and quantities.
    // Browser prices and totals are never trusted.
    const validItems = items.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        typeof item.product_id === "string" &&
        UUID_PATTERN.test(item.product_id) &&
        Number.isInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 100
    );

    if (!validItems) {
      return NextResponse.json(
        { error: "Your basket contains invalid items." },
        { status: 400 }
      );
    }

    // Database function validates prices, stock,
    // customer information and duplicate requests.
    const { data: orderId, error } = await supabase.rpc(
      "place_simulated_order",
      {
        p_items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        p_customer: customer,
        p_idempotency_key: idempotencyKey,
      }
    );

    if (error) {
        if (error.code === "42501") {
        return NextResponse.json(
          {
            error:
              "Your account is not authorised to place this order. Please contact EcoHome customer support.",
          },
          { status: 403 }
        );
      }
      console.error("Checkout database error:", {
  code: error.code,
  message: error.message,
  details: error.details,
  hint: error.hint,
});

      return NextResponse.json(
        {
          error:
            "We couldn't place your order. Please check " +
            "your details and product availability.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: "Simulated order placed successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout server error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

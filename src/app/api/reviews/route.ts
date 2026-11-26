import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ReviewRating = {
  product_id: string;
  rating: number;
};

function summarizeRatings(reviews: ReviewRating[]) {
  const breakdown: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  for (const review of reviews) {
    breakdown[review.rating] = (breakdown[review.rating] ?? 0) + 1;
  }

  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? Math.round(
          (reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalCount) *
            10
        ) / 10
      : 0;

  return { averageRating, totalCount, breakdown };
}

export async function GET(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  const productId = new URL(request.url).searchParams.get("productId");

  if (productId && !UUID_PATTERN.test(productId)) {
    return NextResponse.json(
      { error: "A valid productId is required." },
      { status: 400 }
    );
  }

  if (productId) {
    const { data, error } = await supabase
      .from("product_reviews")
      .select(
        "id, product_id, user_name, rating, title, comment, verified_purchase, created_at"
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews query error:", error);
      return NextResponse.json(
        { error: "Unable to load product reviews." },
        { status: 500 }
      );
    }

    const reviews = data ?? [];
    const summary = summarizeRatings(reviews as ReviewRating[]);
    return NextResponse.json({ reviews, ...summary });
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .select("product_id, rating")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Reviews aggregate query error:", error);
    return NextResponse.json(
      { error: "Unable to load catalogue review ratings." },
      { status: 500 }
    );
  }

  const reviews = data ?? [];
  const ratingsByProduct: Record<
    string,
    { averageRating: number; totalCount: number }
  > = {};
  const grouped = new Map<string, ReviewRating[]>();

  for (const review of reviews as ReviewRating[]) {
    const group = grouped.get(review.product_id) ?? [];
    group.push(review);
    grouped.set(review.product_id, group);
  }

  for (const [id, productReviews] of grouped) {
    const { averageRating, totalCount } = summarizeRatings(productReviews);
    ratingsByProduct[id] = { averageRating, totalCount };
  }

  return NextResponse.json({ ratingsByProduct });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid review request." },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid review request." },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;
  const productId =
    typeof payload.product_id === "string" ? payload.product_id.trim() : "";
  const userName =
    typeof payload.user_name === "string" ? payload.user_name.trim() : "";
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const comment =
    typeof payload.comment === "string" ? payload.comment.trim() : "";
  const rating = payload.rating;

  if (
    !UUID_PATTERN.test(productId) ||
    userName.length < 2 ||
    userName.length > 80 ||
    !Number.isInteger(rating) ||
    Number(rating) < 1 ||
    Number(rating) > 5 ||
    title.length < 3 ||
    title.length > 120 ||
    comment.length < 10 ||
    comment.length > 2000
  ) {
    return NextResponse.json(
      { error: "Please provide a valid name, rating, headline, and review." },
      { status: 400 }
    );
  }

  const {
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Review authentication error:", authError);
    return NextResponse.json(
      { error: "Unable to verify your sign-in. Please try again." },
      { status: 401 }
    );
  }

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle();

  if (productError) {
    console.error("Review product lookup error:", productError);
    return NextResponse.json(
      { error: "Unable to verify this product." },
      { status: 500 }
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "Product not found." },
      { status: 404 }
    );
  }

  const { data: review, error: insertError } = await supabase.rpc(
    "submit_product_review",
    {
      p_product_id: productId,
      p_user_name: userName,
      p_rating: Number(rating),
      p_title: title,
      p_comment: comment,
    }
  );

  if (insertError) {
    console.error("Review insert error:", insertError);
    return NextResponse.json(
      { error: "Unable to submit your review. Please try again." },
      { status: 500 }
    );
  }

  if (!review || typeof review !== "object" || Array.isArray(review)) {
    console.error("Review insert returned an invalid response.");
    return NextResponse.json(
      { error: "Unable to confirm that your review was saved." },
      { status: 500 }
    );
  }

  return NextResponse.json({ review }, { status: 201 });
}

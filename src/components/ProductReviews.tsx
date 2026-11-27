"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  product_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  created_at: string;
};

type ReviewResponse = {
  reviews: Review[];
  averageRating: number;
  totalCount: number;
  breakdown: Record<number, number>;
};

const emptyBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

function StarRating({
  rating,
  label,
}: {
  rating: number;
  label: string;
}) {
  return (
    <span className="review-stars" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < Math.round(rating) ? "filled" : ""}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviewData, setReviewData] = useState<ReviewResponse>({
    reviews: [],
    averageRating: 0,
    totalCount: 0,
    breakdown: emptyBreakdown,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          `/api/reviews?productId=${encodeURIComponent(productId)}`
        );
        const data = (await response.json()) as
          | ReviewResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data ? data.error : "Unable to load reviews."
          );
        }

        if (active) setReviewData(data as ReviewResponse);
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load reviews."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Could not load reviewer profile:", error);
        return;
      }

      const metadataName =
        typeof data.user?.user_metadata?.display_name === "string"
          ? data.user.user_metadata.display_name
          : typeof data.user?.user_metadata?.first_name === "string"
            ? data.user.user_metadata.first_name
            : "";
      const name = metadataName || data.user?.email?.split("@")[0] || "";
      if (active && name) setUserName(name);
    });

    return () => {
      active = false;
    };
  }, []);

  const percentages = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: reviewData.breakdown[stars] ?? 0,
        percentage:
          reviewData.totalCount > 0
            ? ((reviewData.breakdown[stars] ?? 0) / reviewData.totalCount) *
              100
            : 0,
      })),
    [reviewData]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_name: userName,
          rating,
          title,
          comment,
        }),
      });
      const data = (await response.json()) as
        | { review: Review }
        | { error?: string };

      if (!response.ok || !("review" in data)) {
        throw new Error(
          "error" in data ? data.error : "Unable to submit your review."
        );
      }

      const review = data.review;
      setReviewData((current) => {
        const reviews = [review, ...current.reviews];
        const breakdown = {
          ...current.breakdown,
          [review.rating]: (current.breakdown[review.rating] ?? 0) + 1,
        };
        const totalCount = current.totalCount + 1;
        const averageRating =
          Math.round(
            ((current.averageRating * current.totalCount + review.rating) /
              totalCount) *
              10
          ) / 10;

        return { reviews, breakdown, totalCount, averageRating };
      });
      setRating(0);
      setTitle("");
      setComment("");
      setSubmitMessage("Thank you — your review has been published.");
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="product-reviews" id="reviews" aria-labelledby="reviews-title">
      <div className="product-reviews-heading">
        <div>
          <span className="review-eyebrow">CUSTOMER FEEDBACK</span>
          <h2 id="reviews-title">Reviews &amp; Ratings</h2>
        </div>
        <button
          type="button"
          className="review-write-button"
          onClick={() =>
            document
              .getElementById("write-review")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        >
          Write a Review
        </button>
      </div>

      <div className="reviews-summary">
        <div className="reviews-overall">
          <strong>{reviewData.averageRating.toFixed(1)}</strong>
          <StarRating
            rating={reviewData.averageRating}
            label={`${reviewData.averageRating.toFixed(1)} out of 5 stars`}
          />
          <span>
            {reviewData.averageRating.toFixed(1)} out of 5 ·{" "}
            {reviewData.totalCount}{" "}
            {reviewData.totalCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="review-breakdown" aria-label="Rating distribution">
          {percentages.map(({ stars, count, percentage }) => (
            <div className="review-breakdown-row" key={stars}>
              <span>{stars} star</span>
              <div
                className="review-breakdown-track"
                role="progressbar"
                aria-label={`${stars} star reviews`}
                aria-valuemin={0}
                aria-valuemax={reviewData.totalCount}
                aria-valuenow={count}
              >
                <span style={{ width: `${percentage}%` }} />
              </div>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <form className="review-form" id="write-review" onSubmit={handleSubmit}>
        <h3>Write a Review</h3>
        <label className="review-form-field">
          Your name
          <input
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
          />
        </label>

        <fieldset className="review-rating-field">
          <legend>Your rating</legend>
          <div className="review-rating-picker" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                className={value <= rating ? "selected" : ""}
                onClick={() => setRating(value)}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>

        <label className="review-form-field">
          Review headline
          <input
            required
            minLength={3}
            maxLength={120}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="review-form-field">
          Your review
          <textarea
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </label>

        {rating === 0 && (
          <p className="review-form-hint">Choose a star rating before submitting.</p>
        )}
        {submitError && <p className="review-error" role="alert">{submitError}</p>}
        {submitMessage && <p className="review-success" role="status">{submitMessage}</p>}
        <button
          className="review-submit-button"
          type="submit"
          disabled={submitting || rating === 0}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>

      <div className="review-list">
        <h3>Customer Reviews</h3>
        {loading ? (
          <p className="reviews-empty">Loading reviews...</p>
        ) : loadError ? (
          <p className="review-error" role="alert">{loadError}</p>
        ) : reviewData.reviews.length === 0 ? (
          <p className="reviews-empty">No reviews yet. Be the first to share your experience.</p>
        ) : (
          reviewData.reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-card-heading">
                <StarRating
                  rating={review.rating}
                  label={`${review.rating} out of 5 stars`}
                />
                {review.verified_purchase && (
                  <span className="verified-review-badge">✓ Verified EcoHome Buyer</span>
                )}
              </div>
              <h4>{review.title}</h4>
              <p className="review-author">
                {review.user_name} ·{" "}
                {new Date(review.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="review-comment">{review.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

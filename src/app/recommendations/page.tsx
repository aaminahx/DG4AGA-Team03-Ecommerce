"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const categories = [
  {
    name: "Heating & Insulation",
    href: "/products?category=Heating",
    description:
      "Explore products that may help reduce heat loss and improve home insulation.",
  },
  {
    name: "Smart Energy",
    href: "/products?category=Smart%20Energy",
    description:
      "Discover smart devices that help you monitor and manage energy usage.",
  },
  {
    name: "Lighting",
    href: "/products?category=Lighting",
    description:
      "Explore energy-efficient lighting to help reduce electricity consumption.",
  },
  {
    name: "Water Saving",
    href: "/products?category=Water%20Saving",
    description:
      "Find products designed to help reduce household water consumption.",
  },
  {
    name: "Kitchen Appliances",
    href: "/products?category=Home%20%26%20Kitchen",
    description:
      "Discover efficient household appliances that may help reduce energy use.",
  },
];

export default function RecommendationsPage() {
  const [answers, setAnswers] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const savedAnswers = params.get("answers");

    if (savedAnswers) {
      try {
        const parsed = JSON.parse(savedAnswers);

        if (Array.isArray(parsed) && parsed.length === 11) {
          setAnswers(parsed);
        }
      } catch {
        console.error("Could not read quiz answers.");
      }
    }

    setLoaded(true);
  }, []);

  if (!loaded) {
    return <main className="section">Loading your recommendations...</main>;
  }

  if (answers.length !== 11) {
    return (
      <main className="section">
        <h1>We couldn't find your quiz answers</h1>
        <p>Please complete the quiz again to receive recommendations.</p>
        <Link href="/quiz">Take the quiz again</Link>
      </main>
    );
  }

  const priority = answers[9];
  const insulation = answers[3];
  const windows = answers[4];
  const loft = answers[5];
  const smartMeter = answers[8];
  const budget = answers[10];
  const bill = answers[7];

  const recommendedNames = new Set<string>();

  if (priority === "Reduce heating costs") {
    recommendedNames.add("Heating & Insulation");
  }

  if (priority === "Reduce electricity usage") {
    recommendedNames.add("Smart Energy");
    recommendedNames.add("Lighting");
  }

  if (priority === "Improve insulation") {
    recommendedNames.add("Heating & Insulation");
  }

  if (priority === "Reduce water usage") {
    recommendedNames.add("Water Saving");
  }

  if (priority === "Make my home more energy efficient") {
    recommendedNames.add("Smart Energy");
    recommendedNames.add("Heating & Insulation");
    recommendedNames.add("Kitchen Appliances");
  }

  if (
    insulation === "Poorly insulated" ||
    windows === "Single glazed" ||
    loft === "No"
  ) {
    recommendedNames.add("Heating & Insulation");
  }

  if (smartMeter === "No" || smartMeter === "Not sure") {
    recommendedNames.add("Smart Energy");
  }

  if (bill === "£151–£200" || bill === "Over £200") {
    recommendedNames.add("Smart Energy");
  }

  const recommendations = categories.filter((category) =>
    recommendedNames.has(category.name)
  );

  return (
    <main className="section">
      <div style={{ maxWidth: "1000px", margin: "40px auto" }}>
        <span className="eco-eyebrow">Your personalised energy plan</span>

        <h1>Your Energy-Saving Recommendations</h1>

        <p>
          Based on your answers, here are some product categories
          worth exploring to help make your home more energy efficient.
        </p>

        <div
          style={{
            background: "#e5f4f1",
            padding: "20px",
            borderRadius: "12px",
            margin: "25px 0",
          }}
        >
          <h2>Your main priority</h2>
          <p>{priority}</p>
          <p>
            Your selected product budget: <strong>{budget}</strong>
          </p>
        </div>

        <h2>Recommended product categories</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {recommendations.map((category) => (
            <div
              key={category.name}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "12px",
                padding: "22px",
              }}
            >
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <Link className="yellow-button" href={category.href}>
                Explore products →
              </Link>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <p>
            We couldn't identify a category from your answers.
            Please try the quiz again.
          </p>
        )}

        <div style={{ marginTop: "35px" }}>
          <Link href="/quiz">Retake the quiz</Link>
          {" | "}
          <Link href="/products">Browse all products</Link>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  {
    question: "What type of property do you live in?",
    options: ["House", "Flat / Apartment", "Bungalow", "Other"],
  },
  {
    question: "How many people live in your home?",
    options: ["1 person", "2 people", "3–4 people", "5 or more people"],
  },
  {
    question: "Do you own or rent your property?",
    options: [
      "Own",
      "Rent privately",
      "Rent from a council / housing association",
    ],
  },
  {
    question: "How well insulated do you think your home is?",
    options: [
      "Very well insulated",
      "Fairly well insulated",
      "Poorly insulated",
      "Not sure",
    ],
  },
  {
    question: "What type of windows do you have?",
    options: ["Single glazed", "Double glazed", "Triple glazed", "Not sure"],
  },
  {
    question: "Does your property have loft insulation?",
    options: ["Yes", "No", "Not applicable", "Not sure"],
  },
  {
    question: "What type of heating system do you currently use?",
    options: [
      "Gas central heating",
      "Electric heating",
      "Heat pump",
      "Other",
      "Not sure",
    ],
  },
  {
    question: "Approximately how much is your monthly energy bill?",
    options: [
      "Under £50",
      "£50–£100",
      "£101–£150",
      "£151–£200",
      "Over £200",
      "Not sure",
    ],
  },
  {
    question: "Do you have a smart meter?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    question: "What would you most like to improve?",
    options: [
      "Reduce heating costs",
      "Reduce electricity usage",
      "Improve insulation",
      "Reduce water usage",
      "Make my home more energy efficient",
    ],
  },
  {
    question: "What is your budget for energy-saving products?",
    options: [
      "Under £20",
      "£20–£50",
      "£50–£100",
      "£100+",
      "No fixed budget",
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  function selectAnswer(answer: string) {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);
  }

  function nextQuestion() {
    if (!answers[currentQuestion]) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const quizAnswers = encodeURIComponent(JSON.stringify(answers));
      router.push(`/recommendations?answers=${quizAnswers}`);
    }
  }

  return (
    <main className="section">
      <div style={{ maxWidth: "700px", margin: "40px auto" }}>
        <span className="eco-eyebrow">Personalised energy plan</span>

        <h1>Find My Savings</h1>

        <p>
          Answer 11 quick questions about your home and energy usage
          to discover products that could help you save.
        </p>

        <p>
          Question {currentQuestion + 1} of {questions.length}
        </p>

        <div
          style={{
            height: "8px",
            background: "#e5e7eb",
            borderRadius: "10px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "8px",
              background: "#0d8278",
              borderRadius: "10px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <h2>{question.question}</h2>

        <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectAnswer(option)}
              style={{
                padding: "16px",
                borderRadius: "10px",
                border:
                  answers[currentQuestion] === option
                    ? "2px solid #0d8278"
                    : "1px solid #d1d5db",
                background:
                  answers[currentQuestion] === option
                    ? "#e5f4f1"
                    : "white",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            gap: "12px",
          }}
        >
          <button
            type="button"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
          >
            Back
          </button>

          <button
            type="button"
            disabled={!answers[currentQuestion]}
            onClick={nextQuestion}
          >
            {currentQuestion === questions.length - 1
              ? "See My Recommendations"
              : "Next"}
          </button>
        </div>
      </div>
    </main>
  );
}

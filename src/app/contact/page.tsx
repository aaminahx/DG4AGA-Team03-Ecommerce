
"use client";

import { FormEvent } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";

// Example EcoHome contact details
const CONTACT_EMAIL = "example@ecohome.com";
const CONTACT_PHONE = "123-456-7890";
const CONTACT_ADDRESS = "123 EcoHome Street, Green City, Earth";

export default function ContactPage() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    const subject = encodeURIComponent(
      `EcoHome enquiry from ${name}`
    );

    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <section className="section contact-page">
      <div className="contact-container">

        {/* LEFT COLUMN */}
        <div className="contact-information">

          <span className="eyebrow">
            ECOHOME / SUPPORT
          </span>

          <h1>Get in touch</h1>

          <p className="contact-intro">
            We'd love to hear from you. Whether you
            have a question about our products,
            website or sustainable living, we're
            here to help.
          </p>

          <div className="contact-details">

            {/* EMAIL */}
            <div className="contact-detail">
              <div className="contact-icon">
                <Mail size={23} />
              </div>

              <div>
                <h3>Email us</h3>
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>

            {/* TELEPHONE */}
            <div className="contact-detail">
              <div className="contact-icon">
                <Phone size={23} />
              </div>

              <div>
                <h3>Call us</h3>
                <a href={`tel:${CONTACT_PHONE}`}>
                  {CONTACT_PHONE}
                </a>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="contact-detail">
              <div className="contact-icon">
                <MapPin size={23} />
              </div>

              <div>
                <h3>Find us</h3>
                <p className="contact-address">
                  {CONTACT_ADDRESS}
                </p>
              </div>
            </div>

          </div>

          {/* SUPPORT INFORMATION */}
          <div className="contact-help">
            <h3>Need a quick answer?</h3>

            <p>
              Take a look at our Frequently Asked
              Questions page for helpful information
              about EcoHome and our products.
            </p>

            <Link
              href="/faq"
              className="contact-faq-link"
            >
              Visit our FAQs
              <ArrowRight size={17} />
            </Link>
          </div>

          {/* PROJECT DISCLAIMER */}
          <div className="contact-note">
            <p>
              Please note: EcoHome is an educational
              e-commerce simulation. Orders and
              purchases are for demonstration
              purposes only.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN - CONTACT FORM */}
        <div className="contact-form-card">

          <div className="contact-form-heading">
            <span className="eyebrow">
              SEND US A MESSAGE
            </span>

            <h2>How can we help?</h2>

            <p>
              Have a question? Fill in the form
              below and get in touch with our team.
            </p>
          </div>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label htmlFor="contact-name">
                Name
              </label>

              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">
                Email address
              </label>

              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                placeholder="How can we help?"
                rows={6}
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit"
            >
              Send message
              <ArrowRight size={20} />
            </button>

            <p className="contact-form-note">
              By sending a message, you acknowledge
              that your information will be handled
              in accordance with our{" "}
              <Link href="/privacy">
                Privacy Policy
              </Link>.
            </p>

          </form>

        </div>

      </div>
    </section>
  );
}


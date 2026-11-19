"use client";

import { useState } from "react";
import styles from "./Enquiry.module.css";

const initial = { name: "", phone: "", email: "", message: "" };

export default function EnquiryForm() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      setError("Please enter a valid 10 digit phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setForm(initial);
      setPopup(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.card}>
        {/* LEFT: image + text */}
        <div className={styles.media}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/image1.png" alt="Enquiry" className={styles.img} />
          <div className={styles.overlay}>
            <h3>Have a Query?</h3>
            <p>If you have any query, feel free to ask us.</p>
          </div>
        </div>

        {/* RIGHT: form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>Enquiry Form</h3>

          <label className={styles.field}>
            <span>Brand / Person Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter brand or person name"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Phone Number</span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Message</span>
            <textarea
              name="message"
              rows="4"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your query here..."
              required
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? "Sending..." : "Submit Enquiry"}
          </button>
        </form>
      </div>

      {/* POPUP */}
      {popup && (
        <div className={styles.popupBg} onClick={() => setPopup(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <div className={styles.tick}>✓</div>
            <h4>Thank You!</h4>
            <p>Your enquiry has been submitted. We will reply to you within 24 hours.</p>
            <button onClick={() => setPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
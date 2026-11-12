"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cabin, Poppins } from "next/font/google";
import Nav from "../../component/nav/Nav";
import styles from "./upcoming.module.css";

/* Same fonts as the main page */
const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const EVENT_TITLE = "#ConsciousEffort India, Hyderabad";
const MAX_IMAGES = 5;

const highlights = [
  "Founded in 2017",
  "10 successful years of the show",
  "Curated pop-ups & trunk show",
  "Conversations with industry change makers",
  "Covered by Vogue, Harper’s Bazaar & Times of India",
];

const formatSize = (b) =>
  b >= 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(b / 1024)} KB`;

/* ---------- Icons ---------- */
const Icon = ({ children, className }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const CalendarIcon = () => (
  <Icon className={styles.metaIcon}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </Icon>
);

const PinIcon = () => (
  <Icon className={styles.metaIcon}>
    <path d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 12 3a7 7 0 0 1 7 6.8C19 14.9 12 21 12 21z" />
    <circle cx="12" cy="10" r="2.6" />
  </Icon>
);

const BagIcon = () => (
  <Icon className={styles.metaIcon}>
    <path d="M5 8h14l1 12H4L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Icon>
);

const StarIcon = () => (
  <Icon className={styles.starIcon}>
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </Icon>
);

const ArrowIcon = () => (
  <svg
    className={styles.arrow}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Leaf = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 120 160"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    aria-hidden="true"
  >
    <path d="M60 155C58 110 62 60 90 8" />
    <path d="M62 120C30 112 14 86 16 56c32 6 48 30 46 64z" />
    <path d="M66 82C98 76 112 54 108 26c-30 6-46 28-42 56z" />
    <path d="M62 120C46 104 30 82 16 56" />
  </svg>
);

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  brand: "",
  website: "",
  message: "",
};

export default function Upcoming() {
  const [form, setForm] = useState(emptyForm);
  const [catalogue, setCatalogue] = useState(null);
  const [images, setImages] = useState([]);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const previews = useMemo(
    () => images.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })),
    [images]
  );

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onCatalogue = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;

    if (f.type !== "application/pdf") {
      return setError("Catalogue must be a PDF file.");
    }
    setError("");
    setCatalogue(f);
  };

  const onImages = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;

    if (picked.some((f) => !f.type.startsWith("image/"))) {
      return setError("Only image files are allowed.");
    }
    if (images.length + picked.length > MAX_IMAGES) {
      return setError(`You can upload a maximum of ${MAX_IMAGES} images.`);
    }
    setError("");
    setImages((p) => [...p, ...picked]);
  };

  const removeImage = (i) => {
    setImages((p) => p.filter((_, idx) => idx !== i));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.brand.trim()
    ) {
      return setError("Please fill name, email, phone and brand name.");
    }

    // UI only: backend / API call yahan baad mein add hoga
    setDone(true);
  };

  const reset = () => {
    setForm(emptyForm);
    setCatalogue(null);
    setImages([]);
    setDone(false);
    setError("");
  };

  return (
    <>
      <Nav />

      <main className={`${styles.page} ${cabin.className}`}>
        {/* ================= HERO ================= */}
        <section className={styles.hero}>
          <div className={styles.heroMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hy.png"
              alt="#ConsciousEffort India, The Quorum, Hyderabad"
              className={styles.heroImg}
            />
          </div>

          <div className={styles.heroInfo}>
            <Leaf className={styles.heroLeaf} />

            <p className={`${styles.est} ${styles.fade}`} style={{ "--d": "0.1s" }}>
              <span className={styles.estLine} />
              Est. 2017
            </p>

            <h1 className={`${styles.heroTitle} ${styles.fade}`} style={{ "--d": "0.2s" }}>
              #ConsciousEffort India
            </h1>

            <p className={`${styles.heroDesc} ${styles.fade}`} style={{ "--d": "0.3s" }}>
              The country’s leading platform for conscious fashion and
              lifestyle brands, now in Hyderabad. Showcase your craft to a
              community that values quality and conscious design.
            </p>

            <ul className={`${styles.metaList} ${styles.fade}`} style={{ "--d": "0.4s" }}>
              <li className={styles.metaItem}>
                <CalendarIcon />
                <span>
                  12<sup>th</sup> December, 2026
                </span>
              </li>
              <li className={styles.metaItem}>
                <PinIcon />
                <span>The Quorum, Hyderabad</span>
              </li>
              <li className={styles.metaItem}>
                <BagIcon />
                <span>Fashion, Fine Jewels, Accessories, Bags &amp; Home</span>
              </li>
            </ul>

            <div className={styles.fade} style={{ "--d": "0.5s" }}>
              <a href="#apply" className={`${styles.btn} ${poppins.className}`}>
                <span className={styles.btnText}>Apply for the Event</span>
                <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className={styles.about}>
          <div className={styles.aboutInner}>
            <div className={styles.aboutText}>
              <h2 className={styles.h2}>About Us</h2>

              <p className={styles.para}>
                Founded in 2017, #ConsciousEffort is India’s first and largest
                platform on a mission to educate, engage and empower people
                about sustainability in the fashion, beauty &amp; lifestyle
                industry.
              </p>

              <p className={styles.para}>
                We host conversations with the industry’s most profound change
                makers, give sustainable brands a platform to showcase through
                curated pop-ups and build a community that champions conscious
                fashion and living.
              </p>
            </div>

            <aside className={styles.highlights}>
              <h3 className={styles.hTitle}>Event Highlights</h3>
              <ul className={styles.hList}>
                {highlights.map((h) => (
                  <li key={h}>
                    <StarIcon />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        {/* ================= APPLY ================= */}
        <section id="apply" className={styles.apply}>
          <div className={styles.applyInner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Apply for the Event</h2>
              <div className={styles.ornament} aria-hidden="true">
                <span />
                <i>✦</i>
                <span />
              </div>
              <p className={styles.sectionDesc}>
                Share your details and collection with us. Every brand is
                screened and reviewed before it is confirmed.
              </p>
            </div>

            <div className={styles.card}>
              <aside className={styles.panel}>
                <Leaf className={styles.panelLeaf} />
                <h3 className={styles.panelTitle}>Before you apply</h3>
                <p className={styles.panelText}>
                  Fill in the form and upload your catalogue and images. Our
                  team will screen your application first and, once it is
                  approved, we will get in touch with the next steps.
                </p>

                <p className={styles.panelLabel}>Keep ready</p>
                <ul className={styles.panelList}>
                  <li>Brand name &amp; brand story</li>
                  <li>Catalogue / lookbook (PDF)</li>
                  <li>Images of your collection</li>
                  <li>Website &amp; social media links</li>
                </ul>

                <a href="mailto:info@saahra.com" className={styles.panelMail}>
                  info@saahra.com
                </a>
              </aside>

              <div className={styles.formSide}>
              {done ? (
                <div className={styles.success}>
                  <h3 className={styles.cardTitle}>Application Received</h3>
                  <p className={styles.cardDesc}>
                    Thank you, {form.name.split(" ")[0]}. Our team will review
                    your application for <strong>{EVENT_TITLE}</strong> and get
                    in touch shortly.
                  </p>
                  <div className={styles.successActions}>
                    <button
                      type="button"
                      className={`${styles.btn} ${poppins.className}`}
                      onClick={reset}
                    >
                      <span className={styles.btnText}>Submit Another</span>
                      <ArrowIcon />
                    </button>
                    <Link href="/" className={styles.backLink}>
                      Back to home
                    </Link>
                  </div>
                </div>
              ) : (
                <form className={styles.form} onSubmit={onSubmit} noValidate>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="u-name">Full Name *</label>
                      <input
                        id="u-name"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="u-email">Email Address *</label>
                      <input
                        id="u-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label htmlFor="u-phone">Phone Number *</label>
                      <input
                        id="u-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={onChange}
                        placeholder="+91 00000 00000"
                        autoComplete="tel"
                      />
                    </div>

                    <div className={styles.field}>
                      <label htmlFor="u-brand">Brand / Label Name *</label>
                      <input
                        id="u-brand"
                        name="brand"
                        value={form.brand}
                        onChange={onChange}
                        placeholder="Your brand name"
                      />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={`${styles.field} ${styles.full}`}>
                      <label htmlFor="u-web">
                        Website / Instagram{" "}
                        <span className={styles.optional}>(optional)</span>
                      </label>
                      <input
                        id="u-web"
                        name="website"
                        value={form.website}
                        onChange={onChange}
                        placeholder="@yourbrand or website link"
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <span className={styles.label}>
                      Upload Catalogue / Lookbook (PDF){" "}
                      <span className={styles.optional}>(optional)</span>
                    </span>

                    <label htmlFor="u-cat-file" className={styles.upload}>
                      {catalogue
                        ? `📄 ${catalogue.name} (${formatSize(catalogue.size)})`
                        : "Click to upload catalogue PDF"}
                    </label>

                    <input
                      id="u-cat-file"
                      type="file"
                      accept="application/pdf"
                      onChange={onCatalogue}
                      hidden
                    />

                    {catalogue && (
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => setCatalogue(null)}
                      >
                        Remove catalogue
                      </button>
                    )}
                  </div>

                  <div className={styles.field}>
                    <span className={styles.label}>
                      Upload Images (max {MAX_IMAGES}){" "}
                      <span className={styles.optional}>(optional)</span>
                    </span>

                    {images.length < MAX_IMAGES && (
                      <>
                        <label htmlFor="u-images" className={styles.upload}>
                          Click to add images ({images.length}/{MAX_IMAGES})
                        </label>
                        <input
                          id="u-images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={onImages}
                          hidden
                        />
                      </>
                    )}

                    {previews.length > 0 && (
                      <div className={styles.previews}>
                        {previews.map((p, i) => (
                          <div key={p.url} className={styles.thumb}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.url} alt={p.name} />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="u-msg">
                      Tell us about your brand{" "}
                      <span className={styles.optional}>(optional)</span>
                    </label>
                    <textarea
                      id="u-msg"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={onChange}
                      placeholder="Your brand story, craft and collection..."
                    />
                  </div>

                  {error && <p className={styles.error}>{error}</p>}

                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.submit} ${poppins.className}`}
                  >
                    <span className={styles.btnText}>Submit Application</span>
                    <ArrowIcon />
                  </button>

                </form>
              )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
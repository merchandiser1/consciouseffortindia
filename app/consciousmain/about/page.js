"use client"; // needed for the scroll animation + video auto-pause

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Cabin } from "next/font/google";
import Nav from "../../component/nav/Nav";
import Footer from "../../component/footer/Footer"; // <-- change if your Footer is in a different folder
import styles from "./about.module.css";

const cabin = Cabin({ subsets: ["latin"], weight: ["400", "500", "600"] });

/* ---------------------------------------------------------------
   CONTENT (edit text / image paths here, JSX below stays the same)
---------------------------------------------------------------- */
const ABOUT_TEXT =
  "Founded in 2017, #ConsciousEffort is India’s first and largest platform on a mission to educate, engage and empower people about sustainability in the fashion, beauty & lifestyle industry. We host conversations with the industry’s most profound change makers, give sustainable brands a platform to showcase through curated pop-ups and build a community that champion’s conscious fashion and living.";

const HERO_IMAGE = "/abouthero.png"; // right side image of section 1

const VIDEO_SRC = "/about.mp4"; // section 2 video
const VIDEO_POSTER = "/about/video-poster.jpg"; // optional thumbnail

// Section 3: past speakers. 3 images, each one row of 5 speakers (full width, stacked).
// width/height = real pixel size of each image (so the ratio stays correct).
const SPEAKERS_SUB =
  "See some of our previous year speakers & climate champions at #ConsciousEffort.";

const SPEAKER_ROWS = [
  { src: "/speaker1.png", width: 1341, height: 262 },
  { src: "/speaker2.png", width: 1347, height: 267 },
  { src: "/speaker3.png", width: 1345, height: 262 },
];

// Section 4: gallery (heading is in the JSX below, paragraph is here)
const GALLERY_TEXT =
  "Our goal is to give sustainable brands a stage where their products can reach a community that values their craftsmanship and cares about conscious design. We also want shoppers to have the freedom to choose, and to buy with awareness.";

const GALLERY = [
  { src: "/aboutshow1.png", alt: "Visitor holding a dress at a conscious fashion pop-up" },
  { src: "/aboutshow2.webp", alt: "Crowd browsing brand stalls at the event" },
  { src: "/aboutshow3.webp", alt: "Visitor exploring handcrafted clothing" },
];

export default function AboutPage() {
  /* ---------------- scroll reveal ---------------- */
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = root.querySelectorAll("[data-reveal]");

    // Older browsers: just show everything
    if (typeof IntersectionObserver === "undefined") {
      items.forEach((el) => el.classList.add(styles.in));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.in);
            io.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------------- video: pause when off screen, resume when visible ---------------- */
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );

    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Nav />

      <main ref={rootRef} className={`${styles.page} ${cabin.className}`}>
        {/* ================= SECTION 1: ABOUT (text left, image right) ================= */}
        <section className={styles.hero} aria-labelledby="about-title">
          <div className={styles.heroInner}>
            <div className={`${styles.heroText} ${styles.reveal}`} data-reveal>
              <p className={styles.kicker}>About Us</p>
              <h1 id="about-title" className={styles.title}>
                Educate. Engage. <em>Empower.</em>
              </h1>
              <p className={styles.lead}>{ABOUT_TEXT}</p>
            </div>

            <div className={`${styles.heroImage} ${styles.reveal} ${styles.delay1}`} data-reveal>
              <Image
                src={HERO_IMAGE}
                alt="#ConsciousEffort community at a sustainable fashion event"
                fill
                priority
                sizes="(max-width: 860px) 100vw, 50vw"
                className={styles.cover}
              />
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: VIDEO (full width, no controls) ================= */}
        <section className={styles.videoSection} aria-label="About video">
          <div className={`${styles.videoWrap} ${styles.reveal}`} data-reveal>
            <video
              ref={videoRef}
              className={styles.video}
              src={VIDEO_SRC}
              poster={VIDEO_POSTER}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </section>

        {/* ================= SECTION 3: PAST SPEAKERS (3 rows x 5, full width) ================= */}
        <section className={styles.speakers} aria-labelledby="speakers-title">
          <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal>
            <h2 id="speakers-title" className={styles.heading}>
              Our <em>past speakers</em> &amp; climate champions
            </h2>
            <p className={styles.sub}>{SPEAKERS_SUB}</p>
          </div>

          <div className={styles.speakerRows}>
            {SPEAKER_ROWS.map((r, i) => (
              <div key={r.src} className={`${styles.speakerRow} ${styles.reveal}`} data-reveal>
                <Image
                  src={r.src}
                  alt={`Past speakers, row ${i + 1}`}
                  width={r.width}
                  height={r.height}
                  sizes="100vw"
                  className={styles.speakerImg}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 4: CURATED BRANDS GALLERY ================= */}
        <section className={styles.gallery} aria-labelledby="gallery-title">
          <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal>
            <h2 id="gallery-title" className={styles.heading}>
              Discover <em>thoughtfully curated</em> sustainable brands and meet the{" "}
              <em>creative</em> minds behind them.
            </h2>
            <p className={styles.sub}>{GALLERY_TEXT}</p>
          </div>

          <div className={styles.galleryGrid}>
            {GALLERY.map((g, i) => (
              <div
                key={g.src}
                className={`${styles.galleryItem} ${styles.reveal}`}
                style={{ transitionDelay: `${i * 100}ms` }}
                data-reveal
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                  className={styles.cover}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
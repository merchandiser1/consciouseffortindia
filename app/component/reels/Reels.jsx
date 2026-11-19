"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Reels.module.css";

const PROFILE = "https://www.instagram.com/consciouseffortofficial";

/* ================= APNE 5 REELS ================= */
const reels = [
  { video: "/reels/orig1.mp4", poster: "/reels/reel1.jpg", link: "https://www.instagram.com/reel/Df1CRLERrE_/" },
  { video: "/reels/orig2.mp4", poster: "/reels/reel2.jpg", link: "https://www.instagram.com/reel/DeeFVApytM6/" },
  { video: "/reels/orig3.mp4", poster: "/reels/reel3.jpg", link: "https://www.instagram.com/reel/DeqoHBNx0ID/" },
  { video: "/reels/orig4.mp4", poster: "/reels/reel4.jpg", link: "https://www.instagram.com/reel/C6gouNOIdY_/" },
  { video: "/reels/orig5.mp4", poster: "/reels/reel5.jpg", link: "https://www.instagram.com/reel/De06Af9RD9G/" },
];
/* ================================================= */

// 5 reels badi screen ke liye kam padti hain, isliye ek group me 2 baar repeat
const base = [...reels, ...reels];

const InstaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

function ReelCard({ reel, hidden }) {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        const v = videoRef.current;
        if (entry.isIntersecting) {
          setLoad(true); // pehli baar screen ke paas aaye tabhi video load hogi
          if (v) v.play().catch(() => {});
        } else if (v) {
          v.pause(); // screen se bahar = pause
        }
      },
      { rootMargin: "0px 200px 0px 200px", threshold: 0.01 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // video mount hote hi play karo
  useEffect(() => {
    const v = videoRef.current;
    if (load && v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, [load]);

  return (
    <a
      ref={cardRef}
      href={reel.link || PROFILE}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      aria-label="Watch on Instagram"
      tabIndex={hidden ? -1 : undefined}
      style={{ backgroundImage: `url(${reel.poster})` }}
    >
      {load && (
        <video
          ref={videoRef}
          className={styles.video}
          src={reel.video}
          poster={reel.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          draggable="false"
        />
      )}
      <span className={styles.insta}>
        <InstaIcon />
      </span>
    </a>
  );
}

function Group({ hidden = false }) {
  return (
    <div className={styles.group} aria-hidden={hidden || undefined}>
      {base.map((r, i) => (
        <ReelCard key={`${i}-${r.video}`} reel={r} hidden={hidden} />
      ))}
    </div>
  );
}

export default function Reels() {
  return (
    <section className={styles.section} id="reels">
      <h2 className={styles.title}>
        <a href={PROFILE} target="_blank" rel="noopener noreferrer">
          Follow @consciouseffortofficial
        </a>
      </h2>

      <div className={styles.marquee} aria-label="Instagram reels">
        <div className={styles.track}>
          <Group />
          <Group hidden />
        </div>
      </div>
    </section>
  );
}
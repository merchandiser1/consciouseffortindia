import Image from "next/image";
import Link from "next/link";
import { Cabin, Poppins } from "next/font/google";
import Nav from "./component/nav/Nav";
import styles from "./page.module.css";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
});

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
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const iconProps = {
  className: styles.metaIcon,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export default function Home() {
  return (
    <>
      <Nav />

      {/* ================= HERO ================= */}
      <section className={`${styles.hero} ${cabin.className}`}>
        <div className={styles.container}>
          {/* LEFT */}
          <div className={styles.content}>
            <p className={`${styles.est} ${styles.fade}`} style={{ "--d": "0.1s" }}>
              <span className={styles.line} />
              Est. 2017
            </p>

            <h1 className={`${styles.title} ${styles.fade}`} style={{ "--d": "0.2s" }}>
              #ConsciousEffort
            </h1>

            <h2 className={`${styles.subtitle} ${styles.fade}`} style={{ "--d": "0.35s" }}>
              India’s Leading Sustainable Fashion &amp; Lifestyle Event
            </h2>

            <p className={`${styles.text} ${styles.fade}`} style={{ "--d": "0.5s" }}>
              Founded in 2017, #ConsciousEffort is India’s first and largest
              platform on a mission to educate, engage and empower people about
              sustainability in the fashion, beauty &amp; lifestyle industry. We
              host conversations with the industry’s most profound change
              makers, give sustainable brands a platform to showcase through
              curated pop-ups and build a community that champion’s conscious
              fashion and living.
            </p>

            <div className={`${styles.actions} ${styles.fade}`} style={{ "--d": "0.65s" }}>
              <Link href="/upcoming" className={`${styles.btn} ${poppins.className}`}>
                <span className={styles.btnText}>Apply for the Event</span>
                <ArrowIcon />
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.imageWrap}>
            <div className={styles.frame}>
              <Image
                src="/headerposter.png"
                alt="#ConsciousEffort sustainable fashion event"
                fill
                priority
                sizes="(max-width: 900px) 90vw, 45vw"
                className={styles.image}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= UPCOMING EVENTS ================= */}
      <section id="upcoming" className={`${styles.upcoming} ${cabin.className}`}>
        <div className={styles.upContainer}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            <div className={styles.ornament} aria-hidden="true">
              <span />
              <i>✦</i>
              <span />
            </div>
          </div>

          <article className={`${styles.eventCard} ${styles.reveal}`}>
            {/* image left */}
            <div className={styles.eventMedia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hy.png"
                alt="#ConsciousEffort India, The Quorum, Hyderabad"
                className={styles.eventImg}
              />

              <div className={`${styles.dateBadge} ${poppins.className}`}>
                <strong>12</strong>
                <span>Dec</span>
                <em>2026</em>
              </div>

              <span className={`${styles.cityTag} ${poppins.className}`}>
                Hyderabad
              </span>
            </div>

            {/* details right */}
            <div className={styles.eventInfo}>
              <h3 className={styles.eventName}>#ConsciousEffort India</h3>

              <p className={styles.eventDate}>
                12<sup>th</sup> December, 2026
              </p>

              <ul className={styles.metaList}>
                <li className={styles.metaItem}>
                  <svg {...iconProps}>
                    <path d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 12 3a7 7 0 0 1 7 6.8C19 14.9 12 21 12 21z" />
                    <circle cx="12" cy="10" r="2.6" />
                  </svg>
                  <span>The Quorum, Hyderabad</span>
                </li>

                <li className={styles.metaItem}>
                  <svg {...iconProps}>
                    <path d="M5 8h14l1 12H4L5 8z" />
                    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                  </svg>
                  <span>Fashion, Fine Jewels, Accessories, Bags &amp; Home</span>
                </li>
              </ul>

              <Link
                href="/consciousmain/upcoming"
                className={`${styles.btn} ${styles.eventBtn} ${poppins.className}`}
              >
                <span className={styles.btnText}>Apply for the Event</span>
                <ArrowIcon />
              </Link>

              {/* decorative leaf */}
              <svg
                className={styles.leaf}
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
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
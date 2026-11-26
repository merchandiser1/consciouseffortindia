import Image from "next/image";
import Link from "next/link";
import { Cabin, Poppins } from "next/font/google";
import Nav from "./component/nav/Nav";
import EnquiryForm from "./component/enquiry/EnquiryForm";
import Reels from "./component/reels/Reels";
import Footer from "./component/footer/Footer";
import styles from "./page.module.css";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
});

/* ---------- ABOUT VIDEO (file in /public) ---------- */
const ABOUT_VIDEO = "/about.mp4"; // file: public/about.mp4

/* ---------- PREVIOUS EVENTS PAGE (View More button) ---------- */
const PREVIOUS_HREF = "/consciousmain/previouspage";

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

/* ---------- Previous events data (newest first) ---------- */
// title = [normal, italic, normal]
const pastEvents = [
  {
    year: "2026",
    title: ["The Big Bang ", "Festive Edit", ""],
    day: "15",
    ord: "th",
    month: "October, 2026",
    venue: "The Lodhi, Delhi",
    tags: "Fashion, Fine Jewels, Accessories, Bags & Home",
    img: "/hyd aug.jpg",
  },
  {
    year: "2026",
    title: ["The ", "Festive", " Edit"],
    day: "25",
    ord: "th",
    month: "August, 2026",
    venue: "Park Hyatt, Hyderabad",
    tags: "Fashion, Fine Jewellery, Accessories, Gifting & Home",
    img: "/new2.jpg",
  },
  {
    year: "2026",
    title: ["The ", "July", " Edit"],
    day: "21",
    ord: "st",
    month: "July, 2026",
    venue: "The Lodhi, Delhi",
    tags: "Fashion, Fine Jewellery, Accessories, Gifting & Home",
    img: "/new3.jpg",
  },
  {
    year: "2026",
    title: ["A ", "holiday", " Edit"],
    day: "7",
    ord: "th",
    month: "April, 2026",
    venue: "The Quorum, Hyderabad",
    tags: "Ready-To-Wear, Celebration Wear, Bridal, Jewellery, Fine Jewellery, Gifting & Menswear",
    img: "/april-hyderabad.jpg", // <- apni image public/ me isi naam se rakh
  },
  {
    year: "2026",
    title: ["The", "Trunk", "Show"],
    day: "18",
    ord: "th",
    month: "February, 2026",
    venue: "The Lodhi, Delhi",
    tags: "Ready-To-Wear, Celebration Wear, Bridal, Jewellery, Fine Jewellery, Gifting & Menswear",
    img: "/feb-lodhi.jpg", // <- apni image public/ me isi naam se rakh
  },
];

/* ---------- Sponsors (logos in /public) ---------- */
const sponsors = [
  { name: "The Quorum", src: "/quorum.png" },
  { name: "GoDaddy", src: "/godaddy.png" },
  { name: "Red FM 93.5", src: "/redfm.png" },
  { name: "L'Opéra", src: "/lopera.png" },
  { name: "The Imperial, New Delhi", src: "/imperial.png" },
];

/* ---------- As Seen In (logos in /public/seen) ---------- */
const seenIn = [
  { name: "Vogue India", src: "/seen/vogue.png" },
  { name: "Harper's Bazaar", src: "/seen/bazaar.png" },
  { name: "Platform", src: "/seen/platform.png" },
  { name: "The Telegraph", src: "/seen/telegraph.png" },
  { name: "The Times of India", src: "/seen/timesofindia.png" },
  { name: "NDTV", src: "/seen/ndtv.png" },
];

const CalendarIcon = () => (
  <svg {...iconProps}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);

const PinIcon = () => (
  <svg {...iconProps}>
    <path d="M12 21s-7-6.1-7-11.2A7 7 0 0 1 12 3a7 7 0 0 1 7 6.8C19 14.9 12 21 12 21z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

const Branch = ({ className }) => (
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

/* One "group" = the sponsor list repeated twice (so it is wide enough on big screens).
   The track holds 2 identical groups, which makes the loop seamless. */
const SponsorGroup = ({ hidden = false }) => (
  <div className={styles.marqueeGroup} aria-hidden={hidden || undefined}>
    {[0, 1].map((r) =>
      sponsors.map((s) => (
        <div className={styles.logoItem} key={`${r}-${s.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.src}
            alt={hidden || r === 1 ? "" : s.name}
            loading="lazy"
            draggable="false"
          />
        </div>
      ))
    )}
  </div>
);

/* Same idea for "As Seen In" */
const SeenGroup = ({ hidden = false }) => (
  <div className={styles.marqueeGroup} aria-hidden={hidden || undefined}>
    {[0, 1].map((r) =>
      seenIn.map((s) => (
        <div className={styles.seenItem} key={`${r}-${s.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.src}
            alt={hidden || r === 1 ? "" : s.name}
            loading="lazy"
            draggable="false"
          />
        </div>
      ))
    )}
  </div>
);

export default function Home() {
  return (
    <>
      <Nav />

      {/* ================= ABOUT VIDEO (full width, loop, no controls) ================= */}
      <section className={styles.videoSec}>
        <video
          className={styles.video}
          src={ABOUT_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload noplaybackrate nofullscreen"
          tabIndex={-1}
          aria-hidden="true"
        />
      </section>

      {/* ================= SPONSORS ================= */}
      <section id="sponsors" className={`${styles.sponsors} ${cabin.className}`}>
        <div className={styles.sponsorsContainer}>
          <div className={`${styles.sponsorsHead} ${styles.reveal}`}>
            <p className={`${styles.eyebrow} ${poppins.className}`}>
              <span />
              Our Partners
              <span />
            </p>

            <h2 className={styles.sponsorsTitle}>
              Sponsors – <em>Past &amp; Present</em>
            </h2>
          </div>
        </div>

        <div className={styles.marquee} aria-label="Our sponsors">
          <div className={styles.marqueeTrack}>
            <SponsorGroup />
            <SponsorGroup hidden />
          </div>
        </div>
      </section>

      {/* ================= UPCOMING EVENTS ================= */}
      <section id="upcoming" className={`${styles.upcoming} ${cabin.className}`}>
        <div className={styles.upContainer}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <p className={`${styles.eyebrow} ${poppins.className}`}>
              <span />
              Upcoming Events
              <span />
            </p>
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

      {/* ================= PREVIOUS EVENTS ================= */}
      <section id="previous" className={`${styles.past} ${cabin.className}`}>
        <Branch className={styles.pastLeafTop} />
        <Branch className={styles.pastLeafBottom} />

        <div className={styles.pastContainer}>
          <div className={`${styles.pastHead} ${styles.reveal}`}>
            <p className={`${styles.eyebrow} ${poppins.className}`}>
              <span />
              Previous Events
              <span />
            </p>

            <h2 className={styles.pastTitle}>
              Our <em>Past</em> Editions
            </h2>

            <p className={styles.pastSub}>
              A look back at some of our memorable editions that brought
              together India’s leading conscious fashion and lifestyle brands.
            </p>
          </div>

          {/* 3 cards upar, last row ke 2 cards wide (khali jagah nahi dikhegi) */}
          <div className={styles.pastGrid}>
            {pastEvents.map((e, i) => {
              const total = pastEvents.length;
              const rem = total % 3;
              const inLastRow = i >= total - rem;
              const wide = rem === 2 && inLastRow; // last 2 cards => wide
              const single = rem === 1 && inLastRow; // last 1 card => centered
              const lastOdd = i === total - 1 && total % 2 === 1; // tablet ke liye

              return (
                <article
                  key={`${e.day}-${e.month}-${e.venue}`}
                  className={`${styles.pastCard} ${wide ? styles.pastWide : ""} ${
                    single ? styles.pastSingle : ""
                  } ${lastOdd ? styles.pastLastOdd : ""} ${styles.reveal}`}
                >
                  <div className={styles.pastMedia}>
                    <Image
                      src={e.img}
                      alt={`${e.title.join("")} — ${e.venue}`}
                      fill
                      sizes="(max-width: 480px) 90vw, (max-width: 1099px) 40vw, 22vw"
                      className={styles.pastImg}
                    />
                  </div>

                  <div className={styles.pastBody}>
                    <span className={`${styles.yearPill} ${poppins.className}`}>
                      {e.year}
                    </span>

                    <h3 className={styles.pastName}>
                      {e.title[0]}
                      {e.title[1] && <em>{e.title[1]}</em>}
                      {e.title[2]}
                    </h3>

                    <ul className={styles.pastMeta}>
                      <li>
                        <CalendarIcon />
                        <span>
                          {e.day}
                          <sup>{e.ord}</sup> {e.month}
                        </span>
                      </li>
                      <li>
                        <PinIcon />
                        <span>{e.venue}</span>
                      </li>
                    </ul>

                    <p className={styles.pastTags}>{e.tags}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {/* View More => Previous Events page */}
          <div className={`${styles.pastMore} ${styles.reveal}`}>
            <Link
              href={PREVIOUS_HREF}
              className={`${styles.btn} ${poppins.className}`}
            >
              <span className={styles.btnText}>View More</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= INSTAGRAM REELS (Follow #ConsciousEffort) ================= */}
      <Reels />

      {/* ================= AS SEEN IN ================= */}
      <section id="seen" className={`${styles.seen} ${cabin.className}`}>
        <div className={`${styles.seenHead} ${styles.reveal}`}>
          <p className={`${styles.eyebrow} ${poppins.className}`}>
            <span />
            As Seen In
            <span />
          </p>

          <h2 className={styles.seenTitle}>
            Featured <em>In the Press</em>
          </h2>
        </div>

        <div className={styles.marquee} aria-label="As seen in">
          <div className={styles.marqueeTrack}>
            <SeenGroup />
            <SeenGroup hidden />
          </div>
        </div>
      </section>

      {/* ================= ENQUIRY ================= */}
      <section id="enquiry" className={`${styles.enquiry} ${cabin.className}`}>
        <div className={styles.enquiryContainer}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <p className={`${styles.eyebrow} ${poppins.className}`}>
              <span />
              Enquiry
              <span />
            </p>
          </div>

          <EnquiryForm />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />

      {/* ================= WHATSAPP FLOATING ICON ================= */}
      <a
        href="https://wa.me/918920792438"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsapp}
        aria-label="Chat on WhatsApp"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/whatsapp.png" alt="WhatsApp" />
      </a>
    </>
  );
}
import Image from "next/image";
import Link from "next/link";
import { Cabin, Poppins } from "next/font/google";
import Nav from "../../component/nav/Nav";
import Footer from "../../component/footer/Footer";
import "./upcomingpage.css";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata = {
  title: "Upcoming Events | #ConsciousEffort India",
  description:
    "Discover our upcoming editions bringing together India's leading conscious fashion and lifestyle brands.",
};

/* ---------- HEADER IMAGE (file: public/header.jpeg) ---------- */
const HERO_IMG = "/header.jpeg";

/* ---------- APPLY PAGE (tera dynamic application page) ---------- */
// Agar tera form kisi aur route pe hai toh sirf ye ek line badal de
const APPLY_HREF = "/consciousmain/upcoming";

/* ---------- Upcoming events data (nearest first) ---------- */
// title = [normal, italic, normal]
const upcomingEvents = [
  {
    title: ["#Conscious", "Effort", " India"],
    day: "12",
    ord: "th",
    month: "December",
    year: "2026",
    city: "Hyderabad",
    venue: "The Quorum, Hyderabad",
    tags: "Fashion, Fine Jewels, Accessories, Bags & Home",
    img: "/hy.png", // <- apni image public/ me isi naam se rakh
    href: APPLY_HREF,
  },
  // Aur event add karna ho toh upar wale object ko copy karke paste kar do
];

const iconProps = {
  className: "up-metaIcon",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.6",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

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

const BagIcon = () => (
  <svg {...iconProps}>
    <path d="M5 8h14l1 12H4L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    className="up-arrow"
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

export default function UpcomingEventsPage() {
  return (
    <>
      <Nav />

      <main className={`up-page ${cabin.className}`}>
        {/* ================= HEADER IMAGE + TITLE + CONTENT ================= */}
        <section className="up-heroSec">
          <div className="up-hero">
            <Image
              src={HERO_IMG}
              alt="#ConsciousEffort India upcoming editions"
              fill
              priority
              sizes="100vw"
              className="up-heroImg"
            />
            <div className="up-heroOverlay" />

            <div className="up-heroText">
              <p className={`up-heroEyebrow ${poppins.className}`}>
                <span />
                #ConsciousEffort India
                <span />
              </p>

              <h1 className="up-heroTitle">
                Upcoming <em>Events</em>
              </h1>

              <p className="up-heroSub">
                Be a part of our next edition. Discover India’s leading
                conscious fashion and lifestyle brands, celebrate craft and
                creativity, and make mindful choices that matter.
              </p>
            </div>
          </div>
        </section>

        {/* ================= ALL UPCOMING EVENTS ================= */}
        <section className="up-list">
          <Branch className="up-leafTop" />
          <Branch className="up-leafBottom" />

          <div className="up-container">
            {upcomingEvents.length === 0 ? (
              <div className="up-empty up-reveal">
                <h2>
                  New editions <em>coming soon</em>
                </h2>
                <p>
                  We are curating our next experience. Stay tuned for the
                  announcement.
                </p>
              </div>
            ) : (
              <div className="up-stack">
                {upcomingEvents.map((e) => (
                  <article
                    key={`${e.day}-${e.month}-${e.venue}`}
                    className="up-card up-reveal"
                  >
                    {/* image left */}
                    <div className="up-media">
                      <Image
                        src={e.img}
                        alt={`${e.title.join("")} — ${e.venue}`}
                        fill
                        sizes="(max-width: 700px) 92vw, (max-width: 1099px) 50vw, 540px"
                        className="up-img"
                      />

                      <div className={`up-dateBadge ${poppins.className}`}>
                        <strong>{e.day}</strong>
                        <span>{e.month.slice(0, 3)}</span>
                        <em>{e.year}</em>
                      </div>

                      <span className={`up-cityTag ${poppins.className}`}>
                        {e.city}
                      </span>
                    </div>

                    {/* details right */}
                    <div className="up-body">
                      <span className={`up-pill ${poppins.className}`}>
                        Upcoming
                      </span>

                      <h2 className="up-name">
                        {e.title[0]}
                        {e.title[1] && <em>{e.title[1]}</em>}
                        {e.title[2]}
                      </h2>

                      <p className="up-date">
                        {e.day}
                        <sup>{e.ord}</sup> {e.month}, {e.year}
                      </p>

                      <ul className="up-meta">
                        <li>
                          <CalendarIcon />
                          <span>
                            {e.day}
                            <sup>{e.ord}</sup> {e.month}, {e.year}
                          </span>
                        </li>
                        <li>
                          <PinIcon />
                          <span>{e.venue}</span>
                        </li>
                        <li>
                          <BagIcon />
                          <span>{e.tags}</span>
                        </li>
                      </ul>

                      <Link
                        href={e.href}
                        className={`up-btn ${poppins.className}`}
                      >
                        <span>Apply for the Event</span>
                        <ArrowIcon />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
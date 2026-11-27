import Image from "next/image";
import { Cabin, Poppins } from "next/font/google";
import Nav from "../../component/nav/Nav";
import Footer from "../../component/footer/Footer";
import "./previouspage.css";

const cabin = Cabin({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata = {
  title: "Previous Events | #ConsciousEffort India",
  description:
    "A look back at our memorable editions that brought together India's leading conscious fashion and lifestyle brands.",
};

/* ---------- HEADER IMAGE (file: public/previous-hero.jpg) ---------- */
const HERO_IMG = "/header.jpeg";

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
    img: "/previous2.jpeg",
  },
  {
    year: "2026",
    title: ["The ", "July", " Edit"],
    day: "21",
    ord: "st",
    month: "July, 2026",
    venue: "The Lodhi, Delhi",
    tags: "Fashion, Fine Jewellery, Accessories, Gifting & Home",
    img: "/previous3.jpeg",
  },
  {
    year: "2026",
    title: ["A ", "holiday", " Edit"],
    day: "7",
    ord: "th",
    month: "April, 2026",
    venue: "The Quorum, Hyderabad",
    tags: "Ready-To-Wear, Celebration Wear, Bridal, Jewellery, Fine Jewellery, Gifting & Menswear",
    img: "/previous4.jpeg",
  },
  {
    year: "2026",
    title: ["The", "Trunk", "Show"],
    day: "18",
    ord: "th",
    month: "February, 2026",
    venue: "The Lodhi, Delhi",
    tags: "Ready-To-Wear, Celebration Wear, Bridal, Jewellery, Fine Jewellery, Gifting & Menswear",
    img: "/previous5.jpeg",
  },
];

const iconProps = {
  className: "pv-metaIcon",
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

export default function PreviousEventsPage() {
  const total = pastEvents.length;
  const rem = total % 3;

  return (
    <>
      <Nav />

      <main className={`pv-page ${cabin.className}`}>
        {/* ================= HEADER IMAGE + TITLE + CONTENT ================= */}
        <section className="pv-heroSec">
          <div className="pv-hero">
            <Image
              src={HERO_IMG}
              alt="#ConsciousEffort India previous editions"
              fill
              priority
              sizes="100vw"
              className="pv-heroImg"
            />
            <div className="pv-heroOverlay" />

            <div className="pv-heroText">
              <p className={`pv-heroEyebrow ${poppins.className}`}>
                <span />
                #ConsciousEffort India
                <span />
              </p>

              <h1 className="pv-heroTitle">
                Previous <em>Events</em>
              </h1>

              <p className="pv-heroSub">
                A look back at some of our memorable editions that brought
                together India’s leading conscious fashion and lifestyle
                brands. From intimate trunk shows to grand festive edits, every
                edition has celebrated craft, creativity and conscious
                choices.
              </p>
            </div>
          </div>
        </section>

        {/* ================= ALL PREVIOUS EVENTS ================= */}
        <section className="pv-past">
          <Branch className="pv-leafTop" />
          <Branch className="pv-leafBottom" />

          <div className="pv-container">
            <div className="pv-grid">
              {pastEvents.map((e, i) => {
                const inLastRow = i >= total - rem;
                const wide = rem === 2 && inLastRow; // last 2 cards => wide
                const single = rem === 1 && inLastRow; // last 1 card => centered
                const lastOdd = i === total - 1 && total % 2 === 1; // tablet

                return (
                  <article
                    key={`${e.day}-${e.month}-${e.venue}`}
                    className={`pv-card ${wide ? "pv-wide" : ""} ${
                      single ? "pv-single" : ""
                    } ${lastOdd ? "pv-lastOdd" : ""} pv-reveal`}
                  >
                    <div className="pv-media">
                      <Image
                        src={e.img}
                        alt={`${e.title.join("")} — ${e.venue}`}
                        fill
                        sizes="(max-width: 480px) 90vw, (max-width: 1099px) 40vw, 22vw"
                        className="pv-img"
                      />
                    </div>

                    <div className="pv-body">
                      <span className={`pv-yearPill ${poppins.className}`}>
                        {e.year}
                      </span>

                      <h3 className="pv-name">
                        {e.title[0]}
                        {e.title[1] && <em>{e.title[1]}</em>}
                        {e.title[2]}
                      </h3>

                      <ul className="pv-meta">
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

                      <p className="pv-tags">{e.tags}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
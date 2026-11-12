import Image from "next/image";
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

export default function Home() {
  return (
    <>
      <Nav />

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
              <a href="#book" className={`${styles.btn} ${poppins.className}`}>
                <span className={styles.btnText}>Book Your Slot Now</span>
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
              </a>

              
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
    </>
  );
}
// app/loading.js
// Poora loader (code + CSS) isi ek file me hai. Kisi aur file ki zarurat nahi.
// Next.js ise apne aap dikhata hai jab koi page load ho raha ho.

import { Cabin, Poppins } from "next/font/google";

const cabin = Cabin({ subsets: ["latin"], weight: ["400", "500"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600"] });

const BRAND = "#ConsciousEffort India";

const css = `
.ce-loader {
  --gold: #b8935a;
  --gold-light: #d9bf8f;
  --ink: #0a0a0a;

  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  background: #fff;
  color: var(--gold);
  overflow: hidden;
  animation: ce-fadeIn 0.35s ease both;
}

.ce-loader *, .ce-loader *::before, .ce-loader *::after { box-sizing: border-box; }

/* soft warm glow behind the content */
.ce-loader::before {
  content: "";
  position: absolute;
  width: min(80vw, 520px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(184, 147, 90, 0.14), rgba(184, 147, 90, 0) 68%);
  pointer-events: none;
}

.ce-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  text-align: center;
}

/* ---------- leaf (draws itself) ---------- */
.ce-leaf {
  width: clamp(72px, 14vw, 104px);
  height: auto;
  margin-bottom: 26px;
  overflow: visible;
  animation: ce-float 3.6s ease-in-out infinite;
}

.ce-stroke {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: ce-draw 3.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}
.ce-s1 { animation-delay: 0s; }
.ce-s2 { animation-delay: 0.35s; }
.ce-s3 { animation-delay: 0.6s; }
.ce-s4 { animation-delay: 0.85s; }

@keyframes ce-draw {
  0%   { stroke-dashoffset: 1; opacity: 1; }
  45%  { stroke-dashoffset: 0; opacity: 1; }
  80%  { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}

@keyframes ce-float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

/* ---------- brand ---------- */
.ce-brand {
  margin: 0;
  font-family: "Times New Roman", Times, serif;
  font-weight: 400;
  font-size: clamp(1.5rem, 5vw, 2.2rem);
  line-height: 1.2;
  letter-spacing: 0.01em;
  color: var(--ink);
  animation: ce-rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.15s both;
}

.ce-est {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 14px 0 0;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: var(--gold);
  animation: ce-rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.35s both;
}

.ce-est span {
  display: block;
  width: 34px;
  height: 1px;
  background: var(--gold);
}

/* ---------- progress bar ---------- */
.ce-bar {
  position: relative;
  width: clamp(140px, 36vw, 200px);
  height: 2px;
  margin-top: 34px;
  border-radius: 2px;
  background: rgba(184, 147, 90, 0.2);
  overflow: hidden;
  animation: ce-rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.5s both;
}

.ce-bar i {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 45%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--gold), var(--gold-light));
  animation: ce-glide 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@keyframes ce-glide {
  0%   { transform: translateX(-110%); }
  100% { transform: translateX(260%); }
}

/* ---------- misc ---------- */
@keyframes ce-rise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}

@keyframes ce-fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.ce-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ---------- small phones ---------- */
@media (max-width: 380px) {
  .ce-est { gap: 10px; letter-spacing: 2.5px; }
  .ce-est span { width: 22px; }
}

/* ---------- reduced motion: no drawing / sliding, just a gentle pulse ---------- */
@media (prefers-reduced-motion: reduce) {
  .ce-stroke { animation: none; stroke-dashoffset: 0; }
  .ce-leaf { animation: ce-pulse 2s ease-in-out infinite; }
  .ce-bar i { animation: none; width: 100%; opacity: 0.6; }
  .ce-brand, .ce-est, .ce-bar { animation: none; }
}

@keyframes ce-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
`;

export default function Loading() {
  return (
    <div
      className={`ce-loader ${cabin.className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <style>{css}</style>

      <div className="ce-inner">
        {/* Leaf that draws itself, same leaf as the site's decorations */}
        <svg
          className="ce-leaf"
          viewBox="0 0 120 160"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path pathLength="1" className="ce-stroke ce-s1" d="M60 155C58 110 62 60 90 8" />
          <path pathLength="1" className="ce-stroke ce-s2" d="M62 120C30 112 14 86 16 56c32 6 48 30 46 64z" />
          <path pathLength="1" className="ce-stroke ce-s3" d="M66 82C98 76 112 54 108 26c-30 6-46 28-42 56z" />
          <path pathLength="1" className="ce-stroke ce-s4" d="M62 120C46 104 30 82 16 56" />
        </svg>

        <h1 className="ce-brand">{BRAND}</h1>

        <p className={`ce-est ${poppins.className}`}>
          <span />
          Est. 2017
          <span />
        </p>

        {/* thin gold bar that glides across */}
        <div className="ce-bar" aria-hidden="true">
          <i />
        </div>

        <span className="ce-sr">Loading, please wait</span>
      </div>
    </div>
  );
}
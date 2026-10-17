import type { Metadata } from "next";
import { Download } from "lucide-react";
import { Logo, StormMark } from "@/components/brand";
export const metadata: Metadata = {
  title: "Brand assets",
  description: "Download the CacheStorm vector logo and lightning mark as SVG.",
  alternates: { canonical: "/brand/" },
};
export default function Brand() {
  return (
    <div className="container">
      <header className="page-hero">
        <p className="eyebrow">THE SHAPE OF THE STORM</p>
        <h1>
          A little spark.
          <br />
          <em>A clear identity.</em>
        </h1>
        <p>
          The CacheStorm mark, redrawn as a scalable vector. Electric blue, cool
          silver, and a lightning bolt at its heart.
        </p>
      </header>
      <section className="page-section">
        <div className="brand-grid">
          <div className="brand-preview">
            <div className="brand-art">
              <Logo large />
            </div>
            <div>
              <span>Primary wordmark</span>
              <a href="/logo.svg" download>
                Download SVG
                <Download size={15} />
              </a>
            </div>
          </div>
          <div className="brand-preview">
            <div className="brand-art">
              <StormMark />
            </div>
            <div>
              <span>Standalone mark</span>
              <a href="/logo-mark.svg" download>
                Download SVG
                <Download size={15} />
              </a>
            </div>
          </div>
        </div>
        <div className="brand-notes">
          <h2>Made to scale.</h2>
          <p>
            These assets are real vector paths, with transparent backgrounds.
            The mark works on both light and dark surfaces. Keep the
            proportions, allow space around the logo, and preserve the blue and
            silver palette.
          </p>
          <p>
            Need the wordmark on a dark background?{" "}
            <a className="text-link" href="/logo-white.svg" download>
              Download the white wordmark <Download size={14} />
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

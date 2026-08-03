"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    function updateVisibility() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setVisible(window.scrollY > 360));
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  if (!visible) return null;

  function scrollToTop() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return (
    <button className="base-scroll-top" type="button" aria-label="Scroll to top" title="Scroll to top" onClick={scrollToTop}>
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}

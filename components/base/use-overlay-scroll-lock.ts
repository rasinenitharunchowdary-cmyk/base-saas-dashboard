"use client";

import { useEffect, useRef } from "react";

export function useOverlayScrollLock(active: boolean, onClose?: () => void) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current?.();
    }

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [active]);
}

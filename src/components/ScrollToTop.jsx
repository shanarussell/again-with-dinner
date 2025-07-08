import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ 
  behavior = "smooth", 
  top = 0,
  disabled = false,
  respectReducedMotion = true
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (disabled) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = respectReducedMotion && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollBehavior = prefersReducedMotion ? "auto" : behavior;

    try {
      window.scrollTo({
        top,
        left: 0,
        behavior: scrollBehavior
      });
    } catch (error) {
      // Fallback for browsers that don't support smooth scrolling console.warn('Smooth scrolling not supported, falling back to instant scroll');
      window.scrollTo(0, top);
    }
  }, [pathname, behavior, top, disabled, respectReducedMotion]);

  return null;
};

export default ScrollToTop;
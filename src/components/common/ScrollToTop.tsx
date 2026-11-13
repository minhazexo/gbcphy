import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets the document scroll position whenever the active route changes.
 * Manual browser restoration prevents Back/Forward navigation from restoring
 * the previous page's scroll position instead of starting at the top.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

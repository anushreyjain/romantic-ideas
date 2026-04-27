"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "rt-theme";
const COOKIE_NAME = "rt-theme";
const EVENT_NAME  = "rt-theme-change";

function readStoredTheme(): Theme {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch { /* ignore */ }
  return "dark";
}

function persistTheme(theme: Theme) {
  // localStorage for quick client reads
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  // Cookie so the server can read it on next request and render the right theme
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function useTheme() {
  // Always start as "dark" to match SSR default — corrected before first paint
  const [theme, setThemeState] = useState<Theme>("dark");
  const userToggled = useRef(false);

  // On mount: read stored preference and ensure the cookie is always in sync
  // so the server can read the correct theme on every future request.
  useLayoutEffect(() => {
    const stored = readStoredTheme();
    persistTheme(stored); // write cookie even if user never explicitly toggled
    if (stored !== "dark") {
      queueMicrotask(() => setThemeState(stored));
    }
  }, []);

  // Apply DOM changes whenever theme changes
  useLayoutEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    if (userToggled.current) {
      persistTheme(theme);
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: theme }));
      userToggled.current = false;
    }
  }, [theme]);

  // Stay in sync with other useTheme instances on the same page
  useEffect(() => {
    function onExternalChange(e: Event) {
      const next = (e as CustomEvent<Theme>).detail;
      setThemeState((cur) => (cur !== next ? next : cur));
    }
    window.addEventListener(EVENT_NAME, onExternalChange);
    return () => window.removeEventListener(EVENT_NAME, onExternalChange);
  }, []);

  const toggleTheme = useCallback(() => {
    userToggled.current = true;
    setThemeState((cur) => (cur === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}

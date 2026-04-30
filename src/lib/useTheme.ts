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
  return "light";
}

function persistTheme(theme: Theme) {
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function useTheme() {
  // Always start as "light" to match SSR default — corrected before first paint
  const [theme, setThemeState] = useState<Theme>("light");
  const userToggled = useRef(false);

  useLayoutEffect(() => {
    const stored = readStoredTheme();
    persistTheme(stored);
    if (stored !== "light") {
      queueMicrotask(() => setThemeState(stored));
    }
  }, []);

  // Apply DOM changes whenever theme changes
  useLayoutEffect(() => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
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

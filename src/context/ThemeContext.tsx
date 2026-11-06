import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<{ theme: string; toggleTheme: () => void } | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("site-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    // Apply to <html> as well, so the page canvas and overscroll area
    // follow the theme rather than staying on the light default.
    for (const el of [document.documentElement, document.body]) {
      el.classList.remove("dark-theme", "light-theme");
      el.classList.add(`${theme}-theme`);
    }
    localStorage.setItem("site-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;

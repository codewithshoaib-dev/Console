import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", saved);
    setTheme(saved);
  }, []);


  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.style.visibility = "hidden";

    requestAnimationFrame(() => {
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      setTheme(next);
      document.documentElement.style.visibility = "visible";
    });
  };


  return (
    <button
      name="theme-toggle"
      onClick={toggle}
      className="h-9 w-9 rounded-lg bg-muted hover:bg-surface border border-border flex items-center justify-center transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </button>
  );
}

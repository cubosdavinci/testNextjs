// useBrowserTheme.ts
import { useState, useEffect } from "react"

export function useBrowserTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    // Set initial theme
    setTheme(mediaQuery.matches ? "dark" : "light")

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [])

  return theme
}
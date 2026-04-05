import { useColorMode } from "@chakra-ui/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext();

const THEME_STORAGE_KEY = "theme";
const prefersDarkMediaQuery = "(prefers-color-scheme: dark)";

const getStoredTheme = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(THEME_STORAGE_KEY);
};

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  
  // Check for system theme preference
  const isDarkMode = window.matchMedia(prefersDarkMediaQuery).matches;
  
  return isDarkMode ? "dark" : "light";
};

export { ThemeContext };

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [systemTheme, setSystemTheme] = useState(getSystemTheme());
  const { setColorMode } = useColorMode();

  // Set theme based on preference
  const applyTheme = (themePreference) => {
    const themeToApply = themePreference === "system" ? systemTheme : themePreference;
    document.documentElement.setAttribute("data-theme", themeToApply);
    setColorMode(themeToApply);
  };

  // Initialize theme
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get stored theme or default to system
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      setTheme(storedTheme);
    }
    
    // Apply the theme
    applyTheme(storedTheme || "system");
    
    // Set up system theme change listener
    const mediaQuery = window.matchMedia(prefersDarkMediaQuery);
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      console.log('System theme changed to:', newSystemTheme);
      setSystemTheme(newSystemTheme);
      
      // Only update if we're in system mode
      if (theme === "system") {
        applyTheme("system");
      }
    };
    
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    
    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (theme === "system") {
      // When switching to system theme, use current system theme
      applyTheme("system");
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      // When setting a specific theme
      applyTheme(theme);
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme, systemTheme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "system";
      return "light";
    });
  };

  const value = useMemo(() => ({
    theme,
    appliedTheme: theme === "system" ? systemTheme : theme,
    setTheme,
    toggleTheme,
  }), [theme, systemTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

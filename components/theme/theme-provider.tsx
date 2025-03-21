"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { setCookie, getCookie, COOKIE_KEYS } from "@/lib/cookies";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
                                  children,
                                  defaultTheme = "system",
                              }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Load theme from cookie on initial mount
        const savedTheme = getCookie(COOKIE_KEYS.THEME) as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;

        // Remove existing theme classes
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";

            root.classList.add(systemTheme);

            // Set data attribute for CSS selectors
            root.setAttribute("data-theme", systemTheme);
        } else {
            root.classList.add(theme);

            // Set data attribute for CSS selectors
            root.setAttribute("data-theme", theme);
        }
    }, [theme, mounted]);

    // Avoid hydration mismatch by only rendering once mounted
    if (!mounted) {
        return <>{children}</>;
    }

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            setCookie(COOKIE_KEYS.THEME, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
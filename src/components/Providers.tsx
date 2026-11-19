"use client";

import { ThemeProvider, useTheme } from "next-themes";
import React, { useEffect } from "react";
import { Toaster } from "sonner";
import CustomCursor from "./CustomCursor";
import SoundProvider from "./SoundProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="light" disableTransitionOnChange>
      <SoundProvider>
        <ThemeColorUpdater />
        {children}
        <ToastProvider />
        <CustomCursor />
      </SoundProvider>
    </ThemeProvider>
  );
}

function ToastProvider() {
  // forcedTheme wins: the site is always light, whatever the OS prefers.
  const { forcedTheme, resolvedTheme: systemTheme } = useTheme();
  const resolvedTheme = forcedTheme ?? systemTheme;

  return (
    <Toaster
      className="mt-12"
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const timerId = setTimeout(() => {
      const bodyStyles = window.getComputedStyle(document.body);
      const backgroundColor = bodyStyles.backgroundColor;
      let metaThemeColor = document.querySelector<HTMLMetaElement>(
        "meta[name='theme-color']",
      );
      if (metaThemeColor) {
        metaThemeColor.content = backgroundColor;
      } else {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.name = "theme-color";
        metaThemeColor.content = backgroundColor;
        document.head.appendChild(metaThemeColor);
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, [resolvedTheme]);

  return null;
}
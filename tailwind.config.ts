import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        brand: "hsl(var(--brand))",
        highlight: "hsl(var(--highlight))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",

      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        rise: {
          from: { transform: "translateY(105%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        draw: {
          from: { strokeDashoffset: "1" },
          to: { strokeDashoffset: "0" },
        },
        "plug-in": {
          from: { opacity: "0", transform: "translateX(-16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        rise: "rise 0.9s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "fade-up": "fade-up 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        draw: "draw 1.1s cubic-bezier(0.6, 0, 0.3, 1) both",
        "spin-slow": "spin 14s linear infinite",
        "plug-in": "plug-in 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    // Custom plugin for iOS-specific improvements
    function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        ".ios-prevent-zoom": {
          "@media (max-width: 639px)": {
            "font-size": "16px !important",
          },
          "@media (min-width: 640px)": {
            "font-size": "0.875rem !important",
          },
        },
        ".touch-target": {
          "min-height": "36px",
          "min-width": "36px",
          "@media (min-width: 640px)": {
            "min-height": "40px",
            "min-width": "40px",
          },
        },
      });
    },
  ],
};
export default config;

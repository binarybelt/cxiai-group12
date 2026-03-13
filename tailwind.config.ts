import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pfizer: {
          blue: {
            100: "#E6F4FB",
            500: "#0093D0",
            700: "#006699",
          },
        },
        coral: {
          400: "#FF7F6E",
        },
        amber: {
          300: "#FFD166",
        },
        gray: {
          100: "#F3F6FA",
          200: "#DCE3EB",
          300: "#C3CEDB",
          500: "#64748B",
          700: "#334155",
          900: "#0F172A",
        },
        success: {
          DEFAULT: "#1F9D68",
        },
        warning: {
          DEFAULT: "#F59E0B",
        },
        error: {
          DEFAULT: "#DC2626",
        },
      },
      fontSize: {
        "heading-xl": ["2.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "heading-lg": ["2rem", { lineHeight: "1.15", fontWeight: "700" }],
        "heading-md": ["1.5rem", { lineHeight: "1.25", fontWeight: "600" }],
        "body-lg": ["1.125rem", { lineHeight: "1.7", fontWeight: "400" }],
        "body-md": ["1rem", { lineHeight: "1.7", fontWeight: "400" }],
        "body-sm": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      spacing: {
        "token-xs": "4px",
        "token-sm": "8px",
        "token-md": "16px",
        "token-lg": "24px",
        "token-xl": "32px",
        "token-2xl": "48px",
        "token-3xl": "64px",
      },
      borderRadius: {
        "token-sm": "4px",
        "token-md": "8px",
        "token-lg": "16px",
        "token-full": "9999px",
      },
      boxShadow: {
        "token-sm": "0 6px 18px rgba(15, 23, 42, 0.08)",
        "token-md": "0 12px 30px rgba(15, 23, 42, 0.12)",
        "token-lg": "0 24px 60px rgba(15, 23, 42, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

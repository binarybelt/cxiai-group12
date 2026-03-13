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
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config & { safelist?: string[] } = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'text-green-600',
    'text-green-700', 
    'text-green-800',
    'text-red-500',
    'text-red-600',
    'text-blue-600',
    'text-gray-600',
    'text-gray-700',
    'bg-green-50',
    'bg-red-50',
    'bg-blue-50',
    'border-green-200',
    'border-red-200',
    'border-blue-200'
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
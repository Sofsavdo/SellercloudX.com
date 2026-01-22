import type { Config } from "tailwindcss"

const config: Config = {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./client/index.html",
		"./client/src/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.{js,ts,jsx,tsx}",
		"./shared/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",

				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
				},
				tertiary: {
					DEFAULT: "hsl(var(--tertiary) / <alpha-value>)",
					foreground: "hsl(var(--tertiary-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
				},
				success: {
					DEFAULT: "hsl(var(--success) / <alpha-value>)",
					foreground: "hsl(var(--success-foreground) / <alpha-value>)",
				},
				warning: {
					DEFAULT: "hsl(var(--warning) / <alpha-value>)",
					foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
				},
				info: {
					DEFAULT: "hsl(var(--info) / <alpha-value>)",
					foreground: "hsl(var(--info-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)",
				},
				sidebar: {
					DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
					foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
					border: "hsl(var(--sidebar-border) / <alpha-value>)",
					ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
					accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
				},
			},
			borderRadius: {
				"3xl": "1.5rem",
				"4xl": "2rem",
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			fontFamily: {
				sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
				display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
				mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
				ui: ["Inter", "system-ui", "sans-serif"],
			},
			fontSize: {
				"hero": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "900" }],
				"section": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "800" }],
				"subsection": ["2rem", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" }],
				"card-title": ["1.5rem", { lineHeight: "1.33", letterSpacing: "-0.01em", fontWeight: "600" }],
				"body-lg": ["1.125rem", { lineHeight: "1.75", fontWeight: "500" }],
			},
			boxShadow: {
				"card": "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)",
				"card-hover": "0 1px 3px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.08)",
				"glow": "0 0 20px rgba(99, 102, 241, 0.3)",
				"glow-lg": "0 0 40px rgba(99, 102, 241, 0.4)",
				"glow-primary": "0 10px 40px rgba(99, 102, 241, 0.25)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0", opacity: "0" },
					to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
					to: { height: "0", opacity: "0" },
				},
				fadeIn: {
					from: { opacity: "0", transform: "translateY(10px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				fadeInUp: {
					from: { opacity: "0", transform: "translateY(20px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				slideUp: {
					from: { opacity: "0", transform: "translateY(40px)" },
					to: { opacity: "1", transform: "translateY(0)" },
				},
				scaleIn: {
					from: { opacity: "0", transform: "scale(0.95)" },
					to: { opacity: "1", transform: "scale(1)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0) translateX(0)" },
					"25%": { transform: "translateY(-20px) translateX(10px)" },
					"50%": { transform: "translateY(-10px) translateX(-10px)" },
					"75%": { transform: "translateY(-30px) translateX(5px)" },
				},
				pulse: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.5" },
				},
				shimmer: {
					from: { backgroundPosition: "-200% 0" },
					to: { backgroundPosition: "200% 0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fadeIn 0.5s ease-out forwards",
				"fade-in-up": "fadeInUp 0.6s ease-out forwards",
				"slide-up": "slideUp 0.6s ease-out forwards",
				"scale-in": "scaleIn 0.3s ease-out forwards",
				"float": "float 20s ease-in-out infinite",
				"pulse-slow": "pulse 3s ease-in-out infinite",
				"shimmer": "shimmer 2s linear infinite",
			},
			spacing: {
				"18": "4.5rem",
				"88": "22rem",
				"128": "32rem",
			},
			maxWidth: {
				"8xl": "88rem",
			},
		},
	},
	plugins: [
		require("tailwindcss-animate"),
	],
}

export default config
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Semantic Colors mapped to globals.css variables
                primary: "var(--primary-dark)", // Background: White (Light) / Black (Dark)
                secondary: "var(--primary-blue)", // Main Action: Blue
                accent: "var(--accent-orange)",   // Highlights: Orange

                surface: "var(--surface-card)",   // Cards/Modals
                glass: "var(--surface-glass)",
                nav: "var(--nav-bg)",             // Sidebar/Header

                text: {
                    main: "var(--text-primary)",
                    sub: "var(--text-secondary)",
                    muted: "var(--text-muted)",
                },

                // Success/Error
                success: {
                    bg: "var(--success-bg)",
                    border: "var(--success-border)",
                    text: "var(--success-text)",
                },
                error: {
                    bg: "var(--error-bg)",
                    border: "var(--error-border)",
                    text: "var(--error-text)",
                }
            },
            backgroundImage: {
                'gradient-main': "var(--gradient-primary)",
                'gradient-accent': "var(--gradient-accent)",
            }
        },
    },
    plugins: [],
    darkMode: ['class', '[data-theme="dark"]'],
};
export default config;

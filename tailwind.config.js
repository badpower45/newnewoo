/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#F97316', // Orange 500 - Main Brand Color
                    dark: '#EA580C',    // Orange 600
                    light: '#FFEDD5',   // Orange 100
                },
                secondary: {
                    DEFAULT: '#F97316', // Orange 500 - Accents (Buttons etc)
                },
                brand: {
                    brown: '#3E2723', // Dark Brown for text/headings
                    orange: '#F97316', // Orange 500 for accents
                },
                dark: {
                    DEFAULT: '#1F2937', // Gray 800
                    light: '#4B5563',   // Gray 600
                },
                light: {
                    DEFAULT: '#FAFAFA', // Background
                    card: '#FFFFFF',
                }
            },
            fontFamily: {
                sans: ['"UXI Digital"', 'sans-serif'], // Custom UXI Digital font
                display: ['"UXI Digital"', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
                'float': '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            spacing: {
                'safe': 'env(safe-area-inset-bottom)',
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
            }
        },
    },
    plugins: [],
}

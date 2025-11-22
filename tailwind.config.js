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
                    DEFAULT: '#FFC107', // Amber 500 - Main Brand Color
                    dark: '#FFA000',    // Amber 600
                    light: '#FFECB3',   // Amber 100
                },
                secondary: {
                    DEFAULT: '#F57C00', // Orange 700 - Accents (Buttons etc)
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
                sans: ['"Varela Round"', 'sans-serif'], // Rounded friendly font
                display: ['"Varela Round"', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
                'float': '0 4px 12px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
}

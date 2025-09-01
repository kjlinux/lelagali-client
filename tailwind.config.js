/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

export default {
    darkMode: ['selector', '[class*="app-dark"]'],
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    plugins: [PrimeUI],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        },
        extend: {
            colors: {
                lelagali: {
                    green: '#47A547',
                    orange: '#E6782C',
                    beige: '#FDF6EC',
                    brown: '#4B2E1E',
                    yellow: '#F8C346'
                }
            },
            fontFamily: {
                sans: ['Open Sans', 'Roboto', 'sans-serif'],
                heading: ['Montserrat', 'Poppins', 'sans-serif']
            }
        },
        plugins: []
    }
};

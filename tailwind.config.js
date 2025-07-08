/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2D5A27', // deep sage green
        'primary-50': '#F0F7EF', // very light sage
        'primary-100': '#D4E8D1', // light sage
        'primary-200': '#A9D1A3', // medium light sage
        'primary-300': '#7EBA75', // medium sage
        'primary-400': '#53A347', // medium dark sage
        'primary-500': '#2D5A27', // deep sage green
        'primary-600': '#244A20', // darker sage
        'primary-700': '#1B3A18', // very dark sage
        'primary-800': '#122A11', // darkest sage
        'primary-900': '#091A09', // almost black sage
        'primary-foreground': '#FFFFFF', // white

        // Secondary Colors
        'secondary': '#8B4513', // warm brown
        'secondary-50': '#F7F2ED', // very light brown
        'secondary-100': '#E8D5C4', // light brown
        'secondary-200': '#D1AB89', // medium light brown
        'secondary-300': '#BA814E', // medium brown
        'secondary-400': '#A35713', // medium dark brown
        'secondary-500': '#8B4513', // warm brown
        'secondary-600': '#73390F', // darker brown
        'secondary-700': '#5B2D0C', // very dark brown
        'secondary-800': '#432108', // darkest brown
        'secondary-900': '#2B1505', // almost black brown
        'secondary-foreground': '#FFFFFF', // white

        // Accent Colors
        'accent': '#E67E22', // vibrant orange
        'accent-50': '#FDF4ED', // very light orange
        'accent-100': '#F9E2CC', // light orange
        'accent-200': '#F3C599', // medium light orange
        'accent-300': '#EDA866', // medium orange
        'accent-400': '#E78B33', // medium dark orange
        'accent-500': '#E67E22', // vibrant orange
        'accent-600': '#C2681C', // darker orange
        'accent-700': '#9E5216', // very dark orange
        'accent-800': '#7A3C10', // darkest orange
        'accent-900': '#56260A', // almost black orange
        'accent-foreground': '#FFFFFF', // white

        // Background Colors
        'background': '#FEFEFE', // soft white
        'surface': '#F8F9FA', // subtle gray
        'surface-50': '#FFFFFF', // pure white
        'surface-100': '#F8F9FA', // subtle gray
        'surface-200': '#E9ECEF', // light gray
        'surface-300': '#DEE2E6', // medium light gray
        'surface-400': '#CED4DA', // medium gray
        'surface-500': '#ADB5BD', // medium dark gray
        'surface-600': '#6C757D', // dark gray
        'surface-700': '#495057', // very dark gray
        'surface-800': '#343A40', // darkest gray
        'surface-900': '#212529', // almost black

        // Text Colors
        'text-primary': '#2C3E50', // dark blue-gray
        'text-secondary': '#6C757D', // medium gray
        'text-muted': '#ADB5BD', // light gray
        'text-inverse': '#FFFFFF', // white

        // Status Colors
        'success': '#27AE60', // fresh green
        'success-50': '#E8F5E8', // very light green
        'success-100': '#C3E6C3', // light green
        'success-200': '#9DD79D', // medium light green
        'success-300': '#77C877', // medium green
        'success-400': '#51B951', // medium dark green
        'success-500': '#27AE60', // fresh green
        'success-600': '#209150', // darker green
        'success-700': '#197440', // very dark green
        'success-800': '#125730', // darkest green
        'success-900': '#0B3A20', // almost black green
        'success-foreground': '#FFFFFF', // white

        'warning': '#F39C12', // amber
        'warning-50': '#FEF7E6', // very light amber
        'warning-100': '#FCE8B8', // light amber
        'warning-200': '#F9D98A', // medium light amber
        'warning-300': '#F6CA5C', // medium amber
        'warning-400': '#F3BB2E', // medium dark amber
        'warning-500': '#F39C12', // amber
        'warning-600': '#CC830F', // darker amber
        'warning-700': '#A56A0C', // very dark amber
        'warning-800': '#7E5109', // darkest amber
        'warning-900': '#573806', // almost black amber
        'warning-foreground': '#FFFFFF', // white

        'error': '#E74C3C', // clear red
        'error-50': '#FDEBEA', // very light red
        'error-100': '#F8C8C4', // light red
        'error-200': '#F3A59E', // medium light red
        'error-300': '#EE8278', // medium red
        'error-400': '#E95F52', // medium dark red
        'error-500': '#E74C3C', // clear red
        'error-600': '#C23E32', // darker red
        'error-700': '#9D3028', // very dark red
        'error-800': '#78221E', // darkest red
        'error-900': '#531414', // almost black red
        'error-foreground': '#FFFFFF', // white

        // Border Colors
        'border': '#E9ECEF', // light gray
        'border-muted': '#DEE2E6', // medium light gray
      },
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'body': ['Source Sans Pro', 'sans-serif'],
        'caption': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'modal': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'floating': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease-in-out': 'ease-in-out',
        'ease-out': 'ease-out',
      },
      zIndex: {
        '100': '100',
        '150': '150',
        '200': '200',
        '300': '300',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(280px, 1fr))',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
  "colors": {
    "tertiary-fixed": "#ffdcc2",
    "on-secondary-fixed": "#341100",
    "tertiary": "#ffb77b",
    "background": "#121317",
    "on-primary-fixed-variant": "#773300",
    "on-tertiary": "#4d2700",
    "primary-fixed": "#ffdbca",
    "inverse-surface": "#e3e2e7",
    "on-tertiary-fixed-variant": "#6d3a00",
    "tertiary-fixed-dim": "#ffb77b",
    "on-error": "#690005",
    "on-primary-fixed": "#331200",
    "surface-container-lowest": "#0d0e12",
    "on-surface": "#e3e2e7",
    "error-container": "#93000a",
    "surface-bright": "#38393d",
    "surface-container-highest": "#343439",
    "on-secondary-fixed-variant": "#773206",
    "surface-dim": "#121317",
    "on-surface-variant": "#e0c0b1",
    "on-tertiary-container": "#4a2500",
    "secondary-container": "#7a3408",
    "secondary-fixed-dim": "#ffb692",
    "on-secondary-container": "#ffa172",
    "secondary-fixed": "#ffdbcb",
    "primary-fixed-dim": "#ffb68f",
    "surface": "#121317",
    "on-secondary": "#562000",
    "inverse-primary": "#9c4400",
    "primary-container": "#f1700e",
    "on-background": "#e3e2e7",
    "tertiary-container": "#d7812c",
    "surface-container-high": "#292a2e",
    "outline": "#a78b7d",
    "surface-variant": "#343439",
    "primary": "#ffb68f",
    "on-primary": "#542200",
    "on-primary-container": "#502000",
    "surface-container": "#1e1f24",
    "surface-container-low": "#1a1b1f",
    "on-tertiary-fixed": "#2e1500",
    "outline-variant": "#584236",
    "on-error-container": "#ffdad6",
    "inverse-on-surface": "#2f3035",
    "error": "#ffb4ab",
    "secondary": "#ffb692",
    "surface-tint": "#ffb68f"
  },
  "borderRadius": {
    "DEFAULT": "0.25rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "full": "9999px"
  },
  "spacing": {
    "space-xl": "2rem",
    "space-2xs": "0.25rem",
    "space-xs": "0.5rem",
    "space-2xl": "2.5rem",
    "gutter": "1.25rem",
    "space-gutter": "1.5rem",
    "space-lg": "1.5rem",
    "space-sm": "0.75rem",
    "margin": "2rem",
    "gutter-mobile": "0.75rem",
    "space-md": "1rem",
    "margin-mobile": "1rem"
  },
  "fontFamily": {
    "display-lg": [
      "Plus Jakarta Sans"
    ],
    "title-md": [
      "Plus Jakarta Sans"
    ],
    "label-lg": [
      "Plus Jakarta Sans"
    ],
    "label-md": [
      "Plus Jakarta Sans"
    ],
    "display-lg-mobile": [
      "Plus Jakarta Sans"
    ],
    "body-sm": [
      "Plus Jakarta Sans"
    ],
    "body-lg": [
      "Plus Jakarta Sans"
    ],
    "body-md": [
      "Plus Jakarta Sans"
    ],
    "label-sm": [
      "Plus Jakarta Sans"
    ],
    "headline-sm": [
      "Plus Jakarta Sans"
    ],
    "headline-lg": [
      "Plus Jakarta Sans"
    ],
    "headline-md": [
      "Plus Jakarta Sans"
    ]
  },
  "fontSize": {
    "display-lg": [
      "40px",
      {
        "lineHeight": "48px",
        "letterSpacing": "-0.03em",
        "fontWeight": "700"
      }
    ],
    "title-md": [
      "16px",
      {
        "lineHeight": "24px",
        "letterSpacing": "0em",
        "fontWeight": "600"
      }
    ],
    "label-lg": [
      "14px",
      {
        "lineHeight": "20px",
        "letterSpacing": "0.01em",
        "fontWeight": "600"
      }
    ],
    "label-md": [
      "12px",
      {
        "lineHeight": "16px",
        "letterSpacing": "0.02em",
        "fontWeight": "600"
      }
    ],
    "display-lg-mobile": [
      "32px",
      {
        "lineHeight": "40px",
        "letterSpacing": "-0.02em",
        "fontWeight": "700"
      }
    ],
    "body-sm": [
      "12px",
      {
        "lineHeight": "18px",
        "letterSpacing": "0.01em",
        "fontWeight": "400"
      }
    ],
    "body-lg": [
      "16px",
      {
        "lineHeight": "26px",
        "letterSpacing": "0em",
        "fontWeight": "400"
      }
    ],
    "body-md": [
      "14px",
      {
        "lineHeight": "22px",
        "letterSpacing": "0em",
        "fontWeight": "400"
      }
    ],
    "label-sm": [
      "10px",
      {
        "lineHeight": "14px",
        "letterSpacing": "0.06em",
        "fontWeight": "700"
      }
    ],
    "headline-sm": [
      "18px",
      {
        "lineHeight": "26px",
        "letterSpacing": "-0.01em",
        "fontWeight": "600"
      }
    ],
    "headline-lg": [
      "28px",
      {
        "lineHeight": "36px",
        "letterSpacing": "-0.02em",
        "fontWeight": "700"
      }
    ],
    "headline-md": [
      "22px",
      {
        "lineHeight": "30px",
        "letterSpacing": "-0.015em",
        "fontWeight": "600"
      }
    ]
  }
}
  },
  plugins: [],
};

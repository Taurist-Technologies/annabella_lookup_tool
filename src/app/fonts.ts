import localFont from 'next/font/local';

export const menoBanner = localFont({
  src: [
    {
      path: '../fonts/MenoBanner-Bold.woff2',
      weight: '700',
      style: 'normal'
    }
  ],
  variable: '--font-meno-banner',
  fallback: ['Georgia', 'serif'],
  display: 'swap',
  preload: true
});

export const gibson = localFont({
  src: [
    {
      path: '../fonts/GibsonVF-Regular.woff2',
      weight: '400',
      style: 'normal'
    }
  ],
  variable: '--font-gibson',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
  display: 'swap',
  preload: true
});
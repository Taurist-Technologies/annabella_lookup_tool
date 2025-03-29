// Temporarily using CSS variables with fallback fonts until custom fonts are available
export const menoBanner = {
  variable: '--font-meno-banner',
  className: '',
};

export const gaMaamli = {
  variable: '--font-ga-maamli',
  className: '',
};

export const gibson = {
  variable: '--font-gibson',
  className: '',
};

export const quicksand = {
  variable: '--font-quicksand',
  className: '',
};

/* 
// Original configuration - uncomment when font files are available
import localFont from 'next/font/local';

export const menoBanner = localFont({
  src: [
    {
      path: '../fonts/MenoBanner-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/MenoBanner-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-meno-banner',
  fallback: ['Georgia', 'serif']
});

export const gaMaamli = localFont({
  src: '../fonts/GaMaamli-Regular.woff2',
  variable: '--font-ga-maamli',
  fallback: ['system-ui', 'sans-serif']
});

export const gibson = localFont({
  src: [
    {
      path: '../fonts/Gibson-Light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../fonts/Gibson-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-gibson',
  fallback: ['Helvetica', 'Arial', 'sans-serif']
});

export const quicksand = localFont({
  src: [
    {
      path: '../fonts/Quicksand-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Quicksand-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--font-quicksand',
  fallback: ['Arial', 'sans-serif']
}); 
*/ 
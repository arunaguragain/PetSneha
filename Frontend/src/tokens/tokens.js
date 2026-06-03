export const colors = {
  primary: {
    50: '#EEF4FF',
    100: '#DCE8FF',
    200: '#B9D0FF',
    300: '#89B2FF',
    400: '#4F8BFF',
    500: '#246BFF',
    600: '#0046CE',
    700: '#0038A6',
    800: '#002A7D',
    900: '#001C54',
  },
  neutral: {
    50: '#F7F9FB',
    100: '#EEF2F6',
    200: '#DDE4EA',
    300: '#C7D2DC',
    400: '#95A3B1',
    500: '#6D7B89',
    600: '#485767',
    700: '#30404E',
    800: '#1B2833',
    900: '#0D141B',
  },
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#B41A1A',
  white: '#FFFFFF',
};

export const typography = {
  display: 'Literata',
  body: 'Plus Jakarta Sans',
  sizes: {
    displayLg: '48px',
    headingXl: '32px',
    headingLg: '26px',
    bodyLg: '18px',
    bodyMd: '16px',
    labelLg: '14px',
    caption: '11px',
  },
};

export const spacing = {
  4: '16px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

export const radii = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '28px',
  pill: '999px',
};

export const shadows = {
  card: '0 12px 32px rgba(13, 20, 27, 0.08)',
  lift: '0 18px 40px rgba(13, 20, 27, 0.12)',
  surface: '0 1px 2px rgba(13, 20, 27, 0.06)',
};

export const layout = {
  navbarHeight: 64,
  appMaxWidth: 1240,
};

export const tokens = {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  layout,
};

export default tokens;

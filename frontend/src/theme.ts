import { createTheme } from '@mui/material/styles';

/**
 * Reproduces the shadcn/ui "neutral" design tokens from src/styles/global.css
 * (the oklch custom properties on :root) so introducing MUI's ThemeProvider
 * causes no visible change. Hex values are the exact sRGB equivalents of
 * Tailwind v4's neutral scale, which those oklch tokens are defined from:
 *   oklch(1 0 0)     = #ffffff
 *   oklch(0.985 0 0) = #fafafa  (neutral-50)
 *   oklch(0.97 0 0)  = #f5f5f5  (neutral-100)
 *   oklch(0.922 0 0) = #e5e5e5  (neutral-200)
 *   oklch(0.87 0 0)  = #d4d4d4  (neutral-300)
 *   oklch(0.708 0 0) = #a3a3a3  (neutral-400)
 *   oklch(0.556 0 0) = #737373  (neutral-500)
 *   oklch(0.439 0 0) = #525252  (neutral-600)
 *   oklch(0.371 0 0) = #404040  (neutral-700)
 *   oklch(0.269 0 0) = #262626  (neutral-800)
 *   oklch(0.205 0 0) = #171717  (neutral-900)
 *   oklch(0.145 0 0) = #0a0a0a  (neutral-950)
 * --destructive: oklch(0.577 0.245 27.325) = #dc2626 (Tailwind red-600)
 *
 * The actual rendered body font is the "Inter" stack, not Geist: an
 * unlayered `:root { font-family: Inter... }` rule in global.css beats the
 * layered `html { @apply font-sans }` (Geist) rule regardless of source
 * order, since unlayered CSS always wins over anything inside `@layer`.
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff', // --background
      paper: '#ffffff', // --card / --popover
    },
    text: {
      primary: '#0a0a0a', // --foreground
      secondary: '#737373', // --muted-foreground
    },
    primary: {
      main: '#171717', // --primary
      contrastText: '#fafafa', // --primary-foreground
    },
    secondary: {
      main: '#f5f5f5', // --secondary / --muted / --accent
      contrastText: '#171717', // --secondary-foreground
    },
    error: {
      main: '#dc2626', // --destructive
    },
    divider: '#e5e5e5', // --border / --input
  },
  shape: {
    borderRadius: 10, // --radius: 0.625rem
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    // MUI's contained Button defaults to uppercase text + a drop shadow;
    // the current design is flat, sentence-case, and semibold.
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    // Match the existing badge weight (the old CSS pill used font-weight: 700).
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
        label: { fontWeight: 700 },
      },
    },
  },
});

export default theme;

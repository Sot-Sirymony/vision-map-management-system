import { createTheme } from '@mui/material/styles';

/**
 * Fluent 2 design tokens (Microsoft's Fluent Design System). Values match
 * Fluent's own published tokens rather than an invented palette — see
 * global.css's :root block for the same values as plain CSS custom
 * properties (used by a handful of non-MUI elements).
 *   --primary        #0078d4  Communication Blue (brand)
 *   --primary hover  #106ebe
 *   --primary pressed #005a9e
 *   --primary tint   #deecf9
 *   neutralForeground1 #242424  (body text)
 *   neutralForeground2 #616161  (secondary text)
 *   neutralStroke      #e1e1e1  (borders)
 *   neutralBackground3 #f5f5f5  (recessed panels, table headers)
 *   destructive        #d13438  Fluent "Danger"
 *
 * Font: Segoe UI Variable is Fluent's signature face. An unlayered
 * `:root { font-family: ... }` rule in global.css is what actually renders
 * (it beats the layered Tailwind `font-sans` class regardless of source
 * order, since unlayered CSS always wins over anything inside `@layer`) —
 * kept in sync with the stack below.
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff', // --background
      paper: '#ffffff', // --card / --popover
    },
    text: {
      primary: '#242424', // --foreground (Fluent neutralForeground1)
      secondary: '#616161', // --muted-foreground (Fluent neutralForeground2)
    },
    primary: {
      main: '#0078d4', // --primary (Fluent Communication Blue)
      dark: '#005a9e', // pressed
      light: '#106ebe', // hover
      contrastText: '#ffffff', // --primary-foreground
    },
    secondary: {
      main: '#f5f5f5', // --secondary / --muted (Fluent neutralBackground3)
      contrastText: '#242424', // --secondary-foreground
    },
    error: {
      main: '#d13438', // --destructive (Fluent Danger)
    },
    divider: '#e1e1e1', // --border / --input (Fluent neutralStroke)
  },
  shape: {
    borderRadius: 4, // --radius: Fluent's 4px corner radius
  },
  typography: {
    fontFamily: '"Segoe UI Variable", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif',
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
    // MUI's Chip has its own hardcoded pill radius (~16px) that doesn't
    // follow theme.shape.borderRadius — override it directly so badges get
    // Fluent's flatter 4px corners instead of a Material-style pill.
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700, borderRadius: 4 },
        label: { fontWeight: 700 },
      },
    },
    // MUI's default Card elevation is a generic Material drop-shadow. Fluent
    // cards instead pair a thin neutral-stroke border with its own shadow
    // scale (--shadow-4 from global.css) — elevation is disabled here so
    // that shadow doesn't stack on top of this one.
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #e1e1e1',
          boxShadow: '0 1.6px 3.6px rgba(0,0,0,0.10), 0 0.3px 0.9px rgba(0,0,0,0.06)',
        },
      },
    },
    // Dialog defaults to MUI's heaviest Material elevation (24) — replaced
    // with Fluent's own top elevation tier (--shadow-16), since a modal is
    // the most "raised" surface in the app and should read as clearly above
    // everything else, not just have a bigger version of the Card shadow.
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0 6.4px 14.4px rgba(0,0,0,0.13), 0 1.2px 3.6px rgba(0,0,0,0.08)',
        },
      },
    },
    // Fluent's focus indicator is a visible outer ring around the whole
    // control, not just a thicker border — MUI's default focus behavior
    // already colors the border via palette.primary, so this adds the ring
    // on top rather than replacing it. Covers both TextField and Select,
    // since outlined Select renders through OutlinedInput internally.
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            outline: '2px solid #0078d4',
            outlineOffset: '1px',
          },
        },
      },
    },
  },
});

export default theme;

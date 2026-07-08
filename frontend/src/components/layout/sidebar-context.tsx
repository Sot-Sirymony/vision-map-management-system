import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

type SidebarContextValue = {
  /** Whether the desktop rail is expanded (icon-only when false). */
  open: boolean;
  /** Whether the mobile overlay drawer is open. */
  mobileOpen: boolean;
  isMobile: boolean;
  /** Expands/collapses the desktop rail, or opens/closes the mobile drawer, whichever applies. */
  toggle: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarStateProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const value = useMemo<SidebarContextValue>(() => ({
    open,
    mobileOpen,
    isMobile,
    toggle: () => {
      if (isMobile) {
        setMobileOpen((current) => !current);
      } else {
        setOpen((current) => !current);
      }
    },
    closeMobile: () => setMobileOpen(false),
  }), [open, mobileOpen, isMobile]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarState must be used within a SidebarStateProvider');
  }
  return context;
}

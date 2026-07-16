import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { accentOptions, buildTheme, type AccentId, type Density } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large';

export type ThemeSettings = {
  mode: ThemeMode;
  accent: AccentId;
  density: Density;
  fontSize: FontSize;
};

const STORAGE_KEY = 'vms-theme-settings';
// Pre-FR-18 key that held only 'light' | 'dark'; migrated on first load.
const LEGACY_MODE_KEY = 'vms-theme-mode';

const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'system',
  accent: 'blue',
  density: 'comfortable',
  fontSize: 'medium',
};

type ThemeSettingsContextValue = {
  settings: ThemeSettings;
  /** The mode actually in effect — 'system' resolved against the OS preference. */
  resolvedMode: 'light' | 'dark';
  update: (changes: Partial<ThemeSettings>) => void;
};

const ThemeSettingsContext = createContext<ThemeSettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  resolvedMode: 'light',
  update: () => undefined,
});

function initialSettings(): ThemeSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<ThemeSettings>;
      return {
        mode: parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'system' ? parsed.mode : DEFAULT_SETTINGS.mode,
        accent: parsed.accent && parsed.accent in accentOptions ? parsed.accent : DEFAULT_SETTINGS.accent,
        density: parsed.density === 'compact' ? 'compact' : 'comfortable',
        fontSize: parsed.fontSize === 'small' || parsed.fontSize === 'large' ? parsed.fontSize : 'medium',
      };
    }
    const legacyMode = localStorage.getItem(LEGACY_MODE_KEY);
    if (legacyMode === 'light' || legacyMode === 'dark') {
      return { ...DEFAULT_SETTINGS, mode: legacyMode };
    }
  } catch {
    // Corrupted storage — fall through to defaults.
  }
  return DEFAULT_SETTINGS;
}

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * Owns the appearance settings (FR-18): mode (Light / Dark / System, where
 * System tracks the OS preference live), accent color, density, and font
 * size. Everything persists per browser and is exposed three ways — the MUI
 * theme for components, data attributes on <html> for global.css, and the
 * accent's CSS variables so non-MUI styles use the same ramp.
 */
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>(initialSettings);
  const [osPrefersDark, setOsPrefersDark] = useState(systemPrefersDark);

  const resolvedMode: 'light' | 'dark' =
    settings.mode === 'system' ? (osPrefersDark ? 'dark' : 'light') : settings.mode;

  // FR-18.2: System mode follows OS changes live, without a reload.
  useEffect(() => {
    if (settings.mode !== 'system' || !window.matchMedia) {
      return;
    }
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => setOsPrefersDark(event.matches);
    query.addEventListener('change', onChange);
    setOsPrefersDark(query.matches);
    return () => query.removeEventListener('change', onChange);
  }, [settings.mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    const root = document.documentElement;
    root.dataset.theme = resolvedMode;
    root.dataset.density = settings.density;
    root.dataset.fontsize = settings.fontSize;
    // The accent's CSS variables (FR-18.3). Inline custom properties win over
    // both the :root defaults and the [data-theme="dark"] block, so the
    // chosen ramp applies in either mode.
    const accent = accentOptions[settings.accent][resolvedMode];
    root.style.setProperty('--primary', accent.main);
    root.style.setProperty('--primary-foreground', accent.contrastText);
    root.style.setProperty('--ring', accent.main);
    root.style.setProperty('--accent', accent.tint);
    root.style.setProperty('--accent-foreground', accent.tintForeground);
    root.style.setProperty('--sidebar-primary', accent.main);
    root.style.setProperty('--sidebar-primary-foreground', accent.contrastText);
    root.style.setProperty('--sidebar-accent', accent.tint);
    root.style.setProperty('--sidebar-accent-foreground', accent.tintForeground);
    root.style.setProperty('--sidebar-ring', accent.main);
  }, [settings, resolvedMode]);

  const theme = useMemo(
    () => buildTheme(resolvedMode, settings.accent, settings.density),
    [resolvedMode, settings.accent, settings.density],
  );

  const value = useMemo<ThemeSettingsContextValue>(
    () => ({
      settings,
      resolvedMode,
      update: (changes) => setSettings((current) => ({ ...current, ...changes })),
    }),
    [settings, resolvedMode],
  );

  return (
    <ThemeSettingsContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettings() {
  return useContext(ThemeSettingsContext);
}

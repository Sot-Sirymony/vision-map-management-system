import { useState } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { accentOptions, type AccentId, type Density } from '../../theme';
import { useThemeSettings, type FontSize, type ThemeMode } from '../../context/ThemeModeContext';

const MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

/**
 * The Appearance settings in one place (FR-18.6): mode, accent, density, and
 * font size. Choices apply instantly and persist per browser.
 */
export function AppearanceMenu() {
  const { settings, resolvedMode, update } = useThemeSettings();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const ModeIcon = settings.mode === 'system' ? Monitor : settings.mode === 'dark' ? Moon : Sun;

  function check(active: boolean) {
    return <ListItemIcon sx={{ minWidth: 28 }}>{active && <Check size={16} />}</ListItemIcon>;
  }

  return (
    <>
      <Tooltip title="Appearance">
        <IconButton onClick={(event) => setAnchor(event.currentTarget)} aria-label="Appearance settings" size="small">
          <ModeIcon size={18} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={{ list: { dense: true } }}>
        <ListSubheader sx={{ lineHeight: '30px', bgcolor: 'transparent' }}>Mode</ListSubheader>
        {MODE_OPTIONS.map((option) => (
          <MenuItem key={option.value} onClick={() => update({ mode: option.value })}>
            {check(settings.mode === option.value)}
            {option.label}
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader sx={{ lineHeight: '30px', bgcolor: 'transparent' }}>Accent</ListSubheader>
        <Box sx={{ display: 'flex', gap: 1, px: 2, py: 0.5 }}>
          {(Object.keys(accentOptions) as AccentId[]).map((accentId) => {
            const swatch = accentOptions[accentId][resolvedMode];
            const selected = settings.accent === accentId;
            return (
              <Tooltip title={accentOptions[accentId].label} key={accentId}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => update({ accent: accentId })}
                  aria-label={`${accentOptions[accentId].label} accent`}
                  aria-pressed={selected}
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    bgcolor: swatch.main,
                    border: '2px solid',
                    borderColor: selected ? 'text.primary' : 'transparent',
                    padding: 0,
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
        <Divider sx={{ mt: 1 }} />
        <ListSubheader sx={{ lineHeight: '30px', bgcolor: 'transparent' }}>Density</ListSubheader>
        {DENSITY_OPTIONS.map((option) => (
          <MenuItem key={option.value} onClick={() => update({ density: option.value })}>
            {check(settings.density === option.value)}
            {option.label}
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader sx={{ lineHeight: '30px', bgcolor: 'transparent' }}>Text size</ListSubheader>
        {FONT_SIZE_OPTIONS.map((option) => (
          <MenuItem key={option.value} onClick={() => update({ fontSize: option.value })}>
            {check(settings.fontSize === option.value)}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

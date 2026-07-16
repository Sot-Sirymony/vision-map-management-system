import { useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import { navItems } from './nav-items';
import { useSidebarState } from './sidebar-context';
import { useThemeMode } from '../../context/ThemeModeContext';

function currentPageLabel(pathname: string) {
  const exact = navItems.find((item) => (item.to === '/' ? pathname === '/' : pathname === item.to));
  if (exact) {
    return exact.label;
  }
  const closest = navItems.find((item) => item.to !== '/' && pathname.startsWith(item.to));
  return closest?.label ?? 'Dashboard';
}

export function Header() {
  const location = useLocation();
  const { toggle } = useSidebarState();
  const { mode, toggleMode } = useThemeMode();

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
      <Toolbar sx={{ gap: 1.5, minHeight: '56px !important' }}>
        <IconButton onClick={toggle} aria-label="Toggle sidebar" edge="start" size="small">
          <PanelLeft size={18} />
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: 'center' }} />
        <Breadcrumbs separator="›" sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary">Vision Mapping</Typography>
          <Typography variant="body2" color="text.primary">{currentPageLabel(location.pathname)}</Typography>
        </Breadcrumbs>
        <IconButton
          onClick={toggleMode}
          aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          size="small"
        >
          {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

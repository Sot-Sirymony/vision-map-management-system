import { useState, type MouseEvent } from 'react';
import { MoreVertical } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

type RowActionsMenuProps = {
  onEdit: () => void;
  onArchive: () => void;
  label?: string;
};

export function RowActionsMenu({ onEdit, onArchive, label = 'Row actions' }: RowActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  function handleOpen(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label={label}>
        <MoreVertical size={16} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => { handleClose(); onEdit(); }}>Edit</MenuItem>
        <MenuItem onClick={() => { handleClose(); onArchive(); }}>Archive</MenuItem>
      </Menu>
    </>
  );
}

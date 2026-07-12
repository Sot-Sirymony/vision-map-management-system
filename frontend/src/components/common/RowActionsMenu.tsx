import { useState, type MouseEvent } from 'react';
import { MoreVertical } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ConfirmDialog } from './ConfirmDialog';

const DEFAULT_CONFIRM_MESSAGE = 'Archive this record? You can bring it back later with "Show archived".';

type RowActionsMenuProps = {
  onEdit: () => void;
  onArchive: () => void;
  /** When set and `archived` is true, the menu offers Restore instead of Edit/Archive. */
  onRestore?: () => void;
  archived?: boolean;
  /**
   * Confirmation text shown before archiving. A function may fetch it lazily
   * (e.g. cascade counts from the archive-impact endpoint). Falls back to a
   * generic message.
   */
  confirmArchive?: string | (() => Promise<string>);
  label?: string;
};

export function RowActionsMenu({ onEdit, onArchive, onRestore, archived = false, confirmArchive, label = 'Row actions' }: RowActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  function handleOpen(event: MouseEvent<HTMLElement>) {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  async function handleArchiveClick() {
    handleClose();
    if (typeof confirmArchive === 'function') {
      // Show the dialog immediately with the fallback text, then swap in the
      // fetched message so a slow impact call never blocks the dialog.
      setConfirmMessage(DEFAULT_CONFIRM_MESSAGE);
      try {
        setConfirmMessage(await confirmArchive());
      } catch {
        // Keep the fallback message if the impact fetch fails.
      }
    } else {
      setConfirmMessage(confirmArchive ?? DEFAULT_CONFIRM_MESSAGE);
    }
  }

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label={label}>
        <MoreVertical size={16} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {archived && onRestore ? (
          <MenuItem onClick={() => { handleClose(); onRestore(); }}>Restore</MenuItem>
        ) : ([
          <MenuItem key="edit" onClick={() => { handleClose(); onEdit(); }}>Edit</MenuItem>,
          <MenuItem key="archive" onClick={() => void handleArchiveClick()}>Archive</MenuItem>,
        ])}
      </Menu>
      {confirmMessage !== null && (
        <ConfirmDialog
          title="Confirm archive"
          message={confirmMessage}
          confirmLabel="Archive"
          onConfirm={() => { setConfirmMessage(null); onArchive(); }}
          onClose={() => setConfirmMessage(null)}
        />
      )}
    </>
  );
}

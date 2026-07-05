import type { FormEvent, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from './Button';
import { Modal } from './Modal';

type CrudModalFormProps = {
  editing: boolean;
  createLabel: string;
  editTitle: string;
  saving: boolean;
  disabled?: boolean;
  extraActions?: ReactNode;
  onSubmit: (event: FormEvent) => void;
  onCancelEdit: () => void;
  children: ReactNode;
};

/**
 * The create-panel/edit-modal scaffold repeated across every CRUD page:
 * an inline panel with a "Create X" button when nothing is being edited,
 * or the same fields inside a Modal with Save/Cancel when editing.
 * `extraActions` renders before the submit button, for pages with an extra
 * action (e.g. Communication's "Generate message").
 */
export function CrudModalForm({
  editing,
  createLabel,
  editTitle,
  saving,
  disabled,
  extraActions,
  onSubmit,
  onCancelEdit,
  children,
}: CrudModalFormProps) {
  if (!editing) {
    return (
      <Card>
        <CardContent>
          <form className="form-grid" onSubmit={onSubmit}>
            {children}
            <div className="field-full row-actions">
              {extraActions}
              <Button type="submit" disabled={saving || disabled}>{saving ? 'Saving...' : createLabel}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Modal title={editTitle} onClose={onCancelEdit}>
      <form className="form-grid" onSubmit={onSubmit}>
        {children}
        <div className="field-full row-actions">
          {extraActions}
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          <Button type="button" variant="secondary" onClick={onCancelEdit}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}

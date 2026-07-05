import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders the title and children', () => {
    render(
      <Modal title="Edit Thing" onClose={vi.fn()}>
        <p>Modal body</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Edit Thing' })).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('closes when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Edit Thing" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );

    await user.click(document.querySelector('[data-slot="dialog-overlay"]')!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when content inside the modal is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Edit Thing" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );

    await user.click(screen.getByText('Modal body'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Edit Thing" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes via the built-in close button', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal title="Edit Thing" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

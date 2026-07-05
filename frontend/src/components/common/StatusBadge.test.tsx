import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders readable status text', () => {
    render(<StatusBadge status="IN_PROGRESS" />);

    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
  });
});

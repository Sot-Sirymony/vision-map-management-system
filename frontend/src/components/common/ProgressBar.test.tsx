import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders the progress label', () => {
    render(<ProgressBar value={45} />);

    expect(screen.getByLabelText('Progress 45%')).toBeInTheDocument();
  });

  it('clamps progress above 100', () => {
    render(<ProgressBar value={130} />);

    expect(screen.getByLabelText('Progress 100%')).toBeInTheDocument();
  });
});

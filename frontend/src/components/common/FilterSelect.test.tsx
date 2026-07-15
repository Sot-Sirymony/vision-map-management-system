import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterSelect, type FilterOption } from './FilterSelect';

function options(count: number): FilterOption[] {
  return Array.from({ length: count }, (_, i) => ({ value: String(i), label: `Option ${i}` }));
}

describe('FilterSelect', () => {
  it('is always a type-to-search box, even for a short list', () => {
    render(<FilterSelect label="Priority" value="" onChange={() => {}} options={options(4)} />);

    expect(screen.getByRole('combobox')).toHaveAttribute('type', 'text');
  });

  it('narrows the list as you type and reports the picked value', async () => {
    const onChange = vi.fn();
    render(<FilterSelect label="Dream" value="" onChange={onChange} options={options(20)} allLabel="All" />);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Option 17');
    await userEvent.click(await screen.findByText('Option 17'));

    expect(onChange).toHaveBeenCalledWith('17');
  });

  it('clearing the box means no filter', async () => {
    const onChange = vi.fn();
    render(<FilterSelect label="Dream" value="17" onChange={onChange} options={options(20)} allLabel="All" />);

    await userEvent.click(screen.getByLabelText('Clear'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});

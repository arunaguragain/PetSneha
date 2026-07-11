import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../src/components/ui';

describe('StarRating', () => {
  it('calls onChange when a star is clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={0} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('button', { name: /rate 4 stars/i }));

    expect(handleChange).toHaveBeenCalledWith(4);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordToggleButton } from '../src/components/PasswordToggle';

describe('PasswordToggleButton', () => {
  it('calls onToggle when clicked', () => {
    const handleToggle = vi.fn();
    render(<PasswordToggleButton isVisible={false} onToggle={handleToggle} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});

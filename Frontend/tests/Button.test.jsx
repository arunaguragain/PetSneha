import { render, screen } from '@testing-library/react';
import { Button } from '../src/components/ui';

describe('Button', () => {
  it('renders children and loading state', () => {
    render(<Button loading>Save</Button>);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Save');
  });
});

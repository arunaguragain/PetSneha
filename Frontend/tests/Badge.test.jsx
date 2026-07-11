import { render, screen } from '@testing-library/react';
import { Badge } from '../src/components/ui';

describe('Badge', () => {
  it('renders its text content', () => {
    render(<Badge variant="primary">Verified</Badge>);

    expect(screen.getByText('Verified')).toBeInTheDocument();
  });
});

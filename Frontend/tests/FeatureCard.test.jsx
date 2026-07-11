import { render, screen } from '@testing-library/react';
import FeatureCard from '../src/components/landing/FeatureCard';

describe('FeatureCard', () => {
  it('renders the title and description', () => {
    render(<FeatureCard title="Secure records" description="Keep pet history safe." icon="records" tone="green" />);

    expect(screen.getByText('Secure records')).toBeInTheDocument();
    expect(screen.getByText('Keep pet history safe.')).toBeInTheDocument();
  });
});

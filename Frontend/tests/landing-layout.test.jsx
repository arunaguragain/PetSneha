import { render, screen } from '@testing-library/react';
import FeatureCard from '../src/components/landing/FeatureCard';
import SectionHeading from '../src/components/landing/SectionHeading';

describe('landing section primitives', () => {
  it('renders the feature card title and description', () => {
    render(<FeatureCard title="Secure records" description="Keep pet history safe." icon="records" tone="green" />);

    expect(screen.getByText('Secure records')).toBeInTheDocument();
    expect(screen.getByText('Keep pet history safe.')).toBeInTheDocument();
  });

  it('renders the section heading content', () => {
    render(
      <SectionHeading
        eyebrow="Why PetSneha"
        title="Care for every paw"
        description="Built for pet parents and vets."
      />
    );

    expect(screen.getByText('Why PetSneha')).toBeInTheDocument();
    expect(screen.getByText('Care for every paw')).toBeInTheDocument();
    expect(screen.getByText('Built for pet parents and vets.')).toBeInTheDocument();
  });
});

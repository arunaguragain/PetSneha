import { render, screen } from '@testing-library/react';
import SectionHeading from '../src/components/landing/SectionHeading';

describe('SectionHeading', () => {
  it('renders eyebrow, title, and description', () => {
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

import { render, screen } from '@testing-library/react';
import { Button, Card, Avatar, IconBox, Input, Textarea, Select, Badge, Chip } from '../src/components/ui';

describe('shared UI primitives', () => {
  it('renders a button with its label and primary classes', () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
  });

  it('renders a loading button in a disabled waiting state', () => {
    render(<Button loading>Saving</Button>);

    const button = screen.getByRole('button', { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-wait');
  });

  it('renders card content and extra classes', () => {
    render(
      <Card data-testid="info-card" className="custom-card">
        Profile
      </Card>
    );

    const card = screen.getByTestId('info-card');
    expect(card).toHaveTextContent('Profile');
    expect(card).toHaveClass('custom-card');
  });

  it('shows initials when no image is supplied', () => {
    render(<Avatar name="Jane Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders an image avatar when a source is provided', () => {
    render(<Avatar name="Alex Kim" src="/avatar.png" alt="Alex" />);

    expect(screen.getByAltText('Alex')).toBeInTheDocument();
  });

  it('renders icon box children inside the expected wrapper', () => {
    render(
      <IconBox>
        <span>icon</span>
      </IconBox>
    );

    expect(screen.getByText('icon')).toBeInTheDocument();
  });

  it('renders input labels and helper text', () => {
    render(<Input label="Email" hint="Use your work email" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Use your work email')).toBeInTheDocument();
  });

  it('renders validation errors for input fields', () => {
    render(<Input label="Phone" error="Required" />);

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders textarea content and label', () => {
    render(<Textarea label="Notes" defaultValue="Hello" />);

    expect(screen.getByLabelText('Notes')).toHaveValue('Hello');
  });

  it('renders select options and labels', () => {
    render(
      <Select label="Role">
        <option value="owner">Owner</option>
        <option value="vet">Vet</option>
      </Select>
    );

    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Owner' })).toBeInTheDocument();
  });

  it('renders badge content with variant class', () => {
    render(<Badge variant="primary">Verified</Badge>);

    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toHaveClass('badge-primary');
  });

  it('renders a chip as a button when requested', () => {
    render(<Chip>All</Chip>);

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
  });
});

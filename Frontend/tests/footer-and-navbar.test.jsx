import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../src/components/Footer';
import Navbar from '../src/components/Navbar';
import { vi } from 'vitest';

const mockUseAuth = vi.fn();
const mockUseToast = vi.fn();
const mockUpdateLanguage = vi.fn();

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../src/context/ToastContext', () => ({
  useToast: () => ({ addToast: mockUseToast }),
}));

vi.mock('../src/api/user.api', () => ({
  updateLanguage: (...args) => mockUpdateLanguage(...args),
}));

vi.mock('../src/api/pet.api', () => ({
  getPets: vi.fn().mockResolvedValue({ data: { pets: [] } }),
}));

describe('layout shell components', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockUseToast.mockReset();
    mockUpdateLanguage.mockReset();
    mockUseAuth.mockReturnValue({
      user: { name: 'Nina', email: 'nina@test.com', role: 'petOwner' },
      role: 'petOwner',
      logout: () => '/login',
    });
  });

  it('renders footer links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders navbar branding and allows a language toggle click', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('EN'));
    expect(mockUpdateLanguage).toHaveBeenCalled();
  });
});

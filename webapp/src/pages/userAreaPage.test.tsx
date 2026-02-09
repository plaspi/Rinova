import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UserAreaPage from './UserAreaPage';
import { SidebarProvider } from '@/components/sidebar/sidebarLayout';
import { BrowserRouter } from 'react-router-dom';

// --- MOCKS ---
// We mock the complex sub-components to keep this test focused on the Page layout
vi.mock('@/components/user-area/userAvatarCard', () => ({
  UserAvatarCard: () => <div data-testid="avatar-card">Avatar Card</div>
}));

vi.mock('@/components/user-area/userProfileForm', () => ({
  UserProfileForm: () => <div data-testid="profile-form">Profile Form</div>
}));

vi.mock('@/components/user-area/userPasswordForm', () => ({
  UserPasswordForm: () => <div data-testid="password-form">Password Form</div>
}));

vi.mock('@/context/authContext', () => ({
  useAuth: () => ({ user: { id: '123' }, isPro: true }),
}));

// Mock ModeToggle
vi.mock('@/components/modeToggle', () => ({
  ModeToggle: () => <div />
}));

const renderPage = () => render(
  <BrowserRouter>
    <SidebarProvider>
      <UserAreaPage />
    </SidebarProvider>
  </BrowserRouter>
);

describe('UserAreaPage', () => {
  it('renders all sections correctly', () => {
    renderPage();

    expect(screen.getByText('Impostazioni Profilo')).toBeInTheDocument();
    
    // Check if sub-components are present
    expect(screen.getByTestId('avatar-card')).toBeInTheDocument();
    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    expect(screen.getByTestId('password-form')).toBeInTheDocument();
  });
});
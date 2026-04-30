import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from './LandingPage';
import * as authContext from '@/context/authContext';

vi.mock('@/context/authContext');

vi.mock('@/components/ui/button', () => ({
    // Rimuoviamo variant, size e asChild dai props passati al DOM per evitare warning di React
    Button: ({ children, onClick, variant, size, asChild, ...props }: any) => (
        <button onClick={onClick} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/avatar', () => ({
    Avatar: ({ children, ...props }: any) => <div data-testid="avatar" {...props}>{children}</div>,
    AvatarImage: ({ src }: any) => <img src={src} alt="avatar" />,
    AvatarFallback: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => (
        <button onClick={onClick}>{children}</button>
    ),
    DropdownMenuSeparator: () => <hr />,
}));

vi.mock('@/components/rinova-logo', () => ({
    RinovaLogo: (props: any) => <div data-testid="rinova-logo" {...props} />,
}));

vi.mock('@/components/modals/termsModal', () => ({
    TermsOfServiceModal: ({ children }: any) => <div>{children}</div>,
    PrivacyPolicyModal: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/modeToggle', () => ({
    ModeToggle: () => <div data-testid="mode-toggle" />,
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: any) => <textarea {...props} />,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('LandingPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(document, 'getElementById').mockReturnValue(null);
        vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    });

    const renderLandingPage = (user = null, profile = null) => {
        vi.mocked(authContext.useAuth).mockReturnValue({
            user,
            profile,
            login: vi.fn(),
            logout: vi.fn(),
            register: vi.fn(),
        } as any);

        return render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        );
    };

    it('should render without crashing', () => {
        renderLandingPage();
        expect(screen.getAllByTestId('rinova-logo').length).toBeGreaterThan(0);
    });

    it('should display Rinova Energy branding', () => {
        renderLandingPage();
        // Usiamo getAllByText perché il brand appare in Navbar, Hero e Footer
        expect(screen.getAllByText(/Rinova/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Energy/i).length).toBeGreaterThan(0);
    });

    it('should render navbar with navigation links', () => {
        renderLandingPage();
        expect(screen.getByText('Piattaforma')).toBeInTheDocument();
        expect(screen.getByText('Roadmap')).toBeInTheDocument();
        expect(screen.getByText('Chi Siamo')).toBeInTheDocument();
        expect(screen.getByText('Piani')).toBeInTheDocument();
        expect(screen.getByText('Contatti')).toBeInTheDocument();
    });

    it('should render hero section heading', () => {
        renderLandingPage();
        expect(screen.getAllByText(/L'ecosistema digitale/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Comunità Energetiche Rinnovabili/i).length).toBeGreaterThan(0);
    });

    it('should render explore and contact buttons', () => {
        renderLandingPage();
        expect(screen.getByText(/Esplora la Piattaforma/i)).toBeInTheDocument();
        expect(screen.getByText(/Parla con Noi/i)).toBeInTheDocument();
    });

    it('should navigate to login when explore button is clicked', async () => {
        const user = userEvent.setup();
        renderLandingPage();
        const exploreButton = screen.getByText(/Esplora la Piattaforma/i);
        await user.click(exploreButton);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should show avatar with leaf icon when user is not logged in', () => {
        renderLandingPage();
        expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should show user profile in dropdown when user is logged in', () => {
        const mockUser = { id: '1', email: 'test@example.com' } as any;
        const mockProfile = { name: 'John', surname: 'Doe', avatar_url: 'https://example.com/avatar.jpg' } as any;
        renderLandingPage(mockUser, mockProfile);
        
        // Verifica che il nome concatenato sia presente (John Doe)
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    it('should render platform features section', () => {
        renderLandingPage();
        expect(screen.getByText(/Un unico motore/i)).toBeInTheDocument();
        expect(screen.getByText(/Gestione Asset/i)).toBeInTheDocument();
        expect(screen.getByText(/Network CER/i)).toBeInTheDocument();
    });

    it('should render roadmap section with cards', () => {
        renderLandingPage();
        expect(screen.getByText(/Visione 2026/i)).toBeInTheDocument();
        expect(screen.getByText(/AI Forecasting/i)).toBeInTheDocument();
        expect(screen.getByText(/Smart Grid Integration/i)).toBeInTheDocument();
        expect(screen.getByText(/App Mobile Nativa/i)).toBeInTheDocument();
    });

    it('should render about section', () => {
        renderLandingPage();
        expect(screen.getByText(/Perché Rinova?/i)).toBeInTheDocument();
        expect(screen.getByText(/100%/)).toBeInTheDocument();
        expect(screen.getByText(/99.9%/)).toBeInTheDocument();
    });

    it('should render pricing section with Basic and Pro plans', () => {
        renderLandingPage();
        expect(screen.getAllByText('Basic').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Rinova Pro/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Gratis/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/€5/).length).toBeGreaterThan(0);
    });

    it('should render contact section', () => {
        renderLandingPage();
        expect(screen.getByText(/Pronto alla rivoluzione?/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Nome')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Come possiamo aiutarti?')).toBeInTheDocument();
    });

    it('should render footer with branding and links', () => {
        renderLandingPage();
        expect(screen.getByText(/© 2026 Rinova Energy/i)).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText('Termini di Servizio')).toBeInTheDocument();
    });

    it('should navigate to dashboard when user clicks dashboard menu item', async () => {
        const user = userEvent.setup();
        const mockUser = { id: '1', email: 'test@example.com' } as any;
        const mockProfile = { name: 'John', surname: 'Doe' } as any;
        renderLandingPage(mockUser, mockProfile);
        
        const dashboardItem = screen.getByText(/Vai alla Dashboard/i);
        await user.click(dashboardItem);
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('should navigate to registration when not logged in', async () => {
        const user = userEvent.setup();
        renderLandingPage();
        
        // Usiamo regex per bypassare l'icona affiancata al testo
        const registerItem = screen.getByText(/Registrati/i);
        await user.click(registerItem);
        expect(mockNavigate).toHaveBeenCalledWith('/registration');
    });

    it('should scroll to section when navigation link is clicked', async () => {
        const user = userEvent.setup();
        const mockElement = { scrollIntoView: vi.fn() };
        vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
        
        renderLandingPage();
        const platformLink = screen.getByText('Piattaforma');
        await user.click(platformLink);
        
        expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should render mode toggle component', () => {
        renderLandingPage();
        expect(screen.getByTestId('mode-toggle')).toBeInTheDocument();
    });
});
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import OnBoardingPage from "./OnBoardingPage";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/services/supabase_client";

// Mock dei contesti e moduli
vi.mock("@/context/authContext");
vi.mock("@/services/supabase_client", () => ({
    supabase: {
        from: vi.fn(),
    }
}));
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

const mockUser = {
    id: "test-user-id",
    user_metadata: { full_name: "John Doe" },
};

const mockProfile = {
    name: "John",
    surname: "Doe",
    ssn: "ABCD1234EFGH5678",
    street_name: "Via Roma",
    street_number: "123",
    city: "Milan",
    province: "MI",
};

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <OnBoardingPage />
        </BrowserRouter>
    );
};

describe("OnBoardingPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders form with all fields", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: mockUser, profile: {} } as any);
        const { container } = renderComponent();

        expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
        expect(container.querySelector('input[name="surname"]')).toBeInTheDocument();
        expect(container.querySelector('input[name="ssn"]')).toBeInTheDocument();
        expect(container.querySelector('input[name="street_name"]')).toBeInTheDocument();
        expect(container.querySelector('input[name="street_number"]')).toBeInTheDocument();
        expect(container.querySelector('input[name="city"]')).toBeInTheDocument();
        expect(container.querySelector('input[name="province"]')).toBeInTheDocument();
        
        // Aspettiamo che il form si stabilizzi per evitare i warning act(...) in console
        await waitFor(() => expect(screen.getByRole("button", { name: /Completa Registrazione/i })).toBeInTheDocument());
    });

    it("displays validation errors for empty fields", async () => {
        vi.mocked(useAuth).mockReturnValue({ user: { id: "test-user-id"}, profile: {} } as any);
        renderComponent();

        // Simuliamo il click sul bottone Submit per far apparire gli errori di Zod!
        fireEvent.click(screen.getByRole("button", { name: /Completa Registrazione/i }));

        await waitFor(() => {
            expect(screen.getByText(/Inserisci un nome valido/i)).toBeInTheDocument();
            expect(screen.getByText(/Inserisci un cognome valido/i)).toBeInTheDocument();
        });
    });

    it("submits form with valid data", async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: null });
        vi.mocked(supabase.from).mockReturnValue({
            update: vi.fn().mockReturnValue({ eq: mockEq }),
        } as any);

        vi.mocked(useAuth).mockReturnValue({ user: mockUser, profile: {} } as any);
        const { container } = renderComponent();

        fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: "John" } });
        fireEvent.change(container.querySelector('input[name="surname"]')!, { target: { value: "Doe" } });
        fireEvent.change(container.querySelector('input[name="ssn"]')!, { target: { value: "ABCD1234EFGH5678" } });
        fireEvent.change(container.querySelector('input[name="street_name"]')!, { target: { value: "Via Roma" } });
        fireEvent.change(container.querySelector('input[name="street_number"]')!, { target: { value: "123" } });
        fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: "Milan" } });
        fireEvent.change(container.querySelector('input[name="province"]')!, { target: { value: "MI" } });

        fireEvent.click(screen.getByRole("button", { name: /Completa Registrazione/i }));

        await waitFor(() => {
            expect(mockEq).toHaveBeenCalledWith("id", "test-user-id");
        });
    });

    it("displays error message on submission failure", async () => {
        const mockEq = vi.fn().mockResolvedValue({ error: new Error("Errore di database") });
        vi.mocked(supabase.from).mockReturnValue({
            update: vi.fn().mockReturnValue({ eq: mockEq }),
        } as any);

        vi.mocked(useAuth).mockReturnValue({ user: mockUser, profile: {} } as any);
        const { container } = renderComponent();

        fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: "John" } });
        fireEvent.change(container.querySelector('input[name="surname"]')!, { target: { value: "Doe" } });
        fireEvent.change(container.querySelector('input[name="ssn"]')!, { target: { value: "ABCD1234EFGH5678" } });
        fireEvent.change(container.querySelector('input[name="street_name"]')!, { target: { value: "Via Roma" } });
        fireEvent.change(container.querySelector('input[name="street_number"]')!, { target: { value: "123" } });
        fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: "Milan" } });
        fireEvent.change(container.querySelector('input[name="province"]')!, { target: { value: "MI" } });

        fireEvent.click(screen.getByRole("button", { name: /Completa Registrazione/i }));

        await waitFor(() => {
            expect(screen.getByText(/Errore di database/i)).toBeInTheDocument();
        });
    });

    it("shows loading state during submission", async () => {
        const mockEq = vi.fn().mockImplementation(() => new Promise(() => {})); 
        vi.mocked(supabase.from).mockReturnValue({
            update: vi.fn().mockReturnValue({ eq: mockEq }),
        } as any);

        vi.mocked(useAuth).mockReturnValue({ user: mockUser, profile: {} } as any);
        const { container } = renderComponent();

        fireEvent.change(container.querySelector('input[name="name"]')!, { target: { value: "John" } });
        fireEvent.change(container.querySelector('input[name="surname"]')!, { target: { value: "Doe" } });
        fireEvent.change(container.querySelector('input[name="ssn"]')!, { target: { value: "ABCD1234EFGH5678" } });
        fireEvent.change(container.querySelector('input[name="street_name"]')!, { target: { value: "Via Roma" } });
        fireEvent.change(container.querySelector('input[name="street_number"]')!, { target: { value: "123" } });
        fireEvent.change(container.querySelector('input[name="city"]')!, { target: { value: "Milan" } });
        fireEvent.change(container.querySelector('input[name="province"]')!, { target: { value: "MI" } });

        fireEvent.click(screen.getByRole("button", { name: /Completa Registrazione/i }));

        await waitFor(() => {
            expect(screen.getByText(/Salvataggio in corso/i)).toBeInTheDocument();
        });
    });

    it("prefills form with profile data", async () => {
        vi.mocked(useAuth).mockReturnValue({
            user: mockUser,
            profile: mockProfile,
        } as any);

        const { container } = renderComponent();

        expect((container.querySelector('input[name="name"]') as HTMLInputElement).value).toBe("John");
        expect((container.querySelector('input[name="surname"]') as HTMLInputElement).value).toBe("Doe");
        
        // Aspettiamo per pulire l'event loop di Zod
        await waitFor(() => expect(screen.getByRole("button", { name: /Completa Registrazione/i })).toBeInTheDocument());
    });
});
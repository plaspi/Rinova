import { ThemeProvider } from '@/components/themeProvider';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from "@/Layout";
import HomePage  from '@/pages/homePage';
import LoginPage from '@/pages/LoginPage';
import RegistrationPage from '@/pages/RegistrationPage';
import OtpPage from '@/pages/OtpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import NewPasswordPage from '@/pages/NewPasswordPage';
import UserAreaPage from '@/pages/UserAreaPage';
import ProductionPage from '@/pages/ProductionPage';
import HistoryPage from '@/pages/ProductionHistoryPage';
import PlantsPage from '@/pages/PlantsPage';
import CerPage from '@/pages/CerPage';
import SettingsPage from '@/pages/SettingsPage';
import SupportPage from '@/pages/SupportPage';
import PlansPage from '@/pages/PlansPage';
import NotFound from '@/pages/NotFound';
import OnboardingPage from '@/pages/OnBoardingPage';
import LandingPage from '@/pages/LandingPage';
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute, useAuth } from "@/context/authContext"; // Aggiunto useAuth
import { SplashScreen } from "@/components/splashScreen"; // Importa la tua SplashScreen

function App() {
  const { user, isLoading } = useAuth(); // Estraiamo lo stato di autenticazione

  // Se l'app sta ancora verificando la sessione su Supabase, mostriamo il caricamento
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        {/* --- ROTTE PUBBLICHE --- */}
        
        {/* Se l'utente NON è loggato, la home è la LandingPage. Se è loggato, va in Dashboard */}
        <Route 
          path="/" 
          element={<LandingPage />} 
        />

        {/* Impediamo agli utenti già loggati di tornare alle pagine di Auth - ovviamente se logout le route sono permesse*/}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/home" replace />} />
        <Route path="/registration" element={!user ? <RegistrationPage /> : <Navigate to="/home" replace />} /> 
        <Route path="/forgotpw" element={<ForgotPasswordPage />} /> 
        <Route path="/otpverification" element={<OtpPage/>} /> 
        <Route path="/update-password" element={<NewPasswordPage/>} />

        {/* ROTTA ONBOARDING */}
        <Route path="/onboarding" element={ <ProtectedRoute><OnboardingPage /></ProtectedRoute>}/>

        {/* --- ROTTE PROTETTE --- */}
        {/* ProtectedRoute gestisce il redirect al login se un utente anonimo prova ad accedere */}
        <Route element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/production" element={<ProductionPage/>} />
          <Route path="/recap" element={<HistoryPage/>} />
          <Route path="/cer" element={<CerPage/>} />
          <Route path="/plants" element={<PlantsPage/>} />
          <Route path="/subscription" element={<PlansPage/>} />
          <Route path="/user-area" element={<UserAreaPage/>} /> 
          <Route path="/settings" element={<SettingsPage/>} />
          <Route path="/support" element={<SupportPage/>} />
        </Route>

        {/* Pagina 404 */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
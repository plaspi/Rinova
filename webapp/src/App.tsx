import { ThemeProvider } from '@/components/themeProvider';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from "./Layout";
import HomePage  from '@/pages/homePage';
import LoginPage from '@/pages/LoginPage';
import RegistrationPage from '@/pages/RegistrationPage';
import OtpPage from '@/pages/OtpPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import NewPasswordPage from '@/pages/NewPasswordPage';
import UserAreaPage from '@/pages/UserAreaPage';
import ProductionPage from '@/pages/ProductionPage';
import HistoryPage from './pages/ProductionHistoryPage';
import PlantsPage from '@/pages/PlantsPage';
import CerPage from '@/pages/CerPage';
import SettingsPage from '@/pages/SettingsPage';
import PlansPage from './pages/PlansPage';
import NotFound from '@/pages/NotFound';
import { Toaster } from "@/components/ui/sonner";
import { ProtectedRoute } from "@/context/authContext"; // Importo la protezione

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        {/* Rotte Pubbliche */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} /> 
        <Route path="/forgotpw" element={<ForgotPasswordPage />} /> 
        <Route path="/otpverification" element={<OtpPage/>} /> 
        <Route path="/update-password" element={<NewPasswordPage/>} />

        {/* Rotte Protette: Se l'utente non è loggato, ProtectedRoute lo manda al login */}
        <Route element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>}>
          <Route path='/' element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/production" element={<ProductionPage/>} />
          <Route path="/recap" element={<HistoryPage/>} />
          <Route path="/cer" element={<CerPage/>} />
          <Route path="/plants" element={<PlantsPage/>} />
          <Route path="/subscription" element={<PlansPage/>} />
          <Route path="/user-area" element={<UserAreaPage/>} /> 
          <Route path="/settings" element={<SettingsPage/>} />
        </Route>

        <Route path="*" element={<NotFound/>} />
      </Routes>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
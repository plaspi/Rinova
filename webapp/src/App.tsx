import { ThemeProvider } from '@/components/themeProvider'
import { Routes, Route, Navigate } from 'react-router-dom'
import  HomePage  from '@/pages/homePage'
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import { ForgotPasswordForm } from './components/forms/forgot-password-form';
import OTPPage from './pages/OtpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NewPasswordPage from './pages/NewPasswordPage';
import TablePage from './pages/TablePage';
import UserAreaPage from './pages/UserAreaPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route path='/' element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage/>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} /> 
        <Route path="/forgotpw" element={<ForgotPasswordPage />} /> 
        <Route path="/otpverification" element={<OtpPage/>} /> 
        <Route path="/newpw" element={<NewPasswordPage/>} /> 
        <Route path="/table" element={<TablePage/>} /> 
        <Route path="/user-area" element={<UserAreaPage/>} /> 

        {/* wrong redirect to wrongRoutePage */}
        // TODO: creare una pagina 404
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

import {ThemeProvider} from 'next-themes';
import { Routes, Route, Navigate } from 'react-router-dom';
//import HomePage from './HomePage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import { ForgotPasswordForm } from './components/forgot-password-form';
// import RegisterPage from './RegisterPage';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registration" element={<RegistrationPage />} /> 
        <Route path="forgotpw" element={<ForgotPasswordForm />} /> 
        {/* <Route path="register" element={<RegisterPage />} /> */}

        {/* wrong redirect to wrongRoutePage */}
        // TODO: creare una pagina 404
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

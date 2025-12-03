import { ThemeProvider } from '@/components/themeProvider'
import { Routes, Route, Navigate } from 'react-router-dom'
import  HomePage  from '@/pages/homePage'


function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Routes>
        <Route path='/' element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage/>}/>

        <Route path='*'>404 wrong page</Route>
        
      </Routes>
    </ThemeProvider>
  )
}

export default App

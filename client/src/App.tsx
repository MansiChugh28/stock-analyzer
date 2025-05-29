import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthGuard } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import StockDashboard from './components/StockDashboard';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import PortfolioStockDetail from './pages/PortfolioStockDetail';
import Layout from './components/Layout';
// import LoginPage from './components/Login';
// import RegisterPage from './components/Register';
// import ProfileDemo from './components/ProfileDemo';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Navigate to="/dashboard" replace />
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Layout>
                    <StockDashboard />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard/:symbol"
              element={
                <AuthGuard>
                  <Layout>
                    <StockDetail />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/portfolio"
              element={
                <AuthGuard>
                  <Layout>
                    <Portfolio />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/portfolio/:symbol"
              element={
                <AuthGuard>
                  <Layout>
                    <PortfolioStockDetail />
                  </Layout>
                </AuthGuard>
              }
            />
          </Routes>
          {/* <ProfileDemo/> */}
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

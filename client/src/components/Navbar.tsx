import {
  Box,
  Container,
  IconButton,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  ShowChart as ShowChartIcon,
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfilePopup from './userProfile';
import { styled } from '@mui/material/styles';

const GradientTypography = styled('h6')({
  background: 'linear-gradient(45deg, #6366f1 30%, #a855f7 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  margin: 0,
});

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        borderBottom: "1px solid #1e293b",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Container maxWidth="xl" sx={{ py: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ShowChartIcon sx={{ color: "#6366f1", fontSize: "2rem" }} />
                <GradientTypography variant="h2" ><h2>QuantumTrade</h2></GradientTypography>
              </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Dashboard">
              <IconButton
                color="inherit"
                onClick={() => navigate('/dashboard')}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <DashboardIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Portfolio">
              <IconButton
                color="inherit"
                onClick={() => navigate('/portfolio')}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <AccountBalanceIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Logout">
              <IconButton
                color="inherit"
                onClick={logout}
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#4f46e5" }}>
              <UserProfilePopup />
            </Avatar>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 
"use client"

import {
  Email as EmailIcon,
  Lock as LockIcon,
  TrendingUp as TrendingUpIcon,
  Visibility,
  VisibilityOff
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography
} from "@mui/material"
import { styled } from "@mui/material/styles"
import axios from 'axios'
import type React from "react"
import { useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Use VITE_AWS_API_URL for Vite projects
const API_URL = import.meta.env.VITE_AWS_API_URL

const LoginContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
}))

const LoginCard = styled(Paper)(({ theme }) => ({
  backgroundColor: "#1a1a2e",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  overflow: "hidden",
  width: "100%",
  maxWidth: 450,
}))

const LoginHeader = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  padding: theme.spacing(3),
  textAlign: "center",
}))




interface LoginError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

interface LoginResponse {
  token: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("test@gmail.com")
  const [password, setPassword] = useState("12345678")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, id, firstName, lastName } = response.data;
      
 

      // Call login function from AuthContext with user data
      login({
        token,
        id,
        email,
        firstName,
        lastName
      });

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const error = err as LoginError;
      setError(error.response?.data?.error || "Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginContainer>
      <LoginCard>
        <LoginHeader>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              QuantumTrade
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Log in to access your trading dashboard
          </Typography>
        </LoginHeader>

        <Box component="form" onSubmit={handleSubmit} sx={{ padding: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "#16213e",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334155",
                },
              },
            }}
            required
          />

          <TextField
            fullWidth
            label="Password"
            variant="outlined"
            margin="normal"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePassword}
                    edge="end"
                    sx={{ color: "text.secondary" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "#16213e",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#334155",
                },
              },
            }}
            required
          />

     

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              bgcolor: "#4f46e5",
              "&:hover": { bgcolor: "#4338ca" },
              py: 1.5,
              mt:2.5,
              mb: 2,
              position: "relative",
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Log In to Your Account"}
          </Button>

          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Don't have an account?{" "}
              <Link href="/register" underline="hover" sx={{ color: "#6366f1" }}>
                Register now
              </Link>
            </Typography>
          </Box>



       

          <Box sx={{ mt: 2, textAlign: "center" }}>
           
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              © 2025 QuantumTrade. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </LoginCard>
    </LoginContainer>
  )
}

export default LoginPage

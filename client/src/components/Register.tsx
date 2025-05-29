"use client"

import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Visibility,
  VisibilityOff
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Use VITE_AWS_API_URL for Vite projects
const API_URL = import.meta.env.VITE_AWS_API_URL

const RegisterContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(2),
}))

const RegisterCard = styled(Paper)(({ theme }) => ({
  backgroundColor: "#1a1a2e",
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  overflow: "hidden",
  width: "100%",
  maxWidth: 450,
}))

const RegisterHeader = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  padding: theme.spacing(3),
  textAlign: "center",
}))



interface RegisterResponse {
  token: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface RegisterError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await axios.post<RegisterResponse>(`${API_URL}/auth/register`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      const { token, id, firstName, lastName } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);

      // Call login function from AuthContext with user data
      login({
        token,
        id,
        firstName,
        lastName,
        email: formData.email
      });

      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const error = err as RegisterError;
      setError(error.response?.data?.error || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <RegisterContainer>
      <RegisterCard>
        <RegisterHeader>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              QuantumTrade
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Create your trading account and start investing
          </Typography>
        </RegisterHeader>

        <Box component="form" onSubmit={handleSubmit} sx={{ padding: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    variant="outlined"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "text.secondary" }} />
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
                    label="Last Name"
                    variant="outlined"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "text.secondary" }} />
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
          </Box>

                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
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
            sx={{ mb: 2 }}
          />

                  <TextField
                    fullWidth
                    label="Password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
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
            sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm Password"
                    variant="outlined"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
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
                            onClick={handleToggleConfirmPassword}
                            edge="end"
                            sx={{ color: "text.secondary" }}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            sx={{ mb: 2 }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
                        sx={{
                          color: "#6366f1",
                          "&.Mui-checked": {
                            color: "#6366f1",
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the{" "}
                        <Link href="#" underline="hover" sx={{ color: "#6366f1" }}>
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" underline="hover" sx={{ color: "#6366f1" }}>
                          Privacy Policy
                        </Link>
                      </Typography>
                    }
            sx={{ mb: 3 }}
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
              mb: 2,
                  position: "relative",
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Create Account"}
              </Button>

          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Already have an account?{" "}
              <Link href="/login" underline="hover" sx={{ color: "#6366f1" }}>
                Log in
              </Link>
            </Typography>
          </Box>
          <Box sx={{ mt: 1, textAlign: "center" }}>
           
           <Typography variant="caption" sx={{ color: "text.secondary" }}>
             © 2025 QuantumTrade. All rights reserved.
           </Typography>
         </Box>

    
              </Box>
      </RegisterCard>
    </RegisterContainer>
  )
}

export default RegisterPage

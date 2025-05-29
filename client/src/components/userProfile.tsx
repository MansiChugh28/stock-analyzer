"use client"

import type React from "react"
import { useState } from "react"
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Typography,
  Popover,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

// Styled components
const ProfileCard = styled(Card)({
  backgroundColor: "#1a1a2e",
  color: "#ffffff",
  borderRadius: 8,
  width: 400,
  maxWidth: "100%",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
})

const ProfileHeader = styled(Box)({
  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
  padding: 16,
  position: "relative",
  height: 100,
})

const ProfileAvatar = styled(Avatar)({
  width: 80,
  height: 80,
  border: "4px solid #1a1a2e",
  backgroundColor: "#4f46e5",
  position: "absolute",
  bottom: -40,
  left: 20,
})

export default function UserProfilePopup() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Handle profile click
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  // Handle close
  const handleClose = () => {
    setAnchorEl(null)
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    handleClose()
    navigate('/login')
  }

  // Format date
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  const open = Boolean(anchorEl)

  if (!user) {
    return null
  }

  return (
    <>
      {/* Profile Button */}
      <IconButton color="inherit" onClick={handleProfileClick}>
        <AccountCircleIcon />
      </IconButton>

      {/* Profile Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        <ProfileCard>
          <ProfileHeader>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            
              <IconButton size="small" sx={{ color: "white" }} onClick={handleClose}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <ProfileAvatar>{user.firstName.charAt(0)}</ProfileAvatar>
          </ProfileHeader>

          <CardContent sx={{ pt: 6 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="h6">{`${user.firstName} ${user.lastName}`}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {user.email}
                </Typography>
                {user.createdAt && (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.disabled", display: "flex", alignItems: "center", mt: 0.5 }}
                  >
                    Member since {formatDate(user.createdAt)}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
       
              <Button
                size="small"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  color: "text.secondary",
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
                }}
              >
                Logout
              </Button>
            </Box>
          </CardContent>
        </ProfileCard>
      </Popover>
    </>
  )
}

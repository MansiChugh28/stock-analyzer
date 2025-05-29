"use client"

import { Box, Container, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import UserProfilePopup from "./userProfile"

const DemoContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
  color: "#ffffff",
  padding: theme.spacing(4),
}))

const DemoCard = styled(Box)(({ theme }) => ({
  backgroundColor: "#1a1a2e",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
}))

export default function ProfileDemo() {
  return (
    <DemoContainer>
      <Container maxWidth="lg">
        <DemoCard>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
            User Profile Demo
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            This demo shows how the user profile popup works in the trading dashboard. Click the profile icon below to
            open the popup:
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <UserProfilePopup />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ← Click this profile icon to open the popup
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Features:
          </Typography>

          <Box component="ul" sx={{ pl: 3 }}>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">View portfolio summary with total value and profit/loss</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">Track individual stock holdings with average purchase price</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">View transaction history with details on each buy/sell</Typography>
            </Box>
            <Box component="li" sx={{ mb: 1 }}>
              <Typography variant="body2">Add new transactions to track stock purchases and sales</Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2">Delete transactions if needed</Typography>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ mt: 4, color: "text.secondary" }}>
            This component integrates with the existing trading dashboard and uses the same styling conventions and data
            structures.
          </Typography>
        </DemoCard>
      </Container>
    </DemoContainer>
  )
}

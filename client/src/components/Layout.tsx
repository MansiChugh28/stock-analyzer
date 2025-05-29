import React from 'react';
import { Box } from '@mui/material';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box
        sx={{
          flex: 1,
          background: "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
          color: "#ffffff",
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 
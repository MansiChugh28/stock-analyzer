import  { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import {  Info } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface PortfolioSummary {
  totalValue: number;
  totalInvestment: number;
  totalPL: number;
  totalPLPercent: number;
  bestPerformer: {
    symbol: string;
    pl: number;
    plPercent: number;
  };
  worstPerformer: {
    symbol: string;
    pl: number;
    plPercent: number;
  };
  suggestions: string[];
}

interface PortfolioStock {
  symbol: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

// interface Performer {
//   symbol: string;
//   pl: number;
//   plPercent: number;
// }

export default function PortfolioSummary() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPortfolioSummary = useCallback(async () => {
    try {
      const response = await axios.get<{ portfolio: PortfolioStock[] }>(`${import.meta.env.VITE_AWS_API_URL}/portfolio`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });

      const portfolio = response.data.portfolio;
      
      // Calculate summary metrics
      const totalInvestment = portfolio.reduce((sum, stock) => 
        sum + (stock.purchasePrice * stock.shares), 0);
      
      const totalValue = portfolio.reduce((sum, stock) => 
        sum + (stock.currentPrice * stock.shares), 0);
      
      const totalPL = totalValue - totalInvestment;
      const totalPLPercent = (totalPL / totalInvestment) * 100;

      // Find best and worst performers
      const performers = portfolio.map((stock) => ({
        symbol: stock.symbol,
        pl: (stock.currentPrice - stock.purchasePrice) * stock.shares,
        plPercent: ((stock.currentPrice - stock.purchasePrice) / stock.purchasePrice) * 100
      }));

      const bestPerformer = performers.reduce((best, current) => 
        current.plPercent > best.plPercent ? current : best);
      
      const worstPerformer = performers.reduce((worst, current) => 
        current.plPercent < worst.plPercent ? current : worst);

      // Generate suggestions
      const suggestions = [];
      if (totalPLPercent < -5) {
        suggestions.push("Consider rebalancing your portfolio to reduce risk");
      }
      if (portfolio.length < 5) {
        suggestions.push("Diversify your portfolio by adding more stocks");
      }
      if (bestPerformer.plPercent > 20) {
        suggestions.push(`Consider taking profits on ${bestPerformer.symbol}`);
      }
      if (worstPerformer.plPercent < -15) {
        suggestions.push(`Review your position in ${worstPerformer.symbol}`);
      }

      setSummary({
        totalValue,
        totalInvestment,
        totalPL,
        totalPLPercent,
        bestPerformer,
        worstPerformer,
        suggestions
      });
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchPortfolioSummary();
  }, [fetchPortfolioSummary]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Portfolio Summary
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Overview of your investment performance and insights
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Overall Performance
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: '#1a1a2e' }}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        Total Portfolio Value
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        ${summary.totalValue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        Total Investment
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        ${summary.totalInvestment.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        Total Profit/Loss
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          color: summary.totalPL >= 0 ? '#22c55e' : '#ef4444',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 'bold'
                        }}
                      >
                        ${summary.totalPL.toFixed(2)} ({summary.totalPLPercent.toFixed(2)}%)
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Best & Worst Performers */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Top Performers
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: '#1a1a2e' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Stock</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>P/L</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>% Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        Best: {summary.bestPerformer.symbol}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          color: '#22c55e',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 'bold'
                        }}
                      >
                        ${summary.bestPerformer.pl.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          color: '#22c55e',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 'bold'
                        }}
                      >
                        +{summary.bestPerformer.plPercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        Worst: {summary.worstPerformer.symbol}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          color: '#ef4444',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 'bold'
                        }}
                      >
                        ${summary.worstPerformer.pl.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          color: '#ef4444',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          fontWeight: 'bold'
                        }}
                      >
                        {summary.worstPerformer.plPercent.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Suggestions */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Portfolio Insights
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {summary.suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    icon={<Info />}
                    label={suggestion}
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      '& .MuiChip-icon': {
                        color: '#9ca3af'
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 
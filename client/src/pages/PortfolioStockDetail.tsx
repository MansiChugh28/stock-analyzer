import  { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockDetail {
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  pl: number;
  plPercent: number;
  historicalData: {
    dates: string[];
    prices: number[];
  };
}

interface PortfolioStock {
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
}

interface HistoricalDataPoint {
  Date: string;
  Close: number;
}

export default function PortfolioStockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [stockDetail, setStockDetail] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStockDetail = useCallback(async () => {
    if (!symbol) return;

    try {
      // Fetch portfolio stock details
      const portfolioResponse = await axios.get<{ portfolio: PortfolioStock[] }>(`${import.meta.env.VITE_AWS_API_URL}/portfolio`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      const portfolioStock = portfolioResponse.data.portfolio.find(
        (stock) => stock.symbol === symbol
      );

      if (!portfolioStock) {
        navigate('/portfolio');
        return;
      }

      // Fetch historical data
      const historicalResponse = await axios.get<HistoricalDataPoint[]>(
        `${import.meta.env.VITE_LOCAL_API_URL}/api/stock/${symbol}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );

      const historicalData = historicalResponse.data;
      const currentPrice = historicalData[historicalData.length - 1].Close;
      const pl = (currentPrice - portfolioStock.purchasePrice) * portfolioStock.shares;
      const plPercent = ((currentPrice - portfolioStock.purchasePrice) / portfolioStock.purchasePrice) * 100;

      setStockDetail({
        ...portfolioStock,
        currentPrice,
        pl,
        plPercent,
        historicalData: {
          dates: historicalData.map((item) => item.Date),
          prices: historicalData.map((item) => item.Close),
        },
      });
    } catch (error) {
      console.error('Error fetching stock detail:', error);
    } finally {
      setLoading(false);
    }
  }, [symbol, user?.token, navigate]);

  useEffect(() => {
    fetchStockDetail();
  }, [fetchStockDetail]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!stockDetail) {
    return null;
  }

  const chartData = {
    labels: stockDetail.historicalData.dates,
    datasets: [
      {
        label: 'Stock Price',
        data: stockDetail.historicalData.prices,
        borderColor: stockDetail.pl >= 0 ? '#22c55e' : '#ef4444',
        backgroundColor: stockDetail.pl >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {stockDetail.symbol} Portfolio Analysis
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Detailed performance and analysis of your {stockDetail.symbol} holdings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Performance Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Current Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${(stockDetail.currentPrice * stockDetail.shares).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Profit/Loss
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: stockDetail.pl >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 'bold',
                  }}
                >
                  ${stockDetail.pl.toFixed(2)} ({stockDetail.plPercent.toFixed(2)}%)
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Average Cost
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${stockDetail.purchasePrice.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Position Details */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Position Details
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Shares Owned
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stockDetail.shares}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Purchase Date
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {new Date(stockDetail.purchaseDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Current Price
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${stockDetail.currentPrice.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Investment Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Investment Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Total Investment
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${(stockDetail.purchasePrice * stockDetail.shares).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Return on Investment
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: stockDetail.plPercent >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: 'bold',
                  }}
                >
                  {stockDetail.plPercent.toFixed(2)}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Holding Period
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {Math.floor(
                    (new Date().getTime() - new Date(stockDetail.purchaseDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Price Chart */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Price History
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Historical Price Table */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Historical Price Data
              </Typography>
              <TableContainer component={Paper} sx={{ bgcolor: '#1a1a2e' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Date</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Open</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>High</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Low</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Close</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Volume</TableCell>
                      <TableCell align="right" sx={{ color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.1)' }}>Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockDetail.historicalData.dates.map((date, index) => {
                      const price = stockDetail.historicalData.prices[index];
                      const prevPrice = index > 0 ? stockDetail.historicalData.prices[index - 1] : price;
                      const change = ((price - prevPrice) / prevPrice) * 100;
                      
                      return (
                        <TableRow key={date} hover>
                          <TableCell sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            {new Date(date).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            ${price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            ${(price * 1.02).toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            ${(price * 0.98).toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            ${price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                            {(Math.random() * 1000000).toFixed(0)}
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              color: change >= 0 ? '#22c55e' : '#ef4444',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              fontWeight: 'bold'
                            }}
                          >
                            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 
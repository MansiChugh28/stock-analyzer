import  { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

const DarkCard = styled(Card)({
  backgroundColor: "#1a1a2e",
  color: "#ffffff",
  borderRadius: 8,
});

const GradientTypography = styled(Typography)({
  background: "linear-gradient(45deg, #6366f1 30%, #a855f7 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",
});

interface StockData {
  Date: string;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  Dividends: number;
  Stock_Splits: number;
  SMA_20: number | null;
  EMA_20: number | null;
  RSI_14: number | null;
  MACD: number | null;
  MACD_signal: number | null;
  MACD_hist: number | null;
  Trend: string;
  Volume_SMA_20: number | null;
  Volume_Spike: boolean;
}

interface PurchaseHistory {
  date: string;
  shares: number;
  price: number;
  total: number;
}

interface TradingSignal {
  signal: string;
  confidence: number;
  reason: string;
}

interface AuthContextType {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  login: (userData: UserData) => void;
  logout: () => void;
  isAuthenticated: boolean;
  fetchUserProfile: () => Promise<void>;
}

interface UserData {
  token: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface PortfolioData {
  symbol: string;
  purchases: {
    date: string;
    shares: number;
    price: number;
    total: number;
  }[];
  total_shares: number;
  average_cost: number;
  total_investment: number;
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

interface SummaryItem {
  name: string;
  total: string;
  change: string;
  icon: string;
}

interface StockResponse {
  data: StockData[];
  summary: SummaryItem[];
}

interface TechnicalIndicators {
  RSI_14: number;
  MACD: number;
  macdSignal: number;
  macdHist: number;
  sma20: number;
  ema20: number;
  volumeSma20: number;
  volumeSpike: boolean;
}

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const { user } = useAuth() as AuthContextType;
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [changePercent, setChangePercent] = useState<number>(0);
  const [companyName, setCompanyName] = useState<string>('');
  const [sector, setSector] = useState<string>('');
  const [industry, setIndustry] = useState<string>('');
  const [totalShares, setTotalShares] = useState<number>(0);
  const [averageCost, setAverageCost] = useState<number>(0);
  const [totalInvestment, setTotalInvestment] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [profitLoss, setProfitLoss] = useState<number>(0);
  const [profitLossPercentage, setProfitLossPercentage] = useState<number>(0);
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicators | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch stock data from server
        const stockResponse = await axios.get<StockResponse>(`${import.meta.env.VITE_LOCAL_API_URL}/api/stock/${symbol}`, {
          params: {
            period: "1mo",
            interval: "1d"
          },
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });

        if (stockResponse.data) {
          setStockData(stockResponse.data.data);
          
          // Get the latest price and change from the summary data
          const latestPriceData = stockResponse.data.summary.find((item) => item.name === "Latest Price");
          
          if (latestPriceData) {
            setCurrentPrice(parseFloat(latestPriceData.total.replace('$', '')));
            setChangePercent(parseFloat(latestPriceData.change.replace('%', '')));
          }

          // Get company info from the first data point
          if (stockResponse.data.data.length > 0) {
            const latestData = stockResponse.data.data[stockResponse.data.data.length - 1];
            setCompanyName(symbol || '');
            
            // Calculate trend based on the latest data
            const trend = latestData.Trend || 'Unknown';
            setSector(trend);
            setIndustry(trend);
          }

          // Fetch portfolio data from portfolio backend
          const portfolioResponse = await axios.get<PortfolioData>(`${import.meta.env.VITE_AWS_API_URL}/portfolio/${symbol}`, {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          });

          if (portfolioResponse.data) {
            const portfolioData = portfolioResponse.data;
            setPurchaseHistory(portfolioData.purchases);
            setTotalShares(portfolioData.total_shares);
            setTotalInvestment(portfolioData.total_investment);
            setAverageCost(portfolioData.average_cost);
            
            // Calculate current value and profit/loss using the latest price from the API
            const latestPrice = parseFloat(latestPriceData?.total.replace('$', '') || '0');
            const value = portfolioData.total_shares * latestPrice;
            const pl = value - portfolioData.total_investment;
            const plPercentage = portfolioData.total_investment > 0 ? (pl / portfolioData.total_investment) * 100 : 0;
            
            setCurrentValue(value);
            setProfitLoss(pl);
            setProfitLossPercentage(plPercentage);
          }

          // Fetch trading signals from stock data backend
          const signalsResponse = await axios.get(`${import.meta.env.VITE_LOCAL_API_URL}/api/signals/${symbol}`, {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          });

          if (signalsResponse.data) {
            setTradingSignals(signalsResponse.data.signals || []);
          }

          // Fetch technical indicators from stock data backend
          const indicatorsResponse = await axios.get(`${import.meta.env.VITE_LOCAL_API_URL}/api/indicators/${symbol}`, {
            headers: {
              Authorization: `Bearer ${user?.token}`
            }
          });

          if (indicatorsResponse.data) {
            setTechnicalIndicators(indicatorsResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (symbol && user?.token) {
      fetchData();
    }
  }, [symbol, user]);



  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Stock Overview */}
        <Grid item xs={12}>
          <DarkCard>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <GradientTypography variant="h5">
                    {companyName} ({symbol})
                  </GradientTypography>
                  <Chip
                    label={profitLoss >= 0 ? "PROFIT" : "LOSS"}
                    color={profitLoss >= 0 ? "success" : "error"}
                    size="small"
                  />
               
                </Box>
              }
              subheader={
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Sector: {sector}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Industry: {industry}
                  </Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stockData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                        <XAxis 
                          dataKey="Date" 
                          stroke="#9ca3af"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1f2937",
                            borderColor: "#374151",
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Line
                          type="monotone"
                          dataKey="Close"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={false}
                        />
                        {stockData.some(data => data.SMA_20 !== null) && (
                          <Line
                            type="monotone"
                            dataKey="SMA_20"
                            stroke="#22c55e"
                            strokeWidth={1}
                            dot={false}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: "#16213e" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Current Price
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          ${(currentPrice || 0).toFixed(2)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: (changePercent || 0) >= 0 ? "#22c55e" : "#ef4444",
                            mt: 0.5
                          }}
                        >
                          {(changePercent || 0) >= 0 ? '+' : ''}{(changePercent || 0).toFixed(2)}%
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: "#16213e" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Shares
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {totalShares}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: "#16213e" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Average Cost
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          ${(averageCost || 0).toFixed(2)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: "#16213e" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Investment
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          ${(totalInvestment || 0).toFixed(2)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, bgcolor: "#16213e" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Current Value
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          ${(currentValue || 0).toFixed(2)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: "#16213e",
                          border: `1px solid ${profitLoss >= 0 ? "#22c55e" : "#ef4444"}`
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              Profit/Loss
                            </Typography>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                mt: 1,
                                color: (profitLoss || 0) >= 0 ? "#22c55e" : "#ef4444"
                              }}
                            >
                              ${(profitLoss || 0).toFixed(2)} ({(profitLossPercentage || 0).toFixed(2)}%)
                            </Typography>
                          </Box>
                          {profitLoss >= 0 ? (
                            <TrendingUpIcon sx={{ color: "#22c55e", fontSize: 40 }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: "#ef4444", fontSize: 40 }} />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </DarkCard>
        </Grid>

        {/* Trading Signals */}
        {tradingSignals.length > 0 && (
          <Grid item xs={12} md={6}>
            <DarkCard>
              <CardHeader title="Trading Signals" />
              <CardContent>
                {tradingSignals.map((signal, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: "#16213e",
                      border: `1px solid ${
                        signal.signal === "Buy" ? "#22c55e" :
                        signal.signal === "Sell" ? "#ef4444" :
                        "#f59e0b"
                      }`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {signal.signal}
                      </Typography>
                      <Chip
                        label={`${signal.confidence}% Confidence`}
                        color={
                          signal.confidence >= 80 ? "success" :
                          signal.confidence >= 60 ? "warning" :
                          "error"
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {signal.reason}
                    </Typography>
                  </Paper>
                ))}
              </CardContent>
            </DarkCard>
          </Grid>
        )}

        {/* Technical Indicators */}
        {technicalIndicators && (
          <Grid item xs={12} md={6}>
            <DarkCard>
              <CardHeader title="Technical Indicators" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: "#16213e" }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        RSI (14)
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mt: 1,
                          color: 
                            technicalIndicators?.RSI_14 > 70 ? "#ef4444" :
                            technicalIndicators?.RSI_14 < 30 ? "#22c55e" :
                            "inherit"
                        }}
                      >
                        {technicalIndicators?.RSI_14?.toFixed(2) || 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, bgcolor: "#16213e" }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        MACD
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          mt: 1,
                          color: 
                            technicalIndicators?.MACD > technicalIndicators?.macdSignal ? "#22c55e" :
                            "#ef4444"
                        }}
                      >
                        {technicalIndicators?.MACD?.toFixed(2) || 'N/A'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </DarkCard>
          </Grid>
        )}

        {/* Purchase History */}
        <Grid item xs={12}>
          <DarkCard>
            <CardHeader title="Purchase History" />
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Shares</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchaseHistory.map((purchase, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{purchase.shares}</TableCell>
                        <TableCell align="right">${purchase.price.toFixed(2)}</TableCell>
                        <TableCell align="right">${purchase.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </DarkCard>
        </Grid>
      </Grid>
    </Container>
  );
} 
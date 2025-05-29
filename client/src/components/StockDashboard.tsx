"use client";

import {
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon
} from "@mui/icons-material";
import {

  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Tooltip as MuiTooltip,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useAuth } from "../context/AuthContext";
import StockSymbolsManager from "./StockSymbolsManager";
import MarketNews from "./dashboard/MarketNews";
import TechnicalAnalysis from "./dashboard/TechnicalAnalysis";
import TradingSignals from "./dashboard/TradingSignals";
import VolumeAnalysis from "./dashboard/VolumeAnalysis";

// Define types for the data
interface StockDataItem {
  Date: string;
  Open: number | null;
  High: number | null;
  Low: number | null;
  Close: number | null;
  Volume: number | null;
  SMA_20?: number | null;
  EMA_20?: number | null;
  RSI_14?: number | null;
  MACD?: number | null;
  MACD_signal?: number | null;
  MACD_hist?: number | null;
  Trend?: string | null;
  Volume_SMA_20?: number | null;
  Volume_Spike?: boolean | null;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
}

interface TradingSignal {
  id: number;
  symbol: string;
  signal: string;
  confidence: number;
  reason: string;
}

interface StockData {
  Date: string;
  Close: number | null;
  Open: number | null;
  High: number | null;
  Low: number | null;
  Volume: number | null;
  RSI_14?: number | null;
  MACD?: number | null;
  MACD_signal?: number | null;
  SMA_20?: number | null;
}

interface SummaryData {
  price: number;
  volume: number;
  change: number;
  changePercent: number;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
}

// Styled components
const DarkCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  backgroundColor: "#1a1a2e",
  color: "#ffffff",
  borderRadius: theme.shape.borderRadius,
}));

const StatsCard = styled(Paper)(({ theme }: { theme: Theme }) => ({
  backgroundColor: "#16213e",
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  height: "100%",
}));

// const SignalBadge = styled(Badge)(({ theme }: { theme: Theme }) => ({
//   "& .MuiBadge-badge": {
//     backgroundColor: (props: { signal?: string }) => {
//       switch (props.signal) {
//         case "Buy":
//         case "Strong Buy":
//           return "#22c55e"; // Green
//         case "Sell":
//         case "Strong Sell":
//           return "#f59e0b"; // Yellow
//         default:
//           return "#ef4444"; // Red for Hold
//       }
//     },
//     color: "#ffffff",
//   },
// }));

// Mock data
// const generateMockData = (days = 30) => {
//   const data = []
//   let price = 150 + Math.random() * 10
//   const volatility = 2
//
//   for (let i = 0; i < days; i++) {
//     const date = new Date()
//     date.setDate(date.getDate() - (days - i))
//
//     // Create some patterns in the data
//     const trend = Math.sin(i / 5) * volatility
//     const randomFactor = (Math.random() - 0.5) * volatility
//
//     price = price + trend + randomFactor
//     const volume = Math.floor(500000 + Math.random() * 1000000)
//
//     // Calculate some technical indicators
//     const sma20 = price + (Math.random() - 0.5) * 2
//     const ema20 = price + (Math.random() - 0.5) * 1.5
//     const rsi = 30 + Math.random() * 40
//     const macd = (Math.random() - 0.5) * 2
//     const macdSignal = macd + (Math.random() - 0.5) * 0.5
//     const macdHist = macd - macdSignal
//
//     data.push({
//       date: date.toISOString().split("T")[0],
//       price: Number.parseFloat(price.toFixed(2)),
//       open: Number.parseFloat((price - 1 - Math.random() * 2).toFixed(2)),
//       high: Number.parseFloat((price + 1 + Math.random() * 2).toFixed(2)),
//       low: Number.parseFloat((price - 2 - Math.random() * 2).toFixed(2)),
//       close: Number.parseFloat(price.toFixed(2)),
//       volume,
//       sma20: Number.parseFloat(sma20.toFixed(2)),
//       ema20: Number.parseFloat(ema20.toFixed(2)),
//       rsi: Number.parseFloat(rsi.toFixed(2)),
//       macd: Number.parseFloat(macd.toFixed(2)),
//       macdSignal: Number.parseFloat(macdSignal.toFixed(2)),
//       macdHist: Number.parseFloat(macdHist.toFixed(2)),
//       volumeChange: Math.random() > 0.5 ? 1 : -1,
//     })
//   }
//
//   return data
// }

// These mock data arrays might be replaced or augmented by API data

// const tradingSignals = [
//   {
//     id: 1,
//     symbol: "AAPL",
//     signal: "Buy",
//     confidence: 87,
//     reason: "Golden Cross pattern formed",
//   },
//   {
//     id: 2,
//     symbol: "MSFT",
//     signal: "Hold",
//     confidence: 65,
//     reason: "Consolidating in range",
//   },
//   {
//     id: 3,
//     symbol: "TSLA",
//     signal: "Sell",
//     confidence: 72,
//     reason: "Bearish divergence on RSI",
//   },
//   {
//     id: 4,
//     symbol: "AMZN",
//     signal: "Buy",
//     confidence: 81,
//     reason: "Breaking resistance level",
//   },
//   {
//     id: 5,
//     symbol: "NVDA",
//     signal: "Strong Buy",
//     confidence: 94,
//     reason: "Bullish MACD crossover",
//   },
// ];

const portfolioHoldings = [
  {
    symbol: "AAPL",
    shares: 25,
    avgPrice: 142.32,
    currentPrice: 173.45,
    pl: 31.13,
    plPercent: 21.87,
  },
  {
    symbol: "MSFT",
    shares: 15,
    avgPrice: 245.67,
    currentPrice: 287.89,
    pl: 42.22,
    plPercent: 17.18,
  },
  {
    symbol: "GOOGL",
    shares: 10,
    avgPrice: 2145.23,
    currentPrice: 2356.78,
    pl: 211.55,
    plPercent: 9.86,
  },
  {
    symbol: "AMZN",
    shares: 12,
    avgPrice: 3125.45,
    currentPrice: 3245.67,
    pl: 120.22,
    plPercent: 3.85,
  },
];

// Add this constant near the top of the file, after imports
// const ALPHA_VANTAGE_API_KEY = "YOUR_API_KEY"; // Replace with your Alpha Vantage API key

export default function TradingDashboard() {
  const [stockData, setStockData] = useState<StockDataItem[]>([]);
  const [, setSummaryData] = useState<SummaryData>({
    price: 0,
    volume: 0,
    change: 0,
    changePercent: 0,
    rsi: null,
    macd: null,
    macdSignal: null
  });
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("1M");
  const [loading, setLoading] = useState(false);
  // const [aiMode, setAiMode] = useState(true);
  // const [searchQuery, setSearchQuery] = useState("");
  const [showPortfolio] = useState(false);
 
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [chartType, setChartType] = useState<string>("line");
  const [tradingSignals, setTradingSignals] = useState<TradingSignal[]>([]);
  const {  user } = useAuth();
  // const navigate = useNavigate();
  const [, setError] = useState<string | null>(null);

  // Format large numbers
  const formatNumber = (num: number): string => {
    const floatNum = parseFloat(num.toString());
    if (floatNum >= 1000000) {
      return (floatNum / 1000000).toFixed(3) + "M";
    } else if (floatNum >= 1000) {
      return (floatNum / 1000).toFixed(3) + "K";
    }
    return floatNum.toFixed(3);
  };

  // Format percentage
  const formatPercent = (num: number): string => {
    if (num === null || num === undefined) return "N/A";
    const floatNum = parseFloat(num.toString());
    return floatNum > 0 ? `+${floatNum.toFixed(3)}%` : `${floatNum.toFixed(3)}%`;
  };



  // Update the analyzeTradingSignals function to handle null values properly
  const analyzeTradingSignals = (data: StockDataItem[], symbol: string) => {
    if (!data || data.length < 2) return [];

    const currentData = data[data.length - 1];
    const previousData = data[data.length - 2];
    const signals = [];

    // RSI Analysis
    if (currentData.RSI_14 !== null && currentData.RSI_14 !== undefined) {
      let rsiSignal = "Hold";
      let rsiConfidence = 50;
      let rsiReason = "";

      if (currentData.RSI_14 < 30) {
        rsiSignal = "Strong Buy";
        rsiConfidence = 85;
        rsiReason = "RSI indicates oversold conditions";
      } else if (currentData.RSI_14 < 40) {
        rsiSignal = "Buy";
        rsiConfidence = 75;
        rsiReason = "RSI approaching oversold territory";
      } else if (currentData.RSI_14 > 70) {
        rsiSignal = "Strong Sell";
        rsiConfidence = 85;
        rsiReason = "RSI indicates overbought conditions";
      } else if (currentData.RSI_14 > 60) {
        rsiSignal = "Sell";
        rsiConfidence = 75;
        rsiReason = "RSI approaching overbought territory";
      }

      signals.push({
        id: 1,
        symbol,
        signal: rsiSignal,
        confidence: rsiConfidence,
        reason: rsiReason,
      });
    }

    // MACD Analysis
    if (
      currentData.MACD !== null &&
      currentData.MACD !== undefined &&
      currentData.MACD_signal !== null &&
      currentData.MACD_signal !== undefined &&
      currentData.MACD_hist !== null &&
      currentData.MACD_hist !== undefined
    ) {
      let macdSignal = "Hold";
      let macdConfidence = 50;
      let macdReason = "";

      if (currentData.MACD > currentData.MACD_signal && currentData.MACD_hist > 0) {
        macdSignal = "Strong Buy";
        macdConfidence = 90;
        macdReason = "MACD crossover with positive histogram indicates strong bullish momentum";
      } else if (currentData.MACD > currentData.MACD_signal) {
        macdSignal = "Buy";
        macdConfidence = 80;
        macdReason = "MACD crossover indicates bullish momentum";
      } else if (currentData.MACD < currentData.MACD_signal && currentData.MACD_hist < 0) {
        macdSignal = "Strong Sell";
        macdConfidence = 90;
        macdReason = "MACD crossover with negative histogram indicates strong bearish momentum";
      } else if (currentData.MACD < currentData.MACD_signal) {
        macdSignal = "Sell";
        macdConfidence = 80;
        macdReason = "MACD crossover indicates bearish momentum";
      }

      signals.push({
        id: 2,
        symbol,
        signal: macdSignal,
        confidence: macdConfidence,
        reason: macdReason,
      });
    }

    // Moving Average Analysis
    if (
      currentData.Close !== null &&
      currentData.Close !== undefined &&
      currentData.SMA_20 !== null &&
      currentData.SMA_20 !== undefined &&
      previousData.Close !== null &&
      previousData.Close !== undefined
    ) {
      let maSignal = "Hold";
      let maConfidence = 60;
      let maReason = "";

      const priceChange = ((currentData.Close - previousData.Close) / previousData.Close) * 100;
      // const maDistance = ((currentData.Close - currentData.SMA_20) / currentData.SMA_20) * 100;

      if (currentData.Close > currentData.SMA_20 && priceChange > 0) {
        maSignal = "Strong Buy";
        maConfidence = 85;
        maReason = `Price above 20-day moving average with ${priceChange.toFixed(2)}% gain`;
      } else if (currentData.Close > currentData.SMA_20) {
        maSignal = "Buy";
        maConfidence = 75;
        maReason = "Price above 20-day moving average";
      } else if (currentData.Close < currentData.SMA_20 && priceChange < 0) {
        maSignal = "Strong Sell";
        maConfidence = 85;
        maReason = `Price below 20-day moving average with ${priceChange.toFixed(2)}% loss`;
      } else if (currentData.Close < currentData.SMA_20) {
        maSignal = "Sell";
        maConfidence = 75;
        maReason = "Price below 20-day moving average";
      }

      signals.push({
        id: 3,
        symbol,
        signal: maSignal,
        confidence: maConfidence,
        reason: maReason,
      });
    }

    // Volume Analysis
    if (
      currentData.Volume !== null &&
      currentData.Volume !== undefined &&
      currentData.Close !== null &&
      currentData.Close !== undefined &&
      previousData.Close !== null &&
      previousData.Close !== undefined
    ) {
      const avgVolume = data.reduce((sum, item) => sum + (item.Volume || 0), 0) / data.length;
      const volumeChange = ((currentData.Volume - avgVolume) / avgVolume) * 100;

      if (volumeChange > 50) {
        signals.push({
          id: 4,
          symbol,
          signal: currentData.Close > previousData.Close ? "Strong Buy" : "Strong Sell",
          confidence: 80,
          reason: `Unusually high volume (${volumeChange.toFixed(2)}% above average) with ${currentData.Close > previousData.Close ? "price increase" : "price decrease"}`,
        });
      }
    }

    return signals;
  };

  // Calculate technical indicators
  const calculateIndicators = (data: any[]) => {
    if (!Array.isArray(data)) {
      console.error('Invalid data format:', data);
      return [];
    }
    console.log("here the data type: ",data);
    return data.map(item => ({
      ...item,
      RSI_14: item.RSI_14 || null,
      MACD: item.MACD || null,
      MACD_signal: item.MACD_signal || null,
      SMA_20: item.SMA_20 || null
    }));
  };

  // Add this function to convert timeframe to API parameters
  const getTimeframeParams = (timeframe: string) => {
    switch (timeframe) {
          case '1M':
        return { period: '1mo', interval: '1d' };
      case '3M':
        return { period: '3mo', interval: '5d' };
      case '6M':
        return { period: '6mo', interval: '5d' };
      default:
        return { period: '1mo', interval: '1d' };
    }
  };

  // Update the useEffect that fetches stock data to also generate trading signals
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSymbol) return;

      try {
        setLoading(true);
        setError(null);
        
        const { period, interval } = getTimeframeParams(timeframe);
        
        const response = await axios.get(`${import.meta.env.VITE_LOCAL_API_URL}/api/stock/${selectedSymbol}`, {
          params: {
            period,
            interval
          },
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });

        if (response.data && Array.isArray(response.data.data)) {
          const processedData = calculateIndicators(response.data.data);
          setStockData(processedData);
          console.log("processedData" , processedData)
          
          // Generate trading signals based on the processed data
          const signals = analyzeTradingSignals(processedData, selectedSymbol);
          setTradingSignals(signals);
          
          // Update summary data
          if (processedData.length > 0) {
            const latest = processedData[processedData.length - 1];
            const previous = processedData[processedData.length - 2] || latest;
            
            setSummaryData({
              price: latest.Close,
              volume: latest.Volume,
              change: latest.Close - previous.Close,
              changePercent: ((latest.Close - previous.Close) / previous.Close) * 100,
              rsi: latest.RSI_14 || null,
              macd: latest.MACD || null,
              macdSignal: latest.MACD_signal || null
            });
          }
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        setError('Failed to fetch stock data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSymbol, timeframe, user?.token]);

  // Update the currentStock and previousStock type assertions with safety checks
  const currentStock = stockData && stockData.length > 0
    ? (stockData[stockData.length - 1] as StockData)
    : null;
  const previousStock = stockData && stockData.length > 1
    ? (stockData[stockData.length - 2] as StockData)
    : null;
  const priceChange =
    currentStock &&
    previousStock &&
    currentStock.Close !== null &&
    previousStock.Close !== null
      ? currentStock.Close - previousStock.Close
      : 0;
  const percentChange =
    currentStock &&
    previousStock &&
    previousStock.Close !== null &&
    previousStock.Close !== 0 &&
    currentStock.Close !== null
      ? (priceChange / previousStock.Close) * 100
      : 0;

  

  // Calculate portfolio value
  const portfolioValue = portfolioHoldings.reduce(
    (sum, holding) => sum + holding.shares * holding.currentPrice,
    0,
  );
  const portfolioPL = portfolioHoldings.reduce(
    (sum, holding) => sum + holding.shares * holding.pl,
    0,
  );
  const portfolioPLPercent =
    (portfolioPL / (portfolioValue - portfolioPL)) * 100;

  // Update the handleTimeframeChange function
  const handleTimeframeChange = (
    // @ts-ignore
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setTimeframe(newValue);
    // The useEffect will automatically trigger a new data fetch
  };

  // const handleRiskLevelChange = (
  //   event: React.SyntheticEvent,
  //   newValue: number,
  // ) => {
  //   setRiskLevel(newValue);
  // };

  // Update the useEffect for fetching news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&apikey=`,
        );

        if (response.data && response.data.feed) {
          const formattedNews = response.data.feed
            .slice(0, 10)
            .map((item: any) => ({
              id: item.url,
              title: item.title,
              source: item.source,
              time: formatTimeAgo(item.time_published),
              url: item.url,
            }));
          setMarketNews(formattedNews);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Add this helper function to format the time
  const formatTimeAgo = (timePublished: string) => {
    const published = new Date(
      timePublished.replace(
        /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/,
        "$1-$2-$3T$4:$5:$6",
      ),
    );
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - published.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Grid container spacing={2}>
        {/* Left sidebar */}
        <Grid item xs={12} md={5} lg={6} xl={6} component="div">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Stock selector */}
            <DarkCard>
             
              <CardContent sx={{ p: 0, minHeight: 300, overflow: "auto" }}>
                <Box sx={{ p: 2 }}>
                  <StockSymbolsManager
                    onSymbolSelect={(symbol) => {
                      setSelectedSymbol(symbol);
                      // The existing useEffect will handle fetching new data when selectedSymbol changes
                    }}
                    selectedSymbol={selectedSymbol}
                  />
                </Box>
              </CardContent>
            </DarkCard>

            {/* Market News */}
            <DarkCard>
         
              <CardContent sx={{ p: 0, maxHeight: 250, overflow: "auto" }}>
                <MarketNews news={marketNews} />
              </CardContent>
            </DarkCard>

            {/* Volume Analysis */}
            <DarkCard>
          
              <CardContent>
                <VolumeAnalysis
                  stockData={stockData}
                  selectedSymbol={selectedSymbol}
                />
              </CardContent>
            </DarkCard>
          </Box>
        </Grid>

        {/* Main content */}
        <Grid item xs={12}  md={7} lg={6} component="div">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Stock info */}
            <DarkCard>
              <CardHeader
                sx={{ pb: 1 }}
                title={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {selectedSymbol}
                        </Typography>
                    
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, fontFamily: "monospace" }}
                      >
                        ${currentStock?.Close ? parseFloat(currentStock.Close.toString()).toFixed(3) : "0.000"}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          color: percentChange >= 0 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {percentChange >= 0 ? (
                          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        ) : (
                          <TrendingDownIcon
                            fontSize="small"
                            sx={{ mr: 0.5 }}
                          />
                        )}
                        <Typography variant="body2">
                          {formatPercent(percentChange)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                }
              />
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Tabs
                    value={timeframe}
                    onChange={handleTimeframeChange}
                    sx={{
                      minHeight: 36,
                      "& .MuiTabs-indicator": {
                        bgcolor: "#6366f1",
                      },
                      "& .MuiTab-root": {
                        minHeight: 36,
                        minWidth: 40,
                        py: 0.5,
                        px: 1.5,
                      },
                    }}
                  >
                    {/* <Tab label="1W" value="1W" /> */}
                    <Tab label="1M" value="1M" />
                    <Tab label="3M" value="3M" />
                    <Tab label="6M" value="6M" />
                  </Tabs>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="chart-type-label">Chart Type</InputLabel>
                    <Select
                      labelId="chart-type-label"
                      id="chart-type"
                      value={chartType}
                      onChange={(event) => setChartType(event.target.value)}
                      label="Chart Type"
                      sx={{
                        height: 36,
                        bgcolor: "#1e293b",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#334155",
                        },
                      }}
                    >
                      <MenuItem value="line">Line Chart</MenuItem>
                      <MenuItem value="candle">Candlestick</MenuItem>
                      <MenuItem value="area">Area Chart</MenuItem>
                    </Select>
                  </FormControl>

                  <MuiTooltip title="Technical Indicators">
                    <IconButton
                      size="small"
                      sx={{ border: "1px solid #334155" }}
                    >
                      <TimelineIcon fontSize="small" />
                    </IconButton>
                  </MuiTooltip>

                  <MuiTooltip title="Volume Analysis">
                    <IconButton
                      size="small"
                      sx={{ border: "1px solid #334155" }}
                    >
                      <BarChartIcon fontSize="small" />
                    </IconButton>
                  </MuiTooltip>
                </Box>

                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 300,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <CircularProgress
                        size={32}
                        sx={{ mb: 1, color: "#6366f1" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        Loading data...
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "area" ? (
                        <AreaChart
                          data={stockData}
                          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient
                              id="colorPrice"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#6366f1"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#6366f1"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#2d3748"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="Date"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                            axisLine={{ stroke: "#4b5563" }}
                            minTickGap={30}
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                            axisLine={{ stroke: "#4b5563" }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              borderColor: "#374151",
                              borderRadius: "0.375rem",
                              fontSize: "0.875rem",
                              boxShadow:
                                "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                            labelStyle={{
                              color: "#9ca3af",
                              marginBottom: "0.25rem",
                            }}
                            formatter={(value) => [`$${parseFloat(value.toString()).toFixed(3)}`, ""]}
                          />
                          <Area
                            type="monotone"
                            dataKey="Close"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            activeDot={{
                              r: 6,
                              stroke: "#6366f1",
                              strokeWidth: 2,
                              fill: "#111827",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="SMA_20"
                            stroke="#22c55e"
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            dot={false}
                            name="SMA 20"
                          />
                        </AreaChart>
                      ) : chartType === "candle" ? (
                        <LineChart
                          data={stockData}
                          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#2d3748"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="Date"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                            axisLine={{ stroke: "#4b5563" }}
                            minTickGap={30}
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                            axisLine={{ stroke: "#4b5563" }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              borderColor: "#374151",
                              borderRadius: "0.375rem",
                              fontSize: "0.875rem",
                              boxShadow:
                                "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                            labelStyle={{
                              color: "#9ca3af",
                              marginBottom: "0.25rem",
                            }}
                            formatter={(value) => [`$${parseFloat(value.toString()).toFixed(3)}`, ""]}
                          />
                          <Line
                            type="monotone"
                            dataKey="Close"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{
                              r: 4,
                              stroke: "#6366f1",
                              strokeWidth: 2,
                              fill: "#111827",
                            }}
                            activeDot={{
                              r: 6,
                              stroke: "#6366f1",
                              strokeWidth: 2,
                              fill: "#111827",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="SMA_20"
                            stroke="#22c55e"
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            dot={false}
                            name="SMA 20"
                          />
                        </LineChart>
                      ) : (
                        <LineChart
                          data={stockData}
                          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#2d3748"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="Date"
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                            axisLine={{ stroke: "#4b5563" }}
                            minTickGap={30}
                          />
                          <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                            tickLine={{ stroke: "#4b5563" }}
                            axisLine={{ stroke: "#4b5563" }}
                            tickFormatter={(value) => `$${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1f2937",
                              borderColor: "#374151",
                              borderRadius: "0.375rem",
                              fontSize: "0.875rem",
                              boxShadow:
                                "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                            }}
                            itemStyle={{ color: "#e5e7eb" }}
                            labelStyle={{
                              color: "#9ca3af",
                              marginBottom: "0.25rem",
                            }}
                            formatter={(value) => [`$${parseFloat(value.toString()).toFixed(3)}`, ""]}
                          />
                          <Line
                            type="monotone"
                            dataKey="Close"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{
                              r: 6,
                              stroke: "#6366f1",
                              strokeWidth: 2,
                              fill: "#111827",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="SMA_20"
                            stroke="#22c55e"
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                            dot={false}
                            name="SMA 20"
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </Box>
                )}

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={3} component="div">
                    <StatsCard>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Open
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ${currentStock?.Open ? parseFloat(currentStock.Open.toString()).toFixed(3) : "0.000"}
                      </Typography>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={3} component="div">
                    <StatsCard>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        High
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ${currentStock?.High ? parseFloat(currentStock.High.toString()).toFixed(3) : "0.000"}
                      </Typography>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={3} component="div">
                    <StatsCard>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Low
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ${currentStock?.Low ? parseFloat(currentStock.Low.toString()).toFixed(3) : "0.000"}
                      </Typography>
                    </StatsCard>
                  </Grid>
                  <Grid item xs={3} component="div">
                    <StatsCard>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Volume
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {currentStock?.Volume
                          ? formatNumber(parseFloat(currentStock.Volume.toString()))
                          : "0.000"}
                      </Typography>
                    </StatsCard>
                  </Grid>
                </Grid>
              </CardContent>
            </DarkCard>

            {/* Technical Analysis */}
            <DarkCard>
        
              <CardContent>
                <TechnicalAnalysis
                  stockData={stockData}
                  currentStock={currentStock}
                />
              </CardContent>
            </DarkCard>

            {/* Portfolio Overview (Conditional) */}
            {showPortfolio && (
              <DarkCard>
                <CardHeader
                  sx={{ pb: 1 }}
                  title={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography variant="h6">
                          Portfolio Overview
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Your current holdings and performance
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 700, fontFamily: "monospace" }}
                        >
                          ${portfolioValue.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              portfolioPLPercent >= 0 ? "#22c55e" : "#ef4444",
                          }}
                        >
                          {portfolioPLPercent >= 0 ? "+" : ""}
                          {parseFloat(portfolioPLPercent.toString()).toFixed(3)}% ($
                          {portfolioPL.toFixed(2)})
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <CardContent sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              color: "text.secondary",
                              borderBottom: "1px solid #1e293b",
                            }}
                          >
                            Symbol
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "text.secondary",
                              borderBottom: "1px solid #1e293b",
                            }}
                          >
                            Shares
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "text.secondary",
                              borderBottom: "1px solid #1e293b",
                            }}
                          >
                            Avg Price
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "text.secondary",
                              borderBottom: "1px solid #1e293b",
                            }}
                          >
                            Current
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: "text.secondary",
                              borderBottom: "1px solid #1e293b",
                            }}
                          >
                            P/L
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {portfolioHoldings.map((holding) => (
                          <TableRow
                            key={holding.symbol}
                            sx={{
                              "&:last-child td, &:last-child th": {
                                border: 0,
                              },
                              "&:hover": {
                                bgcolor: "rgba(255, 255, 255, 0.05)",
                              },
                            }}
                          >
                            <TableCell
                              sx={{ borderBottom: "1px solid #1e293b" }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {holding.symbol}
                              </Typography>
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ borderBottom: "1px solid #1e293b" }}
                            >
                              {holding.shares}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontFamily: "monospace",
                                borderBottom: "1px solid #1e293b",
                              }}
                            >
                              ${parseFloat(holding.avgPrice.toString()).toFixed(3)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontFamily: "monospace",
                                borderBottom: "1px solid #1e293b",
                              }}
                            >
                              ${parseFloat(holding.currentPrice.toString()).toFixed(3)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ borderBottom: "1px solid #1e293b" }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "monospace",
                                  color: holding.pl >= 0 ? "#22c55e" : "#ef4444",
                                }}
                              >
                                ${parseFloat(holding.pl.toString()).toFixed(3)}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: holding.plPercent >= 0 ? "#22c55e" : "#ef4444",
                                }}
                              >
                                {holding.plPercent >= 0 ? "+" : ""}
                                {parseFloat(holding.plPercent.toString()).toFixed(3)}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    pt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    sx={{ borderColor: "#334155" }}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AttachMoneyIcon />}
                    sx={{
                      bgcolor: "#4f46e5",
                      "&:hover": { bgcolor: "#4338ca" },
                    }}
                  >
                    Trade
                  </Button>
                </CardContent>
              </DarkCard>
            )}

            {/* Trading Signals */}
            <DarkCard>
          
              <CardContent sx={{ p: 0, maxHeight: 250, overflow: "auto" }}>
                <TradingSignals signals={tradingSignals} />
              </CardContent>
            </DarkCard>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

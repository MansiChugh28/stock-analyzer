import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

interface StockDataItem {
  Date: string;
  RSI_14?: number | null;
  MACD?: number | null;
  MACD_signal?: number | null;
  MACD_hist?: number | null;
  Close?: number | null;
  SMA_20?: number | null;
}

interface TechnicalAnalysisProps {
  stockData: StockDataItem[];
  currentStock: StockDataItem | null;
}

export default function TechnicalAnalysis({ stockData, currentStock }: TechnicalAnalysisProps) {
  return (
    <DarkCard>
      <CardHeader
        title="Technical Analysis"
        subheader="Key indicators and oscillators"
        sx={{ pb: 1 }}
        subheaderTypographyProps={{ color: "text.secondary" }}
      />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              RSI (14)
            </Typography>
            <Box sx={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
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
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickLine={{ stroke: "#4b5563" }}
                    axisLine={{ stroke: "#4b5563" }}
                    minTickGap={30}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickLine={{ stroke: "#4b5563" }}
                    axisLine={{ stroke: "#4b5563" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="RSI_14"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    dataKey={() => 70}
                    stroke="#ef4444"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                  <Line
                    dataKey={() => 30}
                    stroke="#22c55e"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              MACD
            </Typography>
            <Box sx={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
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
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickLine={{ stroke: "#4b5563" }}
                    axisLine={{ stroke: "#4b5563" }}
                    minTickGap={30}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    tickLine={{ stroke: "#4b5563" }}
                    axisLine={{ stroke: "#4b5563" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="MACD"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="MACD_signal"
                    stroke="#ec4899"
                    strokeWidth={1.5}
                    dot={false}
                  />
                  <Bar
                    dataKey="MACD_hist"
                    fill="#6366f1"
                    radius={[2, 2, 0, 0]}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <StatsCard>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                RSI (14)
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {currentStock?.RSI_14 !== undefined && currentStock.RSI_14 !== null
                  ? parseFloat(currentStock.RSI_14.toString()).toFixed(3)
                  : "N/A"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color:
                    currentStock?.RSI_14 !== undefined &&
                    currentStock.RSI_14 !== null &&
                    currentStock.RSI_14 < 30
                      ? "#22c55e"
                      : currentStock?.RSI_14 !== undefined &&
                        currentStock.RSI_14 !== null &&
                        currentStock.RSI_14 > 70
                      ? "#ef4444"
                      : "text.secondary",
                }}
              >
                {currentStock?.RSI_14 !== undefined &&
                currentStock.RSI_14 !== null &&
                currentStock.RSI_14 < 30
                  ? "Oversold"
                  : currentStock?.RSI_14 !== undefined &&
                    currentStock.RSI_14 !== null &&
                    currentStock.RSI_14 > 70
                  ? "Overbought"
                  : "Neutral"}
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={4}>
            <StatsCard>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                MACD
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {currentStock?.MACD !== undefined && currentStock.MACD !== null
                  ? parseFloat(currentStock.MACD.toString()).toFixed(3)
                  : "N/A"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color:
                    currentStock?.MACD !== undefined &&
                    currentStock?.MACD_signal !== undefined &&
                    currentStock.MACD !== null &&
                    currentStock.MACD_signal !== null &&
                    currentStock.MACD > currentStock.MACD_signal
                      ? "#22c55e"
                      : "#ef4444",
                }}
              >
                {currentStock?.MACD !== undefined &&
                currentStock?.MACD_signal !== undefined &&
                currentStock.MACD !== null &&
                currentStock.MACD_signal !== null &&
                currentStock.MACD > currentStock.MACD_signal
                  ? "Bullish"
                  : "Bearish"}
              </Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={4}>
            <StatsCard>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Moving Averages
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {currentStock?.Close !== undefined &&
                currentStock?.SMA_20 !== undefined &&
                currentStock.Close !== null &&
                currentStock.SMA_20 !== null &&
                currentStock.Close > currentStock.SMA_20
                  ? "Above"
                  : "Below"}{" "}
                SMA20
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color:
                    currentStock?.Close !== undefined &&
                    currentStock?.SMA_20 !== undefined &&
                    currentStock.Close !== null &&
                    currentStock.SMA_20 !== null &&
                    currentStock.Close > currentStock.SMA_20
                      ? "#22c55e"
                      : "#ef4444",
                }}
              >
                {currentStock?.Close !== undefined &&
                currentStock?.SMA_20 !== undefined &&
                currentStock.Close !== null &&
                currentStock.SMA_20 !== null &&
                currentStock.Close > currentStock.SMA_20
                  ? "Bullish"
                  : "Bearish"}{" "}
                Signal
              </Typography>
            </StatsCard>
          </Grid>
        </Grid>
      </CardContent>
    </DarkCard>
  );
} 
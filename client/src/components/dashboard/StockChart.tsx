import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Tooltip as MuiTooltip,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";

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
  Open: number | null;
  High: number | null;
  Low: number | null;
  Close: number | null;
  Volume: number | null;
  SMA_20?: number | null;
}

interface StockChartProps {
  stockData: StockDataItem[];
  currentStock: StockDataItem | null;
  selectedSymbol: string | null;
  timeframe: string;
  chartType: string;
  loading: boolean;
  onTimeframeChange: (event: React.SyntheticEvent, newValue: string) => void;
  onChartTypeChange: (event: any) => void;
}

export default function StockChart({
  stockData,
  currentStock,
  selectedSymbol,
  timeframe,
  chartType,
  loading,
  onTimeframeChange,
  onChartTypeChange,
}: StockChartProps) {
  const formatNumber = (num: number): string => {
    const floatNum = parseFloat(num.toString());
    if (floatNum >= 1000000) {
      return (floatNum / 1000000).toFixed(3) + "M";
    } else if (floatNum >= 1000) {
      return (floatNum / 1000).toFixed(3) + "K";
    }
    return floatNum.toFixed(3);
  };

  return (
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
            onChange={onTimeframeChange}
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
              onChange={onChartTypeChange}
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
          <Grid item xs={3}>
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
          <Grid item xs={3}>
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
          <Grid item xs={3}>
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
          <Grid item xs={3}>
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
  );
} 
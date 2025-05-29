import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FiberManualRecord as FiberManualRecordIcon } from "@mui/icons-material";

const DarkCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  backgroundColor: "#1a1a2e",
  color: "#ffffff",
  borderRadius: theme.shape.borderRadius,
}));

interface StockDataItem {
  Date: string;
  Volume: number | null;
}

interface VolumeAnalysisProps {
  stockData: StockDataItem[];
  selectedSymbol: string | null;
}

export default function VolumeAnalysis({ stockData, selectedSymbol }: VolumeAnalysisProps) {
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
        title="Volume Analysis"
        subheader="Trading volume patterns"
        sx={{ pb: 1 }}
        subheaderTypographyProps={{ color: "text.secondary" }}
      />
      <CardContent>
        <Box sx={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  borderColor: "#374151",
                  fontSize: "0.75rem",
                }}
                formatter={(value: number | string) => [
                  formatNumber(Number(value)),
                  "Volume",
                ]}
              />
              <Bar
                dataKey="Volume"
                fill="#6366f1"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Volume Insights
          </Typography>
          <Paper
            sx={{
              bgcolor: "#16213e",
              p: 1.5,
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" sx={{ mb: 1 }}>
              {selectedSymbol} is showing{" "}
              {Math.random() > 0.5 ? "above" : "below"} average volume
              today, indicating
              {Math.random() > 0.5 ? " increased" : " decreased"}{" "}
              investor interest.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FiberManualRecordIcon
                sx={{ fontSize: 8, mr: 0.5, color: "#6366f1" }}
              />
              <Typography
                variant="caption"
                sx={{ color: "text.secondary" }}
              >
                Updated 5 minutes ago
              </Typography>
            </Box>
          </Paper>
        </Box>
      </CardContent>
    </DarkCard>
  );
} 
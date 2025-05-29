import {
  Box,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";

const DarkCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  backgroundColor: "#1a1a2e",
  color: "#ffffff",
  borderRadius: theme.shape.borderRadius,
}));

interface TradingSignal {
  id: number;
  symbol: string;
  signal: string;
  confidence: number;
  reason: string;
}

interface TradingSignalsProps {
  signals: TradingSignal[];
}

export default function TradingSignals({ signals }: TradingSignalsProps) {
  return (
    <DarkCard>
      <CardHeader
        title="Trading Signals"
        subheader="AI-powered market insights"
        sx={{ pb: 1 }}
        subheaderTypographyProps={{ color: "text.secondary" }}
      />
      <CardContent sx={{ p: 0, maxHeight: 250, overflow: "auto" }}>
        {signals.map((signal) => (
          <Box
            key={signal.id}
            sx={{
              p: 1.5,
              borderBottom: "1px solid #1e293b",
              "&:last-child": {
                borderBottom: "none",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {signal.symbol}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor:
                    signal.signal === "Buy" || signal.signal === "Strong Buy"
                      ? "#22c55e"
                      : signal.signal === "Sell" || signal.signal === "Strong Sell"
                      ? "#f59e0b"
                      : "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                {signal.signal}
              </Box>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 1,
              }}
            >
              {signal.reason}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                Confidence
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {signal.confidence}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={signal.confidence}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  bgcolor:
                    signal.confidence > 80
                      ? "#22c55e"
                      : signal.confidence > 60
                      ? "#f59e0b"
                      : "#ef4444",
                },
              }}
            />
          </Box>
        ))}
      </CardContent>
    </DarkCard>
  );
} 
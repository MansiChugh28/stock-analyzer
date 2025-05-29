import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { AccessTime as AccessTimeIcon } from "@mui/icons-material";

const DarkCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  backgroundColor: "#1a1a2e",
  color: "#ffffff",
  borderRadius: theme.shape.borderRadius,
}));

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  url: string;
}

interface MarketNewsProps {
  news: NewsItem[];
}

export default function MarketNews({ news }: MarketNewsProps) {
  return (
    <DarkCard>
      <CardHeader
        title="Market News"
        subheader="Latest updates from the markets"
        sx={{ pb: 1 }}
        subheaderTypographyProps={{ color: "text.secondary" }}
      />
      <CardContent sx={{ p: 0, maxHeight: 250, overflow: "auto" }}>
        {news.length > 0 ? (
          news.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderBottom: "1px solid #1e293b",
                "&:last-child": {
                  borderBottom: "none",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#818cf8" },
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  maxWidth: "400px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.3,
                }}
                onClick={() => window.open(item.url, "_blank")}
              >
                {item.title}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 0.5,
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {item.source}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.disabled",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                  {item.time}
                </Typography>
              </Box>
            </Box>
          ))
        ) : (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Loading news...
            </Typography>
          </Box>
        )}
      </CardContent>
    </DarkCard>
  );
} 
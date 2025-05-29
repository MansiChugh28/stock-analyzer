import  { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PortfolioItem {
  symbol: string;
  total_shares: number;
  total_investment: number;
  average_cost: number;
  purchases: {
    date: string;
    shares: number;
    price: number;
    total: number;
  }[];
  currentPrice?: number;
  pl?: number;
  plPercent?: number;
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStock, setEditingStock] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    shares: '',
    purchasePrice: '',
    purchaseDate: '',
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_AWS_API_URL}/portfolio`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      const portfolioData = response.data.portfolio;
      
      // Fetch current prices for each stock
      const portfolioWithPrices = await Promise.all(
        portfolioData.map(async (item: PortfolioItem) => {
          try {
            const stockResponse = await axios.get(`${import.meta.env.VITE_LOCAL_API_URL}/api/stock/${item.symbol}`);
            const stockData = stockResponse.data;
            
            // Get the latest price from the data array
            const latestData = stockData.data[stockData.data.length - 1];
            const currentPrice = latestData.Close;
            
            // Calculate profit/loss
            const pl = (currentPrice - item.average_cost) * item.total_shares;
            const plPercent = ((currentPrice - item.average_cost) / item.average_cost) * 100;
            
            return {
              ...item,
              currentPrice,
              pl,
              plPercent,
            };
          } catch (error) {
            console.error(`Error fetching price for ${item.symbol}:`, error);
            return item;
          }
        })
      );
      
      setPortfolio(portfolioWithPrices);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Please log in to view your portfolio');
        } else {
          setError('Failed to fetch portfolio data. Please try again later.');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const handleOpenDialog = (stock?: PortfolioItem) => {
    if (stock) {
      setEditingStock(stock);
      setFormData({
        symbol: stock.symbol,
        shares: stock.total_shares.toString(),
        purchasePrice: stock.average_cost.toString(),
        purchaseDate: stock.purchases[0].date,
      });
    } else {
      setEditingStock(null);
      setFormData({
        symbol: '',
        shares: '',
        purchasePrice: '',
        purchaseDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStock(null);
    setFormData({
      symbol: '',
      shares: '',
      purchasePrice: '',
      purchaseDate: '',
    });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      // Validate form data
      if (!formData.symbol || !formData.shares || !formData.purchasePrice || !formData.purchaseDate) {
        setError('Please fill in all fields');
        return;
      }

      // Convert and validate numeric values
      const shares = Number(formData.shares);
      const purchasePrice = Number(formData.purchasePrice);

      if (isNaN(shares) || isNaN(purchasePrice)) {
        setError('Please enter valid numbers for shares and purchase price');
        return;
      }

      if (shares <= 0 || purchasePrice <= 0) {
        setError('Shares and purchase price must be greater than 0');
        return;
      }

      const data = {
        symbol: formData.symbol.toUpperCase(),
        shares: shares,
        purchasePrice: purchasePrice,
        purchaseDate: formData.purchaseDate
      };

      if (editingStock) {
        await axios.put(`${import.meta.env.VITE_AWS_API_URL}/portfolio/${editingStock.symbol}`, data, {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_AWS_API_URL}/portfolio`, data, {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });
      }

      handleCloseDialog();
      fetchPortfolio();
    } catch (error) {
      console.error('Error saving stock:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError('Please log in to manage your portfolio');
        } else if (error.response?.status === 400) {
          setError(error.response.data.error || 'Invalid stock data');
        } else if (error.response?.status === 404) {
          setError('Stock not found in portfolio');
        } else {
          setError('Failed to save stock. Please try again later.');
        }
      }
    }
  };

  const handleDelete = async (symbol: string) => {
    if (window.confirm('Are you sure you want to remove this stock from your portfolio?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_AWS_API_URL}/portfolio/${symbol}`, {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });
        fetchPortfolio();
      } catch (error) {
        console.error('Error deleting stock:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setError('Please log in to manage your portfolio');
          } else if (error.response?.status === 404) {
            setError('Stock not found in portfolio');
          } else {
            setError('Failed to delete stock. Please try again later.');
          }
        }
      }
    }
  };

  const handleStockClick = (symbol: string) => {
    navigate(`/dashboard/${symbol}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          My Portfolio
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#4f46e5',
            '&:hover': { bgcolor: '#4338ca' },
          }}
        >
          Add Stock
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading portfolio...</Typography>
      ) : portfolio.length === 0 ? (
        <Card sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your portfolio is empty
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Start by adding your first stock to track your investments
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: '#4f46e5',
                '&:hover': { bgcolor: '#4338ca' },
              }}
            >
              Add Your First Stock
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Symbol</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>Shares</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>Purchase Price</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>Current Price</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>P/L</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.map((stock) => (
                <TableRow
                  key={stock.symbol}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)', cursor: 'pointer' },
                  }}
                  onClick={() => handleStockClick(stock.symbol)}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {stock.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{stock.total_shares}</TableCell>
                  <TableCell align="right">${stock.average_cost?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell align="right">
                    ${stock.currentPrice?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        color: stock.pl && stock.pl >= 0 ? '#22c55e' : '#ef4444',
                        fontFamily: 'monospace',
                      }}
                    >
                      {stock.pl ? `$${stock.pl.toFixed(2)}` : 'N/A'}
                      {stock.plPercent && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{ display: 'block', color: 'inherit' }}
                        >
                          {stock.plPercent >= 0 ? '+' : ''}
                          {stock.plPercent.toFixed(2)}%
                        </Typography>
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(stock);
                        }}
                        sx={{ color: 'text.secondary' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(stock.symbol);
                        }}
                        sx={{ color: 'text.secondary' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
          {editingStock ? 'Edit Stock' : 'Add New Stock'}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              fullWidth
              required
              error={submitted && !formData.symbol}
              helperText={submitted && !formData.symbol ? 'Symbol is required' : ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root': { color: '#9ca3af' },
              }}
            />
            <TextField
              label="Shares"
              type="number"
              value={formData.shares}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, shares: value });
                }
              }}
              fullWidth
              required
              error={submitted && (!formData.shares || Number(formData.shares) <= 0)}
              helperText={submitted && (!formData.shares ? 'Shares is required' : Number(formData.shares) <= 0 ? 'Shares must be greater than 0' : '')}
              inputProps={{ min: "0", step: "1" }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root': { color: '#9ca3af' },
              }}
            />
            <TextField
              label="Purchase Price"
              type="number"
              value={formData.purchasePrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setFormData({ ...formData, purchasePrice: value });
                }
              }}
              fullWidth
              required
              error={submitted && (!formData.purchasePrice || Number(formData.purchasePrice) <= 0)}
              helperText={submitted && (!formData.purchasePrice ? 'Purchase price is required' : Number(formData.purchasePrice) <= 0 ? 'Price must be greater than 0' : '')}
              inputProps={{ min: "0", step: "0.01" }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root': { color: '#9ca3af' },
              }}
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              fullWidth
              required
              error={submitted && !formData.purchaseDate}
              helperText={submitted && !formData.purchaseDate ? 'Purchase date is required' : ''}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': { borderColor: '#334155' },
                  '&:hover fieldset': { borderColor: '#475569' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
                '& .MuiInputLabel-root': { color: '#9ca3af' },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#9ca3af' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.symbol || !formData.shares || !formData.purchasePrice || !formData.purchaseDate}
            sx={{
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#4338ca' },
            }}
          >
            {editingStock ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface StockSymbol {
  symbol: string;
  name: string;
  sector: string;
  latest_price?: string;
  price_change_percent?: string;
}

interface WatchlistItem {
  symbol: string;
  latest_price: string;
  price_change_percent: string;
}

interface StockSymbolsManagerProps {
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string | null;
}

const StockSymbolsManager: React.FC<StockSymbolsManagerProps> = ({ onSymbolSelect, selectedSymbol }) => {
  const [symbols, setSymbols] = useState<StockSymbol[]>([]);
  const [open, setOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      // First fetch the symbols
      const response = await axios.get(`${import.meta.env.VITE_AWS_API_URL}/stock-symbols`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      const fetchedSymbols: StockSymbol[] = response.data.symbols || [];
      
      // Auto-select the first symbol if the selectedSymbol is null and there are symbols
      if (selectedSymbol === null && fetchedSymbols.length > 0) {
        onSymbolSelect(fetchedSymbols[0].symbol);
      }

      // Then fetch the latest prices if we have symbols
      if (fetchedSymbols.length > 0) {
        const symbolsList = fetchedSymbols.map(s => s.symbol);
        const params = new URLSearchParams();
        symbolsList.forEach(symbol => {
          params.append('symbols[]', symbol);
        });

        const watchlistResponse = await axios.get<{ watchlist: WatchlistItem[] }>(`${import.meta.env.VITE_LOCAL_API_URL}/api/watchlist`, {
          params
        });

        if (watchlistResponse.data && watchlistResponse.data.watchlist) {
          const updatedSymbols = fetchedSymbols.map(symbol => {
            const updatedData = watchlistResponse.data.watchlist.find(
              (item) => item.symbol === symbol.symbol
            );
            return {
              ...symbol,
              latest_price: updatedData?.latest_price?.replace('$', '') || 'N/A',
              price_change_percent: updatedData?.price_change_percent?.replace('%', '') || '0.00'
            };
          });
          setSymbols(updatedSymbols);
        } else {
          setSymbols(fetchedSymbols);
        }
      } else {
        setSymbols(fetchedSymbols);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
    }
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) {
      fetchData();
      // Refresh data every minute
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.token, fetchData]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewSymbol('');
    setNewName('');
    setNewSector('');
    setError(null);
  };

  const handleAddSymbol = async () => {
    if (!newSymbol.trim() || !newName.trim()) {
      setError('Symbol and name are required');
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_AWS_API_URL}/stock-symbols`, 
        { 
          symbol: newSymbol.toUpperCase(),
          name: newName,
          sector: newSector || 'Unknown'
        },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        }
      );
      await fetchData();
      handleClose();
    } catch (error) {
      console.error('Error adding symbol:', error);
      setError('Failed to add symbol');
    }
  };

  const handleRemoveSymbol = async (symbol: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_AWS_API_URL}/stock-symbols/${symbol}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      await fetchData();
    } catch (error) {
      console.error('Error removing symbol:', error);
      setError('Failed to remove symbol');
    }
  };

  const formatPriceChange = (change: string | undefined) => {
    if (!change) return '0.00%';
    const numChange = parseFloat(change);
    if (isNaN(numChange)) return '0.00%';
    return `${numChange >= 0 ? '+' : ''}${numChange.toFixed(2)}%`;
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Watchlist</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          size="small"
        >
          Add Symbol
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ bgcolor: '#1a1a2e', color: '#ffffff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #4b5563' }}>Symbol</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #4b5563' }}>Name</TableCell>
              <TableCell sx={{ color: '#9ca3af', borderBottom: '1px solid #4b5563' }}>Sector</TableCell>
              <TableCell align="right" sx={{ color: '#9ca3af', borderBottom: '1px solid #4b5563' }}>Price</TableCell>
              <TableCell align="right" sx={{ color: '#9ca3af', borderBottom: '1px solid #4b5563' }}>Change</TableCell>
              <TableCell align="right" sx={{ color: '#9ca3af', borderBottom: '1px solid #4b5563' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {symbols.map((symbol) => (
              <TableRow
                key={symbol.symbol}
                hover
                onClick={() => onSymbolSelect(symbol.symbol)}
               selected={symbol.symbol ===  selectedSymbol}
                sx={{
                  cursor: 'pointer',
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&.Mui-selected': {
                    backgroundColor: '#2d3748 !important',
                  },
                }}
              >
                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #1e293b' }}>{symbol.symbol}</TableCell>
                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #1e293b' }}>{symbol.name}</TableCell>
                <TableCell sx={{ color: '#ffffff', borderBottom: '1px solid #1e293b' }}>{symbol.sector}</TableCell>
                <TableCell align="right" sx={{ color: '#ffffff', borderBottom: '1px solid #1e293b' }}>
                  {symbol.latest_price ? `$${parseFloat(symbol.latest_price).toFixed(2)}` : 'N/A'}
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #1e293b' }}>
                  <Typography
                    sx={{
                      color: symbol.price_change_percent && parseFloat(symbol.price_change_percent) >= 0 ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {formatPriceChange(symbol.price_change_percent)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #1e293b' }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSymbol(symbol.symbol);
                    }}
                  >
                    <DeleteIcon fontSize="small" sx={{ color: '#9ca3af' }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Stock Symbol</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Symbol"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              fullWidth
            />
            <TextField
              label="Company Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Sector"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddSymbol} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockSymbolsManager; 
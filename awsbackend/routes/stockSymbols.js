const express = require("express");
const router = express.Router();
const stockSymbolsController = require("../controllers/stockSymbolsController");
const authMiddleware = require("../middleware/auth");

// All routes are protected
router.use(authMiddleware);

// Get user's stock symbols
router.get("/", stockSymbolsController.getSymbols);

// Add a new stock symbol
router.post("/", stockSymbolsController.addSymbol);

// Remove a stock symbol
router.delete("/:symbol", stockSymbolsController.removeSymbol);

module.exports = router;

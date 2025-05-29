const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const portfolioController = require("../controllers/portfolioController");
const {
  QueryCommand,
  PutCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

// Get user's portfolio
router.get("/", authenticateToken, portfolioController.getUserPortfolio);

// Add stock to portfolio
router.post("/", authenticateToken, portfolioController.addStockToPortfolio);

// Update stock in portfolio
router.put(
  "/:symbol",
  authenticateToken,
  portfolioController.updateStockInPortfolio
);

// Delete stock from portfolio
router.delete(
  "/:symbol",
  authenticateToken,
  portfolioController.deleteStockFromPortfolio
);

// Get portfolio item by symbol
router.get(
  "/:symbol",
  authenticateToken,
  portfolioController.getPortfolioItemBySymbol
);

// Buy stock
router.post("/:symbol/buy", authenticateToken, portfolioController.buyStock);

// Sell stock
router.post("/:symbol/sell", authenticateToken, portfolioController.sellStock);

module.exports = router;

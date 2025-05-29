const {
  QueryCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { SendCommand } = require("@aws-sdk/client-dynamodb");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");

const PORTFOLIO_TABLE = process.env.PORTFOLIO_TABLE;

// Get user's portfolio
const getUserPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const params = {
      TableName: PORTFOLIO_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    };

    const command = new QueryCommand(params);
    const result = await req.dynamoDB.send(command);

    if (!result.Items || result.Items.length === 0) {
      return res.json({ portfolio: [] });
    }

    // Group by symbol and calculate totals
    const portfolioMap = result.Items.reduce((acc, item) => {
      // Extract the base symbol from the composite key (remove timestamp part)
      const baseSymbol = item.symbol.split("#")[0];

      if (!acc[baseSymbol]) {
        acc[baseSymbol] = {
          symbol: baseSymbol,
          total_shares: 0,
          total_investment: 0,
          purchases: [],
        };
      }

      acc[baseSymbol].total_shares += item.shares;
      acc[baseSymbol].total_investment += item.shares * item.purchasePrice;
      acc[baseSymbol].purchases.push({
        date: item.purchaseDate,
        shares: item.shares,
        price: item.purchasePrice,
        total: item.shares * item.purchasePrice,
      });

      return acc;
    }, {});

    const portfolio = Object.values(portfolioMap).map((item) => ({
      ...item,
      average_cost: item.total_investment / item.total_shares,
    }));

    res.json({ portfolio });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    res.status(500).json({ error: "Failed to fetch portfolio" });
  }
};

const addStockToPortfolio = async (req, res) => {
  try {
    const { symbol, shares, purchasePrice, purchaseDate } = req.body;
    const userId = req.user.id;

    if (!symbol || !shares || !purchasePrice || !purchaseDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate numeric values
    const numericShares = Number(shares);
    const numericPrice = Number(purchasePrice);

    if (isNaN(numericShares) || isNaN(numericPrice)) {
      return res.status(400).json({ error: "Invalid numeric values" });
    }

    const timestamp = new Date().toISOString();
    const compositeSymbol = `${symbol}#${timestamp}`;

    const params = {
      TableName: PORTFOLIO_TABLE,
      Item: {
        userId,
        symbol: compositeSymbol,
        shares: numericShares,
        purchasePrice: numericPrice,
        purchaseDate,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    const command = new PutCommand(params);
    await req.dynamoDB.send(command);

    res.json({ message: "Stock added to portfolio", purchase: params.Item });
  } catch (error) {
    console.error("Error adding stock to portfolio:", error);
    res.status(500).json({ error: "Failed to add stock to portfolio" });
  }
};

// Update stock in portfolio
const updateStockInPortfolio = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { shares, purchasePrice, purchaseDate } = req.body;
    const userId = req.user.id;

    if (!shares || !purchasePrice || !purchaseDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate numeric values
    const numericShares = Number(shares);
    const numericPrice = Number(purchasePrice);

    if (isNaN(numericShares) || isNaN(numericPrice)) {
      return res.status(400).json({ error: "Invalid numeric values" });
    }

    // First, get current portfolio
    const getParams = {
      TableName: PORTFOLIO_TABLE,
      KeyConditionExpression:
        "userId = :userId AND begins_with(symbol, :symbol)",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":symbol": symbol + "#",
      },
    };

    const getCommand = new QueryCommand(getParams);
    const result = await req.dynamoDB.send(getCommand);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: "No portfolio found for symbol" });
    }

    // Add new purchase record with composite key
    const timestamp = new Date().toISOString();
    const compositeSymbol = `${symbol}#${timestamp}`;

    const params = {
      TableName: PORTFOLIO_TABLE,
      Item: {
        userId,
        symbol: compositeSymbol,
        shares: numericShares,
        purchasePrice: numericPrice,
        purchaseDate,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    };

    const command = new PutCommand(params);
    await req.dynamoDB.send(command);

    res.json({ message: "Portfolio updated", purchase: params.Item });
  } catch (error) {
    console.error("Error updating portfolio:", error);
    res.status(500).json({ error: "Failed to update portfolio" });
  }
};

// Delete stock from portfolio
const deleteStockFromPortfolio = async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.user.id;

    const params = {
      TableName: PORTFOLIO_TABLE,
      KeyConditionExpression: "userId = :userId AND symbol = :symbol",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":symbol": symbol,
      },
    };

    const queryCommand = new QueryCommand(params);
    const result = await req.dynamoDB.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: "No portfolio found for symbol" });
    }

    // Delete all records for this symbol
    for (const item of result.Items) {
      const deleteParams = {
        TableName: PORTFOLIO_TABLE,
        Key: {
          userId: item.userId,
          symbol: item.symbol,
        },
      };
      const deleteCommand = new DeleteCommand(deleteParams);
      await req.dynamoDB.send(deleteCommand);
    }

    res.json({ message: "Stock removed from portfolio" });
  } catch (error) {
    console.error("Error deleting from portfolio:", error);
    res.status(500).json({ error: "Failed to delete from portfolio" });
  }
};

// Get portfolio item by symbol
const getPortfolioItemBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.user.id;

    const params = {
      TableName: PORTFOLIO_TABLE,
      KeyConditionExpression:
        "userId = :userId AND begins_with(symbol, :symbol)",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":symbol": symbol + "#",
      },
    };

    const command = new QueryCommand(params);
    const result = await req.dynamoDB.send(command);

    if (!result.Items || result.Items.length === 0) {
      return res.json({
        symbol,
        purchases: [],
        total_shares: 0,
        average_cost: 0,
        total_investment: 0,
        current_value: 0,
        profit_loss: 0,
        profit_loss_percentage: 0,
      });
    }

    // Calculate totals from all purchases
    const portfolio = result.Items.reduce(
      (acc, item) => {
        acc.total_shares += item.shares;
        acc.total_investment += item.shares * item.purchasePrice;
        acc.purchases.push({
          date: item.purchaseDate,
          shares: item.shares,
          price: item.purchasePrice,
          total: item.shares * item.purchasePrice,
        });
        return acc;
      },
      {
        symbol,
        total_shares: 0,
        total_investment: 0,
        purchases: [],
      }
    );

    return res.json({
      ...portfolio,
      average_cost:
        portfolio.total_shares > 0
          ? portfolio.total_investment / portfolio.total_shares
          : 0,
      current_value: 0, // This will be calculated in the frontend
      profit_loss: 0, // This will be calculated in the frontend
      profit_loss_percentage: 0, // This will be calculated in the frontend
    });
  } catch (error) {
    console.error("Error fetching portfolio item:", error);
    res.status(500).json({ error: "Failed to fetch portfolio item" });
  }
};

// Buy stock
const buyStock = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { shares, price } = req.body;
    const userId = req.user.id;

    const params = {
      TableName: PORTFOLIO_TABLE,
      Item: {
        userId,
        symbol,
        shares: Number(shares),
        purchasePrice: Number(price),
        purchaseDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const command = new PutCommand(params);
    await req.dynamoDB.send(command);

    res.json({ message: "Purchase successful", purchase: params.Item });
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ error: "Failed to process purchase" });
  }
};

// Sell stock
const sellStock = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { shares, price } = req.body;
    const userId = req.user.id;

    // First, get current portfolio
    const getParams = {
      TableName: PORTFOLIO_TABLE,
      KeyConditionExpression: "userId = :userId AND symbol = :symbol",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":symbol": symbol,
      },
    };

    const getCommand = new QueryCommand(getParams);
    const result = await req.dynamoDB.send(getCommand);

    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ error: "No portfolio found for symbol" });
    }

    // Calculate total shares
    const totalShares = result.Items.reduce(
      (sum, item) => sum + item.shares,
      0
    );
    if (totalShares < shares) {
      return res.status(400).json({ error: "Not enough shares to sell" });
    }

    // Add sale as negative purchase
    const params = {
      TableName: PORTFOLIO_TABLE,
      Item: {
        userId,
        symbol,
        shares: -Number(shares),
        purchasePrice: Number(price),
        purchaseDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const command = new PutCommand(params);
    await req.dynamoDB.send(command);

    res.json({ message: "Sale successful", sale: params.Item });
  } catch (error) {
    console.error("Error processing sale:", error);
    res.status(500).json({ error: "Failed to process sale" });
  }
};

module.exports = {
  getUserPortfolio,
  addStockToPortfolio,
  updateStockInPortfolio,
  deleteStockFromPortfolio,
  getPortfolioItemBySymbol,
  buyStock,
  sellStock,
};

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
require("dotenv").config();

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;

const stockSymbolsController = {
  async getSymbols(req, res) {
    try {
      const { id } = req.user;

      const params = {
        TableName: USERS_TABLE,
        Key: {
          id,
        },
      };

      const command = new GetCommand(params);
      const { Item } = await docClient.send(command);

      if (!Item) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user's stock symbols or empty array if none exist
      res.json({ symbols: Item.stockSymbols || [] });
    } catch (error) {
      console.error("Get symbols error:", error);
      res.status(500).json({ error: "Could not retrieve symbols" });
    }
  },

  // Add a new stock symbol
  async addSymbol(req, res) {
    try {
      const { id } = req.user;
      const { symbol, name, sector } = req.body;

      if (!symbol || !name) {
        return res.status(400).json({ error: "Symbol and name are required" });
      }

      // Get current user data
      const getParams = {
        TableName: USERS_TABLE,
        Key: { id },
      };

      const getCommand = new GetCommand(getParams);
      const { Item } = await docClient.send(getCommand);

      if (!Item) {
        return res.status(404).json({ error: "User not found" });
      }

      // Initialize stockSymbols array if it doesn't exist
      const currentSymbols = Item.stockSymbols || [];

      // Check if symbol already exists
      if (currentSymbols.some((s) => s.symbol === symbol)) {
        return res.status(400).json({ error: "Symbol already exists" });
      }

      // Add new symbol
      const newSymbol = {
        symbol,
        name,
        sector: sector || "Unknown",
        addedAt: new Date().toISOString(),
      };

      const updateParams = {
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression:
          "SET stockSymbols = list_append(if_not_exists(stockSymbols, :empty_list), :new_symbol)",
        ExpressionAttributeValues: {
          ":new_symbol": [newSymbol],
          ":empty_list": [],
        },
        ReturnValues: "ALL_NEW",
      };

      const updateCommand = new UpdateCommand(updateParams);
      const { Attributes } = await docClient.send(updateCommand);

      res.json({ symbols: Attributes.stockSymbols });
    } catch (error) {
      console.error("Add symbol error:", error);
      res.status(500).json({ error: "Could not add symbol" });
    }
  },

  // Remove a stock symbol
  async removeSymbol(req, res) {
    try {
      const { id } = req.user;
      const { symbol } = req.params;

      if (!symbol) {
        return res.status(400).json({ error: "Symbol is required" });
      }

      // Get current user data
      const getParams = {
        TableName: USERS_TABLE,
        Key: { id },
      };

      const getCommand = new GetCommand(getParams);
      const { Item } = await docClient.send(getCommand);

      if (!Item) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentSymbols = Item.stockSymbols || [];
      const updatedSymbols = currentSymbols.filter((s) => s.symbol !== symbol);

      if (updatedSymbols.length === currentSymbols.length) {
        return res.status(404).json({ error: "Symbol not found" });
      }

      const updateParams = {
        TableName: USERS_TABLE,
        Key: { id },
        UpdateExpression: "SET stockSymbols = :symbols",
        ExpressionAttributeValues: {
          ":symbols": updatedSymbols,
        },
        ReturnValues: "ALL_NEW",
      };

      const updateCommand = new UpdateCommand(updateParams);
      const { Attributes } = await docClient.send(updateCommand);

      res.json({ symbols: Attributes.stockSymbols });
    } catch (error) {
      console.error("Remove symbol error:", error);
      res.status(500).json({ error: "Could not remove symbol" });
    }
  },
};

module.exports = stockSymbolsController;

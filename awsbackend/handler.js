const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
const authRoutes = require("./routes/auth");
const stockSymbolsRoutes = require("./routes/stockSymbols");
const portfolioRoutes = require("./routes/portfolioRoutes");

const app = express();

// Configure AWS SDK v3 with default credentials
const client = new DynamoDBClient({
  region: "ap-south-1",
});

const dynamoDB = DynamoDBDocumentClient.from(client);

// Middleware
app.use(cors());
app.use(express.json());

// Make dynamoDB available to routes
app.use((req, res, next) => {
  req.dynamoDB = dynamoDB;
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/stock-symbols", stockSymbolsRoutes);
app.use("/portfolio", portfolioRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => {
    console.log("Server is running on port 5000");
  });
}

// Export handler for AWS Lambda
exports.handler = serverless(app);

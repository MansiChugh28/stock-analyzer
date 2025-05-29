const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.USERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

const authController = {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validate input
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const checkParams = {
        TableName: USERS_TABLE,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      };

      const checkCommand = new QueryCommand(checkParams);
      const existingUser = await docClient.send(checkCommand);

      if (existingUser.Items && existingUser.Items.length > 0) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const id = `USER#${Date.now()}`;
      const userParams = {
        TableName: USERS_TABLE,
        Item: {
          id,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };

      const putCommand = new PutCommand(userParams);
      await docClient.send(putCommand);

      // Generate JWT token
      const token = jwt.sign({ id, email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Return user data (excluding password)
      const userData = {
        id,
        email,
        firstName,
        lastName,
        token,
      };

      res.status(201).json(userData);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Could not register user" });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Email and password are required" });
      }

      // Find user by email
      const params = {
        TableName: USERS_TABLE,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      };

      const command = new QueryCommand(params);
      const result = await docClient.send(command);

      if (!result.Items || result.Items.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result.Items[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "24h",
      });

      // Return user data (excluding password)
      const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        token,
      };

      res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Could not login" });
    }
  },

  async getProfile(req, res) {
    try {
      const { id } = req.user; // Set by auth middleware

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

      // Return user data (excluding password)
      const userData = {
        id: Item.id,
        email: Item.email,
        firstName: Item.firstName,
        lastName: Item.lastName,
        createdAt: Item.createdAt,
        updatedAt: Item.updatedAt,
      };

      res.json(userData);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Could not retrieve profile" });
    }
  },
};

module.exports = authController;

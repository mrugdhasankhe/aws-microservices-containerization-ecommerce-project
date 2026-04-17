const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();
app.use(cors());
app.use(express.json());

AWS.config.update({
  region: process.env.AWS_REGION
});

const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;
const USER_ID = "user1";

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Add item to cart
app.post("/api/cart", async (req, res) => {
  try {
    const item = req.body;

    const params = {
      TableName: TABLE_NAME,
      Key: { user_id: USER_ID }
    };

    const existingCart = await dynamo.get(params).promise();

    let items = existingCart.Item?.items || [];

    const existingIndex = items.findIndex(p => p.id === item.id);

    if (existingIndex !== -1) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }

    await dynamo.put({
      TableName: TABLE_NAME,
      Item: {
        user_id: USER_ID,
        items
      }
    }).promise();

    res.json(items);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Get cart
app.get("/api/cart", async (req, res) => {
  try {
    const result = await dynamo.get({
      TableName: TABLE_NAME,
      Key: { user_id: USER_ID }
    }).promise();

    res.json(result.Item?.items || []);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Remove one item
app.delete("/api/cart/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await dynamo.get({
      TableName: TABLE_NAME,
      Key: { user_id: USER_ID }
    }).promise();

    let items = result.Item?.items || [];
    items = items.filter(item => item.id !== id);

    await dynamo.put({
      TableName: TABLE_NAME,
      Item: {
        user_id: USER_ID,
        items
      }
    }).promise();

    res.json(items);
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Clear cart
app.delete("/api/cart", async (req, res) => {
  try {
    await dynamo.put({
      TableName: TABLE_NAME,
      Item: {
        user_id: USER_ID,
        items: []
      }
    }).promise();

    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("DynamoDB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

app.listen(3001, () => {
  console.log("Cart service running on port 3001");
});
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

let pool;

// Health
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { user_id, items, total_amount, status } = req.body;

    const finalUserId = user_id || "user1";
    const finalItems = Array.isArray(items) ? items : [];
    const finalTotal = total_amount || 0;
    const finalStatus = status || "PLACED";

    const [result] = await pool.query(
      "INSERT INTO orders (user_id, items, total_amount, status) VALUES (?, ?, ?, ?)",
      [
        finalUserId,
        JSON.stringify(finalItems),
        finalTotal,
        finalStatus
      ]
    );

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        order_id: result.insertId,
        user_id: finalUserId,
        items: finalItems,
        total_amount: finalTotal,
        status: finalStatus
      }
    });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Safe parser for MySQL JSON column
function normalizeItems(value) {
  if (value == null) return [];

  if (Array.isArray(value)) return value;

  if (Buffer.isBuffer(value)) {
    const text = value.toString("utf8");
    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }

  return [];
}

// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT order_id, user_id, items, total_amount, status FROM orders ORDER BY order_id DESC"
    );

    const formatted = rows.map(order => ({
      ...order,
      items: normalizeItems(order.items)
    }));

    res.json(formatted);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Auto create DB + table
async function start() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id VARCHAR(100) NOT NULL,
        items JSON NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL
      )
    `);

    await connection.end();

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10
    });

    app.listen(3002, () => {
      console.log("Order service running on port 3002");
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
}

start();
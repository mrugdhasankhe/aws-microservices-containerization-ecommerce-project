const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

let pool;

// Health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(rows);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Get one product by id
app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Add product
app.post("/api/products", async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    if (!name || !price || !description || !image) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)",
      [name, price, description, image]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      price,
      description,
      image
    });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// Start app and auto-create DB/table
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
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT NOT NULL,
        image VARCHAR(255) NOT NULL
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

    app.listen(3000, () => {
      console.log("Product service running on port 3000");
    });
  } catch (err) {
    console.error("Startup error:", err);
  }
}

start();
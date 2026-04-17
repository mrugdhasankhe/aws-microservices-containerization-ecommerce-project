const mysql = require("mysql2/promise");

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: "product-db.ckrgo8egscpy.us-east-1.rds.amazonaws.com",
      user: "admin",
      password: "SwamiMrugdha",
      database: "mysql"
    });

    console.log("Connected to RDS successfully");

    const [rows] = await connection.query("SHOW TABLES");
    console.log("Tables:", rows);

    await connection.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

testConnection();
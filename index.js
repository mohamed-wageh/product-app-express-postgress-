const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");

const app = express();
const PORT = 3000; // You can change the port as needed


app.use(bodyParser.json());

// Get all products
app.get("/products", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get a single product by ID
app.get("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);

    if (rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add a new product
app.post("/products", async (req, res) => {
  const { name, price } = req.body;

  try {
    const { rows } = await pool.query(
      "INSERT INTO products (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Edit a product by ID
app.put("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price } = req.body;

  try {
    const { rows } = await pool.query(
      "UPDATE products SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, price, productId]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.patch("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  const updates = req.body;

  try {
    const product = await pool.query("SELECT * FROM products WHERE id = $1", [
      productId,
    ]);

    if (product.rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      const updatedProduct = { ...product.rows[0], ...updates };
      await pool.query(
        "UPDATE products SET name = $1, price = $2 WHERE id = $3",
        [updatedProduct.name, updatedProduct.price, productId]
      );

      res.json(updatedProduct);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a product by ID
app.delete("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);

  try {
    const { rows } = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [productId]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

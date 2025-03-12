const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "driver",
  password: "postgres",
  port: 5432,
});

// Menampilkan semua driver
app.get("/drivers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM driver");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Menampilkan driver berdasarkan ID
app.get("/drivers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM driver WHERE driverid = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Driver not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Menambahkan driver baru
app.post("/drivers", async (req, res) => {
  const { nama, no_telepon, email, password, plat } = req.body;
  try {
    await pool.query(
      "INSERT INTO driver (nama, no_telepon, email, password, plat) VALUES ($1, $2, $3, $4, $5)",
      [nama, no_telepon, email, password, plat]
    );
    res.send("Driver added successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Mengupdate data driver
app.put("/drivers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { nama, no_telepon, email, plat, password } = req.body;
    const result = await pool.query(
      "UPDATE driver SET nama = $1, no_telepon = $2, email = $3, plat = $4, password = $5 WHERE driverid = $6 RETURNING *",
      [nama, no_telepon, email, plat, password, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send("Driver not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Menghapus driver
app.delete("/drivers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM driver WHERE driverid = $1", [id]);
    res.send("Driver deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mySqlPool = require("./config/db");
const path = require("path");
const cors = require("cors"); 
const productsRoute = require("./routes/products");

// config
dotenv.config();

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

//get all products
app.use("/products", productsRoute);

app.listen(4000, () => console.log("User server running on http://localhost:4000"));

// routes
app.use("/api/v1/user", require("./routes/userRoutes"));

// Serve user.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "user.html"));
});

const PORT = process.env.USER_PORT || 4000;

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MySQL connected".bgCyan.white);
    app.listen(PORT, () => {
      console.log(`User Server running on port ${PORT}`.bgMagenta.white);
    });
  })
  .catch((error) => {
    console.log(error);
  });

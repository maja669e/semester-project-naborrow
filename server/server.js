const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// parse requests
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const seededImagesDir = path.join(__dirname, "../src/assets/images");
const uploadedImagesDir = path.join(__dirname, "images");

app.get("/images/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const candidates = [
    path.join(seededImagesDir, fileName),
    path.join(uploadedImagesDir, fileName)
  ];

  const hit = candidates.find((p) => fs.existsSync(p));
  if (!hit) {
    return res.status(404).send({ message: "Image not found" });
  }

  return res.sendFile(hit);
});

// Static images referenced from DB paths like images/example.jpg
// First serve seeded/mock images from src/assets/images, then fallback to server/images
app.use("/images", express.static(seededImagesDir));
app.use("/images", express.static(uploadedImagesDir));

// simple test route
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

const db = require("./models");

// Test DB connection
db.sequelize.authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
  })
  .catch(err => {
    console.error("Unable to connect to DB:", err);
  });

// Sync database
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

require("./routes/item.routes.js")(app);
require("./routes/category.routes")(app);
require("./routes/itemAccessory.routes")(app);
require("./routes/rental.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
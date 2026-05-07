module.exports = app => {
  const rentals = require("../controllers/rental.controller.js");
  const router = require("express").Router();

  // Hent alle udlejninger
  router.get("/", rentals.findAll);

  // Hent én udlejning via ID
  router.get("/:id", rentals.findOne);

  // Opret en ny udlejning
  router.post("/", rentals.create);

  // Opdater en udlejning via ID
  router.put("/:id", rentals.update);

  // Slet én udlejning via ID
  router.delete("/:id", rentals.delete);

  // Slet alle udlejninger
  router.delete("/", rentals.deleteAll);

  app.use("/api/rentals", router);
};

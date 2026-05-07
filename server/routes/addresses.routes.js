module.exports = app => {
  const addresses = require("../controllers/address.controller.js");
  const router = require("express").Router();

  // Hent alle addresses
  router.get("/", addresses.findAll);

  // Hent én address via ID
  router.get("/:id", addresses.findOne);

  // Opdater en address via ID
  router.put("/:id", addresses.update);

  // Slet én address via ID
  router.delete("/:id", addresses.delete);

  // Slet alle addresses
  router.delete("/", addresses.deleteAll);

// Opret en ny address
  router.post("/", addresses.create);


  app.use("/api/addresses", router);
};

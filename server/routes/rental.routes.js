module.exports = app => {
  const rentals = require("../controllers/rental.controller.js");
  const router = require("express").Router();

  // Afslut udløbne lån manuelt — kun til testbrug
  router.post("/complete-expired", rentals.completeExpired);

  // Hent alle udlejninger
  router.get("/", rentals.findAll);
  // Hent alle udlejninger for en specifik låner (renter-perspektiv)
  router.get("/user/:userId", rentals.getByUser);
  // Hent alle udlejninger på genstande ejet af en bruger (udlåner-perspektiv)
  // Skal stå før /:id for at undgå at "owner" matches som et id
  router.get("/owner/:userId", rentals.getByOwner);
  // Hent én udlejning via ID
  router.get("/:id", rentals.findOne);

  // Opret en ny udlejning
  router.post("/", rentals.create);

  // Opdater en udlejning via ID
  router.put("/:id", rentals.update);

  // Skjul ét lån fra én brugers historik (soft delete pr. bruger)
  router.put("/:id/hide", rentals.hide);

  // Slet én udlejning via ID
  router.delete("/:id", rentals.delete);

  // Slet alle udlejninger
  router.delete("/", rentals.deleteAll);
  


  app.use("/api/rentals", router);
};

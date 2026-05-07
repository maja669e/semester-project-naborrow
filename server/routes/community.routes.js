module.exports = app => {
  const communities = require("../controllers/community.controller.js");
  const router = require("express").Router();

  // Hent alle communities
  router.get("/", communities.findAll);

  // Hent én community via ID
  router.get("/:id", communities.findOne);

  // Opdater en community via ID
  router.put("/:id", communities.update);

  // Slet én community via ID
  router.delete("/:id", communities.delete);

  // Slet alle communities
  router.delete("/", communities.deleteAll);

// Opret en ny community
  router.post("/", communities.create);


  app.use("/api/communities", router);
};

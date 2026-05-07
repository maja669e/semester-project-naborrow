module.exports = app => {
  const ratings = require("../controllers/rating.controller.js");
  const router = require("express").Router();

  // Hent alle ratings
  router.get("/", ratings.findAll);

  // Hent én rating via ID
  router.get("/:id", ratings.findOne);

  // Opdater en rating via ID
  router.put("/:id", ratings.update);

  // Slet én rating via ID
  router.delete("/:id", ratings.delete);

  // Slet alle ratings
  router.delete("/", ratings.deleteAll);

// Opret en ny rating
  router.post("/", ratings.create);


  app.use("/api/ratings", router);
};

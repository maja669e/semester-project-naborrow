module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const router = require("express").Router();

    // Hent alle brugere
    router.get("/", users.findAll);

    // Hent én bruger via ID
    router.get("/:id", users.findOne);

    // Opret en ny bruger
    router.post("/", users.create);

    // Opdater en bruger via ID
    router.put("/:id", users.update);

    // Slet én bruger via ID
    router.delete("/:id", users.delete);

  app.use("/api/users", router);
};
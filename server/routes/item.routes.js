module.exports = app => {
  const items = require("../controllers/item.controller.js");
  const router = require("express").Router();

  
  // Retrieve all items
  router.get("/", items.findAll);

  // Retrieve a single item with id
  router.get("/:id", items.findOne);

  // Create a new item
  router.post("/", items.create);

  //Updates an item with id
  router.put("/:id", items.update);

  //Delete an item with id
  router.delete("/:id", items.delete);

  app.use("/api/items", router);
};
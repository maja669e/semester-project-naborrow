module.exports = app => {
  const controller = require("../controllers/rentalRequest.controller");
  const router = require("express").Router();

  router.post("/", controller.create);
  router.get("/", controller.findAll);
  router.get("/owner/:userId/pending-count",controller.getPendingCountByOwner);
  router.get("/owner/:userId/pending",controller.getPendingByOwner);
  //router.put("/:id/accept", controller.accept);
  //router.put("/:id/reject", controller.reject);
  app.use("/api/rentalRequests", router);
};
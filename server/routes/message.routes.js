module.exports = (app) => {
    const messages = require("../controllers/message.controller.js");
    const router = require("express").Router();

    // Hent alle beskeder for et bestemt lån
    router.get("/rental/:rentalId", messages.findByRental);

    // Opret en ny besked
    router.post("/", messages.create);

    // Rediger teksten i en besked
    router.put("/:id", messages.update);

    // Marker en besked som læst
    router.put("/:id/read", messages.markAsRead);

    // Slet én besked
    router.delete("/:id", messages.delete);

    // Slet hele samtalen for et lån
    router.delete("/rental/:rentalId", messages.deleteConversation);

    app.use("/api/messages", router);
};

const db = require("../models");

const Message = db.messages;
const Rental = db.rentals;

// OPRET en ny besked — tjekker først om lånet stadig er aktivt
exports.create = async (req, res) => {
    const { SenderUserID, ReceiverUserID, RentalID, MessageText } = req.body;
    try {
        const rental = await Rental.findByPk(RentalID);
        if (!rental) {
            return res.status(404).send({ message: "Lån ikke fundet med id " + RentalID });
        }
        if (rental.Status === "returned") {
            return res.status(403).send({ message: "Chatten er deaktiveret da lånet er afsluttet" });
        }
        const message = await Message.create({ SenderUserID, ReceiverUserID, RentalID, MessageText });
        res.status(201).send(message);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ALLE beskeder for et bestemt lån
exports.findByRental = async (req, res) => {
    const rentalId = req.params.rentalId;
    try {
        const messages = await Message.findAll({
            where: { RentalID: rentalId }
        });
        res.send(messages);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// REDIGER teksten i en besked — sætter EditedAt til nuværende tidspunkt
exports.update = async (req, res) => {
    const id = req.params.id;
    const { MessageText } = req.body;
    try {
        const [updated] = await Message.update(
            { MessageText, EditedAt: new Date() },
            { where: { MessageID: id } }
        );
        if (updated) {
            const updatedMessage = await Message.findByPk(id);
            res.send(updatedMessage);
        } else {
            res.status(404).send({ message: "Besked ikke fundet med id " + id });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// MARKER en besked som læst
exports.markAsRead = async (req, res) => {
    const id = req.params.id;
    try {
        const [updated] = await Message.update({ IsRead: true }, {
            where: { MessageID: id }
        });
        if (updated) {
            const updatedMessage = await Message.findByPk(id);
            res.send(updatedMessage);
        } else {
            res.status(404).send({ message: "Besked ikke fundet med id " + id });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// SLET én besked
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const deleted = await Message.destroy({
            where: { MessageID: id }
        });
        if (deleted) {
            res.send({ message: "Besked slettet med id " + id });
        } else {
            res.status(404).send({ message: "Besked ikke fundet med id " + id });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// SLET hele samtalen for et lån
exports.deleteConversation = async (req, res) => {
    const rentalId = req.params.rentalId;
    try {
        const deleted = await Message.destroy({
            where: { RentalID: rentalId }
        });
        if (deleted) {
            res.send({ message: "Samtale slettet for lån med id " + rentalId });
        } else {
            res.status(404).send({ message: "Ingen beskeder fundet for lån med id " + rentalId });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

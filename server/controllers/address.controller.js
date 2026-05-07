const db = require("../models");
const Address = db.addresses;

// HENT ALLE addresses
exports.findAll = async (req, res) => {
    try {
        const addresses = await Address.findAll();
        res.send(addresses);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ÉN address via ID
exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const address = await Address.findByPk(id);
        if (!address) {
            return res.status(404).send({ message: "Address ikke fundet med id " + id });
        }
        res.send(address);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


// OPDATER en address via ID
exports.update = async (req, res) => {
    const id = req.params.id;

    try {

        const [num] = await Address.update(req.body, {
            where: { AddressID: id }
        });

        if (num === 1) {
            res.send({
                message: "Address blev opdateret."
            });
        } else {
            res.status(404).send({
                message: `Address med id=${id} blev ikke fundet.`
            });
        }

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

// SLET én address via ID
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const num = await Address.destroy({
            where: { AddressID: id }
        });

        if (num === 1) {
            res.send({ message: "Address blev slettet." });
        } else {
            res.send({ message: `Kunne ikke slette address med id=${id}. Tjek om den eksisterer.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Fejl ved sletning af address med id=" + id });
    }
};

// SLET ALLE addresses
exports.deleteAll = async (req, res) => {
    try {
        const nums = await Address.destroy({
            where: {},
            truncate: false
        });

        res.send({ message: `${nums} addresses blev slettet.` });
    } catch (err) {
        res.status(500).send({ message: err.message || "Fejl ved sletning af alle addresses." });
    }
};

// OPRET en ny address
exports.create = async (req, res) => {
    try {

        const newAddress = await Address.create(req.body);

        res.send(newAddress);

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};
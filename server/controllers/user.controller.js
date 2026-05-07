const db = require("../models");

const User = db.users;

// Opret en ny bruger
exports.create = async (req, res) => {
    try {
        if (!req.body.FirstName || !req.body.LastName || !req.body.Email) {
            return res.status(400).send({ message: "FirstName, LastName og Email er påkrævet." });
        }
        const user = await User.create(req.body);
        res.status(201).send(user);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ALLE brugere
exports.findAll = async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ÉN bruger via ID
exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findByPk(id);
        if (user) {
            res.send(user);
        } else {
            res.status(404).send({ message: "Bruger ikke fundet med id " + id });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// REDIGER en brugers oplysninger
exports.update = async (req, res) => {
    const id = req.params.id;
    try {
        const [updated] = await User.update(req.body, {
            where: { UserID: id }
        });
        if (updated) {
            const updatedUser = await User.findByPk(id);
            res.send(updatedUser);
        } else {
            res.status(404).send({ message: "Bruger ikke fundet med id " + id });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// SLET en bruger
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const deleted = await User.destroy({
            where: { UserID: id }
        });
        if (deleted) {
            res.send({ message: "Bruger slettet med id " + id });
        } else {
            res.status(404).send({ message: "Bruger ikke fundet med id " + id });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};



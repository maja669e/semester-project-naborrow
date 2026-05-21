const bcrypt = require("bcryptjs");
const db = require("../models");

const User = db.users;

// Opret en ny bruger
exports.create = async (req, res) => {
    try {
        if (!req.body.FirstName || !req.body.LastName || !req.body.Email || !req.body.Password) {
            return res.status(400).send({ message: "FirstName, LastName, Email og Password er påkrævet." });
        }

        // Tjek adgangskodestyrke via MySQL VALIDATE_PASSWORD_STRENGTH()
        const [styrkeResultat] = await db.sequelize.query(
            "SELECT VALIDATE_PASSWORD_STRENGTH(:password) AS strength",
            { replacements: { password: req.body.Password }, type: db.Sequelize.QueryTypes.SELECT }
        );

        if (styrkeResultat.strength < 50) {
            return res.status(400).send({
                message: "Adgangskoden er for svag. Brug mindst 8 tegn med store og små bogstaver, tal og specialtegn.",
                strength: styrkeResultat.strength
            });
        }

        // Hash adgangskoden før gemning i databasen
        const hashetAdgangskode = await bcrypt.hash(req.body.Password, 10);

        const user = await User.create({ ...req.body, Password: hashetAdgangskode });
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
        const opdateringsData = { ...req.body };

        // Hvis adgangskoden opdateres — validér styrke og hash den
        if (opdateringsData.Password) {
            const [styrkeResultat] = await db.sequelize.query(
                "SELECT VALIDATE_PASSWORD_STRENGTH(:password) AS strength",
                { replacements: { password: opdateringsData.Password }, type: db.Sequelize.QueryTypes.SELECT }
            );

            if (styrkeResultat.strength < 50) {
                return res.status(400).send({
                    message: "Adgangskoden er for svag. Brug mindst 8 tegn med store og små bogstaver, tal og specialtegn.",
                    strength: styrkeResultat.strength
                });
            }

            opdateringsData.Password = await bcrypt.hash(opdateringsData.Password, 10);
        }

        const [updated] = await User.update(opdateringsData, {
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



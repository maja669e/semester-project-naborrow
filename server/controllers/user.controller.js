const bcrypt = require("bcryptjs");
const db = require("../models");

const User = db.users;
const Login = db.logins;

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

        // Hash adgangskoden før gemning i Login-tabellen
        const hashetAdgangskode = await bcrypt.hash(req.body.Password, 10);

        // Opret bruger uden adgangskode
        const { Password, ...userData } = req.body;
        const user = await User.create(userData);

        // Opret login-række med det hashede password
        await Login.create({ UserID: user.UserID, PasswordHash: hashetAdgangskode });

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
        const { Password, ...opdateringsData } = req.body;

        // Tjek at brugeren eksisterer
        const eksisterendeBruger = await User.findByPk(id);
        if (!eksisterendeBruger) {
            return res.status(404).send({ message: "Bruger ikke fundet med id " + id });
        }

        // Hvis adgangskoden opdateres — validér styrke og hash den
        if (Password) {
            const [styrkeResultat] = await db.sequelize.query(
                "SELECT VALIDATE_PASSWORD_STRENGTH(:password) AS strength",
                { replacements: { password: Password }, type: db.Sequelize.QueryTypes.SELECT }
            );

            if (styrkeResultat.strength < 50) {
                return res.status(400).send({
                    message: "Adgangskoden er for svag. Brug mindst 8 tegn med store og små bogstaver, tal og specialtegn.",
                    strength: styrkeResultat.strength
                });
            }

            const hashetAdgangskode = await bcrypt.hash(Password, 10);
            await Login.update({ PasswordHash: hashetAdgangskode }, { where: { UserID: id } });
        }

        if (Object.keys(opdateringsData).length > 0) {
            await User.update(opdateringsData, { where: { UserID: id } });
        }

        const opdateretBruger = await User.findByPk(id);
        res.send(opdateretBruger);
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

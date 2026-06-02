const db = require("../models");
const Rating = db.ratings;
const Rental = db.rentals;

// HENT ALLE ratings 
exports.findAll = async (req, res) => {
    try {
        const ratings = await Rating.findAll();
        res.send(ratings);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ÉN rating via ID
exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const rating = await Rating.findByPk(id);
        if (!rating) {
            return res.status(404).send({ message: "Rating ikke fundet med id " + id });
        }
        res.send(rating);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


// OPDATER en rating via ID
exports.update = async (req, res) => {
    const id = req.params.id;

    try {

        const [num] = await Rating.update(req.body, {
            where: { RatingID: id }
        });

        if (num === 1) {
            res.send({
                message: "Rating blev opdateret."
            });
        } else {
            res.status(404).send({
                message: `Rating med id=${id} blev ikke fundet.`
            });
        }

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

// SLET én rating via ID
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const num = await Rating.destroy({
            where: { RatingID: id }
        });

        if (num === 1) {
            res.send({ message: "Rating blev slettet." });
        } else {
            res.send({ message: `Kunne ikke slette rating med id=${id}. Tjek om den eksisterer.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Fejl ved sletning af rating med id=" + id });
    }
};

// SLET ALLE ratings
exports.deleteAll = async (req, res) => {
    try {
        const nums = await Rating.destroy({
            where: {},
            truncate: false
        });

        res.send({ message: `${nums} ratings blev slettet.` });
    } catch (err) {
        res.status(500).send({ message: err.message || "Fejl ved sletning af alle ratings." });
    }
};

// OPRET en ny rating
exports.create = async (req, res) => {
    try {

        // Find rental via RentalID
        const rental = await Rental.findByPk(req.body.RentalID);

        // Hvis rental ikke findes
        if (!rental) {
            return res.status(404).send({
                message: "Rental blev ikke fundet"
            });
        }

        //Fejlhåndtering for rating, der ikke er mellem 1 og 5
        if (req.body.RatingScore < 1 || req.body.RatingScore > 5) {
        return res.status(400).send({
        message: "Rating skal være mellem 1 og 5"
            });
        }

        // Opret rating
        const rating = await Rating.create(req.body);

        res.send(rating);

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};
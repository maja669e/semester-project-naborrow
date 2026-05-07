const db = require("../models");

const Rental = db.rentals;
const RentalRequest = db.rentalRequests;



// OPRET en ny udlejning (kun hvis RentalRequest eksisterer og er godkendt)
exports.create = async (req, res) => {
    try {
        const request = await RentalRequest.findByPk(req.body.RequestID);

        // Tjekker om forespørgslen overhovedet eksisterer
        if (!request) {
            return res.status(404).send({ message: "Udlejningsforespørgsel ikke fundet." });
        }

        // Tjekker om forespørgslen er godkendt - kun godkendte må blive til udlejninger
        if (request.Status !== "approved") {
            return res.status(400).send({ message: "Forespørgslen er ikke godkendt endnu." });
        }

        const rental = await Rental.create(req.body);
        res.send(rental);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ALLE udlejninger (inkl. tilhørende udlejningsforespørgsel)
exports.findAll = async (req, res) => {
    try {
        const rentals = await Rental.findAll({
            include: [
                {
                    model: RentalRequest,
                    as: "rentalRequest"
                }
            ]
        });
        res.send(rentals);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ÉN udlejning via ID
exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const rental = await Rental.findByPk(id, {
            include: [
                {
                    model: RentalRequest,
                    as: "rentalRequest"
                }
            ]
        });

        if (!rental) {
            return res.status(404).send({ message: "Udlejning ikke fundet med id " + id });
        }
        res.send(rental);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// OPDATER en udlejning via ID (f.eks. ændre Status til "done")
exports.update = async (req, res) => {
    const id = req.params.id;
    try {
        // Kopierer request body og fjerner rentalRequest, da det ikke er en kolonne i tabellen
        const updateData = { ...req.body };
        delete updateData.rentalRequest;

        const [num] = await Rental.update(updateData, {
            where: { RentalID: id }
        });

        if (num === 1) {
            res.send({ message: "Udlejningen blev opdateret." });
        } else {
            res.send({ message: `Kunne ikke opdatere udlejning med id=${id}. Tjek om den eksisterer.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Fejl ved opdatering af udlejning med id=" + id });
    }
};

// SLET én udlejning via ID
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const num = await Rental.destroy({
            where: { RentalID: id }
        });

        if (num === 1) {
            res.send({ message: "Udlejningen blev slettet." });
        } else {
            res.send({ message: `Kunne ikke slette udlejning med id=${id}. Tjek om den eksisterer.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Fejl ved sletning af udlejning med id=" + id });
    }
};

// SLET ALLE udlejninger
exports.deleteAll = async (req, res) => {
    try {
        const nums = await Rental.destroy({
            where: {},
            truncate: false
        });

        res.send({ message: `${nums} udlejninger blev slettet.` });
    } catch (err) {
        res.status(500).send({ message: err.message || "Fejl ved sletning af alle udlejninger." });
    }
};

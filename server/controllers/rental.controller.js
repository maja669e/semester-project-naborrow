const db = require("../models");

const Rental        = db.rentals;
const RentalRequest = db.rentalRequests;
const Op            = db.Sequelize.Op;

// Sætter aktive lån til "completed" hvis EndDate ligger før dags dato.
// Kaldes inden data returneres i getByUser og getByOwner, så frontend altid
// ser korrekte statuser uden at kræve en separat cronjob.
async function autoCompleteExpiredRentals() {
  // ISO-datostreng (YYYY-MM-DD) undgår timezone-forskydning ved sammenligning
  // med DATEONLY-kolonnen i databasen — fx "2026-06-07"
  const today = new Date().toISOString().split("T")[0];

  // Find alle anmodninger hvis slutdato er overskredet
  const expired = await RentalRequest.findAll({
    where: { EndDate: { [Op.lt]: today } },
    attributes: ["RentalRequestID"]
  });

  if (expired.length === 0) return;

  const ids = expired.map(r => r.RentalRequestID);

  // Opdater kun aktive lån — undgår at overskrive cancelled
  await Rental.update(
    { Status: "completed" },
    { where: { RequestID: ids, Status: "active" } }
  );
}

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
                    as: "rentalRequest",
                    include: [
                        {
                            model: db.items,
                            as: "item"
                        }
                    ]
                }
            ]
        });

        res.send(rentals);

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
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

// AFSLUT UDLØBNE LÅN manuelt — kun til testbrug.
// Kalder autoCompleteExpiredRentals og returnerer antal opdaterede poster.
exports.completeExpired = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const expired = await RentalRequest.findAll({
      where: { EndDate: { [Op.lt]: today } },
      attributes: ["RentalRequestID"]
    });

    if (expired.length === 0) {
      return res.send({ updated: 0 });
    }

    const ids = expired.map(r => r.RentalRequestID);

    const [updated] = await Rental.update(
      { Status: "completed" },
      { where: { RequestID: ids, Status: "active" } }
    );

    res.send({ updated });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// HENT ALLE udlejninger for en specifik bruger (via RentalRequest's UserID)
exports.getByUser = async (req, res) => {
  try {
    await autoCompleteExpiredRentals();

    const userId = req.params.userId;

    const rentals = await Rental.findAll({
      include: [
        {
          model: RentalRequest,
          as: "rentalRequest",
          where: {
            RenterUserID: userId
          },
          include: [
            {
              model: db.items,
              as: "item"
            }
          ]
        }
      ]
    });

    res.send(rentals);

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

// HENT ALLE udlejninger for genstande ejet af en specifik bruger (udlåner-perspektiv).
// Returnerer også lånerens brugernavn så frontend kan vise hvem der låner.
exports.getByOwner = async (req, res) => {
  try {
    await autoCompleteExpiredRentals();

    const userId = req.params.userId;

    const rentals = await Rental.findAll({
      include: [
        {
          model: RentalRequest,
          as: "rentalRequest",
          // required: true laver INNER JOIN — uden det returnerer Sequelize
          // alle Rentals inkl. dem uden matchende anmodning (rentalRequest: null)
          required: true,
          include: [
            {
              model: db.items,
              as: "item",
              where: { UserID: userId }, // kun genstande ejet af denne bruger
              required: true
            },
            {
              model: db.users,
              as: "renter" // lånerens oplysninger til visning i frontend
            }
          ]
        }
      ]
    });

    res.send(rentals);

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};
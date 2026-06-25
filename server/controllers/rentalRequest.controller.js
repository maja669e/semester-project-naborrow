// Controller til låneanmodninger — håndterer oprettelse, hentning, godkendelse og afvisning.
// Når en anmodning godkendes oprettes samtidig en Rental-record så genstandens status
// kan beregnes korrekt i item.controller.js (isCurrentlyRented).
const db = require("../models");
const RentalRequest = db.rentalRequests;
const Item          = db.items;
const Rental        = db.rentals;


exports.create = (req, res) => {
  RentalRequest.create(req.body)
    .then(data => res.send(data))
    .catch(err => {

      console.log(err);

      res.status(500).send({
        message: err.message
      });
    });
};

exports.findAll = async (req, res) => {
  try {
    const rentalRequests = await RentalRequest.findAll({
      include: [
        { model: db.items, as: "item" },
        { model: db.users, as: "renter" }
      ]
    });

    res.send(rentalRequests);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Get count of pending rental requests for items owned by a specific user
exports.getPendingCountByOwner = async (req, res) => {
  const userId = req.params.userId;

  try {
    const count = await RentalRequest.count({
      where: {
        Status: "pending"
      },
      include: [
        {
          model: db.items,
          as: "item",
          where: { UserID: userId }
        }
      ]
    });

    res.send({ count });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
 

// Godkend anmodning — sætter status til 'approved' og opretter et aktivt Rental.
// findOrCreate bruges i stedet for create så dobbeltklik ikke kaster en UNIQUE-fejl
// (RequestID er UNIQUE i Rental-tabellen — ét lån per anmodning).
exports.accept = async (req, res) => {
  try {
    const id = req.params.id;

    const request = await RentalRequest.findByPk(id);

    if (!request) {
      return res.status(404).send({
        message: "Låneanmodning ikke fundet."
      });
    }

    await request.update({
      Status: "approved"
    });

    await Rental.findOrCreate({
      where: {
        RequestID: id
      },
      defaults: {
        Status: "active"
      }
    });

    res.send(request);

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

// Afvis anmodning — sætter status til 'rejected'.
// Hvis der allerede er oprettet en Rental (fx ved fejl), sættes den til 'cancelled'
// så genstanden ikke forbliver markeret som udlånt.
exports.reject = async (req, res) => {
  try {
    const id = req.params.id;

    await RentalRequest.update(
      { Status: "rejected" },
      { where: { RentalRequestID: id } }
    );

    // Annullér eventuel aktiv Rental knyttet til denne anmodning
    await Rental.update(
      { Status: "cancelled" },
      { where: { RequestID: id, Status: "active" } }
    );

    const updated = await RentalRequest.findByPk(id);
    res.send(updated);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.getPendingByOwner = async (req, res) => {
  try {
    const userId = req.params.userId;

    const requests = await RentalRequest.findAll({
      where: {
        Status: "pending"
      },
      include: [
        {
          model: db.items,
          as: "item",
          where: {
            UserID: userId
          }
        },
        {
          model: db.users,
          as: "renter"
        }
      ]
    });

    res.send(requests);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
const db = require("../models");
const Rental = db.rentals;

exports.create = (req, res) => {
  Rental.create(req.body)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAll = async (req, res) => {
  try {
    const rentals = await Rental.findAll({
      include: [
        { model: db.items, as: "item" },
        { model: db.users, as: "renter" }
      ]
    });

    res.send(rentals);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
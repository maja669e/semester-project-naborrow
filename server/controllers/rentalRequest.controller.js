const db = require("../models");
const RentalRequest = db.rentalRequests;

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
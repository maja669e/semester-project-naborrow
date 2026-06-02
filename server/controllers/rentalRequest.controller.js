const db = require("../models");
const RentalRequest = db.rentalRequests;
const Item = db.items;


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
};
 

// Godkend anmodning — sætter status til 'approved' (matcher SQL CHECK-constraint)
exports.accept = async (req, res) => {
  try {
    const id = req.params.id;
    await RentalRequest.update(
      { Status: "approved" },
      { where: { RentalRequestID: id } }
    );
    const updated = await RentalRequest.findByPk(id);
    res.send(updated);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Afvis anmodning — sætter status til 'rejected'
exports.reject = async (req, res) => {
  try {
    const id = req.params.id;
    await RentalRequest.update(
      { Status: "rejected" },
      { where: { RentalRequestID: id } }
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
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
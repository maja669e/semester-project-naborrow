const db = require("../models");
const ItemAccessory = db.itemAccessories;

exports.create = (req, res) => {
  ItemAccessory.create(req.body)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  ItemAccessory.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};
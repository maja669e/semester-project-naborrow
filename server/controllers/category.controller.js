const db = require("../models");
const Category = db.categories;

exports.create = (req, res) => {
  Category.create(req.body)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

exports.findAll = (req, res) => {
  Category.findAll()
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};
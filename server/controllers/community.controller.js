const db = require("../models");
const Community = db.communities;

// HENT ALLE communities
exports.findAll = async (req, res) => {
    try {
        const communities = await Community.findAll();
        res.send(communities);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

// HENT ÉN community via ID
exports.findOne = async (req, res) => {
    const id = req.params.id;
    try {
        const community = await Community.findByPk(id);
        if (!community) {
            return res.status(404).send({ message: "Community ikke fundet med id " + id });
        }
        res.send(community);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};


// OPDATER en community via ID
exports.update = async (req, res) => {
    const id = req.params.id;

    try {

        const [num] = await Community.update(req.body, {
            where: { CommunityID: id }
        });

        if (num === 1) {
            res.send({
                message: "Community blev opdateret."
            });
        } else {
            res.status(404).send({
                message: `Community med id=${id} blev ikke fundet.`
            });
        }

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};

// SLET én community via ID
exports.delete = async (req, res) => {
    const id = req.params.id;
    try {
        const num = await Community.destroy({
            where: { CommunityID: id }
        });

        if (num === 1) {
            res.send({ message: "Community blev slettet." });
        } else {
            res.send({ message: `Kunne ikke slette community med id=${id}. Tjek om den eksisterer.` });
        }
    } catch (err) {
        res.status(500).send({ message: "Fejl ved sletning af community med id=" + id });
    }
};

// SLET ALLE communities
exports.deleteAll = async (req, res) => {
    try {
        const nums = await Community.destroy({
            where: {},
            truncate: false
        });

        res.send({ message: `${nums} communities blev slettet.` });
    } catch (err) {
        res.status(500).send({ message: err.message || "Fejl ved sletning af alle communities." });
    }
};

// OPRET en ny community
exports.create = async (req, res) => {
    try {

        const newCommunity = await Community.create(req.body);

        res.send(newCommunity);

    } catch (err) {
        res.status(500).send({
            message: err.message
        });
    }
};
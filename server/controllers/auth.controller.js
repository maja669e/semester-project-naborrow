const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.users;

// POST /api/auth/login
// Body: { username, password }
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: "Brugernavn og adgangskode er påkrævet." });
    }

    try {
        const user = await User.findOne({ where: { Username: username } });

        if (!user) {
            return res.status(401).send({ message: "Forkert brugernavn eller adgangskode." });
        }

        const adgangskodeKorrekt = await bcrypt.compare(password, user.Password);
        if (!adgangskodeKorrekt) {
            return res.status(401).send({ message: "Forkert brugernavn eller adgangskode." });
        }

        res.send({
            userID:    user.UserID,
            username:  user.Username,
            firstName: user.FirstName,
            lastName:  user.LastName,
            email:     user.Email,
            role:      user.Role,
        });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

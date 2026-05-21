const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.users;

// LOG IND – finder brugeren via email og sammenligner adgangskoden med bcrypt.
// Returnerer brugeroplysninger uden adgangskode hvis login er korrekt.
// Body: { email, password }
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email og adgangskode er påkrævet." });
    }

    try {
        const user = await User.findOne({ where: { Email: email } });

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

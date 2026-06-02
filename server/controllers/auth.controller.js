const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.users;
const Login = db.logins;

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

        // Samme besked uanset om email eller adgangskode er forkert –
        // fortæller ikke angriberen hvilken del der er gal (som i rigtige apps)
        if (!user) {
            return res.status(401).send({ message: "Forkert email eller adgangskode. Prøv igen." });
        }

        const login = await Login.findOne({ where: { UserID: user.UserID } });

        if (!login) {
            return res.status(401).send({ message: "Forkert email eller adgangskode. Prøv igen." });
        }

        const adgangskodeKorrekt = await bcrypt.compare(password, login.PasswordHash);
        if (!adgangskodeKorrekt) {
            return res.status(401).send({ message: "Forkert email eller adgangskode. Prøv igen." });
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

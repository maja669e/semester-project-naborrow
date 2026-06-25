module.exports = (sequelize, DataTypes) => {
    const Rental = sequelize.define("Rental", {
        RentalID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        // RequestID peger på hvilken RentalRequest der hører til denne udlejning
        RequestID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        // Stort S fordi kolonnen i databasen hedder "Status"
        Status: {
            type: DataTypes.STRING(50),
            defaultValue: "active",
            allowNull: false
        },
        // Soft delete PR. BRUGER: skjuler lånet fra den ene parts historik
        // uden at slette posten. Den anden part beholder lånet i sin historik.
        HiddenByRenter: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        HiddenByOwner: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        tableName: "Rental",
        timestamps: false
    });

    return Rental;
};

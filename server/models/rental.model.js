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
        }
    }, {
        tableName: "Rental",
        timestamps: false
    });

    return Rental;
};

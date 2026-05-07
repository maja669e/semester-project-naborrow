module.exports = (sequelize, DataTypes) => {
    const Rental = sequelize.define("Rental", {
    RentalID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rentalRequestID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "active",
      allowNull: false
        }

    }, {
      
    tableName: "Rental",
    timestamps: false
    });

    return Rental;
};
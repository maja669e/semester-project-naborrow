module.exports = (sequelize, DataTypes) => {
  const Rental = sequelize.define("Rental", {
    RentalID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ItemID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RenterUserID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    StartDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    EndDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Status: {
      type: DataTypes.STRING,
      defaultValue: "pending"
    }
  }, {
    tableName: "Rental",
    timestamps: false
  });

  return Rental;
};
module.exports = (sequelize, DataTypes) => {
  const RentalRequest = sequelize.define("RentalRequest", {
    RentalRequestID: {
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
    },
    MessageToLender: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    SelectedAccessories: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    PickupTimes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "RentalRequest",
    timestamps: false
  });

  return RentalRequest;
};
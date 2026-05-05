module.exports = (sequelize, DataTypes) => {
  const ItemAccessory = sequelize.define("ItemAccessory", {
    AccessoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ItemID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    AccessoryName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: "ItemAccessory",
    timestamps: false
  });

  return ItemAccessory;
};
module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
    ItemID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    CategoryID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    ItemName: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    Brand: {
      type: DataTypes.STRING(150),
      allowNull: true
    },

    Condition: {
      type: DataTypes.STRING(50),
      allowNull: false
    },

    MaxRentPeriodDays: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    IsActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    CreatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Item',
    timestamps: false   // we already have CreatedAt (in the database)
  });

  return Item;
};
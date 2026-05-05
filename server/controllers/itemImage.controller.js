module.exports = (sequelize, DataTypes) => {
  const ItemImage = sequelize.define('ItemImage', {
    ImageID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    ItemID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    ImageURL: {
      type: DataTypes.STRING(255),
      allowNull: false
    },

    IsPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'ItemImage',
    timestamps: false
  });

  return ItemImage;
};
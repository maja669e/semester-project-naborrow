module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define("Rating", {
    RatingID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    RentalID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RaterUserID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RatedUserID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    RatingScore: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: "Rating",
    timestamps: false
  });

  return Rating;
};

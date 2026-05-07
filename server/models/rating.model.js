module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define("Rating", {
    RatingID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    //ID på den udlejning som denne rating hører til
    RentalID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    //Den som rater produktet
    RaterUserID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    //En rating mellem 1 og 5
    Rating:{
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {
    tableName: "Rating",
    timestamps: false
  });

  return Rating;
};
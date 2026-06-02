module.exports = (sequelize, DataTypes) => {
  const PostalCode = sequelize.define("PostalCode", {
    PostalCode: {
      type: DataTypes.STRING(10),
      primaryKey: true
    },
    City: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: "PostalCode",
    timestamps: false
  });

  return PostalCode;
};

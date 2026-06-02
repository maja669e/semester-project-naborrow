module.exports = (sequelize, DataTypes) => {
  const Login = sequelize.define("Login", {
    LoginID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: "Login",
    timestamps: false
  });

  return Login;
};

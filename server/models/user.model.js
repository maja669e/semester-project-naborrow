module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    AddressID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ApprovedByID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    FirstName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    LastName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Username: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true
    },
    PhoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    ApartmentNumber: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    DateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    Role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "user"
    },
    MembershipStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending"
    },
    CreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
    }, {
    tableName: "User",
    timestamps: false
});
return User;
};

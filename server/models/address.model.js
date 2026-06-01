module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define("Address", {
        AddressID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CommunityID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        StreetNumber: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    }, {
        tableName: "Address",
        timestamps: false
    });

    return Address;
};

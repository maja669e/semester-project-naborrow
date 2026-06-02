module.exports = (sequelize, DataTypes) => {
    const Community = sequelize.define("Community", {
        CommunityID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        AdminUserID: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        CommunityName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        StreetName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        StreetNumberFrom: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        StreetNumberTo: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        PostalCode: {
            type: DataTypes.STRING(10),
            allowNull: false
        }
    }, {
        tableName: "Community",
        timestamps: false
    });

    return Community;
};

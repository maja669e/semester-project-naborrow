module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define("Message", {
        MessageID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        SenderUserID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ReceiverUserID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        RentalID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        MessageText: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        SentAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        EditedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        IsRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        IsDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        DeletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: "Message",
        timestamps: false
    });
    return Message;
};
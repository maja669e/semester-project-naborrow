const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//IMPORT MODELS
db.items = require("./item.model.js")(sequelize, Sequelize);
db.itemImages = require("./itemImage.model.js")(sequelize, Sequelize);
db.itemAccessories = require("./itemAccessory.model.js")(sequelize, Sequelize);
db.categories = require("./category.model.js")(sequelize, Sequelize);
db.rentals = require("./rental.model.js")(sequelize, Sequelize);


// Item -> ItemImages
db.items.hasMany(db.itemImages, {
  foreignKey: "ItemID",
  as: "images",
  onDelete: "CASCADE"
});

db.itemImages.belongsTo(db.items, {
  foreignKey: "ItemID"
});
// Category -> Item
db.categories.hasMany(db.items, { foreignKey: "CategoryID" });
db.items.belongsTo(db.categories, { foreignKey: "CategoryID" });

// Item -> Accessories
db.items.hasMany(db.itemAccessories, {
  foreignKey: "ItemID",
  as: "accessories",
  onDelete: "CASCADE"
});
db.itemAccessories.belongsTo(db.items, {
  foreignKey: "ItemID"
});

// Item -> Rentals
db.items.hasMany(db.rentals, {
  foreignKey: "ItemID",
  as: "rentals",
  onDelete: "CASCADE"
});
db.rentals.belongsTo(db.items, {
  foreignKey: "ItemID",
  as: "item"   // 🔥 IMPORTANT for include()
});

// User -> Rentals
/*db.users.hasMany(db.rentals, {
  foreignKey: "RenterUserID"
});
db.rentals.belongsTo(db.users, {
  foreignKey: "RenterUserID",
  as: "renter"
});*/


module.exports = db;
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
db.rentalRequests = require("./rentalRequest.model.js")(sequelize, Sequelize);
db.rentals = require("./rental.model.js")(sequelize, Sequelize);
db.ratings = require("./rating.model.js")(sequelize, Sequelize);




// Rental -> RentalRequest (én udlejning hører til én forespørgsel)
db.rentals.belongsTo(db.rentalRequests, {
  foreignKey: "RequestID",
  as: "rentalRequest"
});
db.rentalRequests.hasOne(db.rentals, {
  foreignKey: "RequestID",
  as: "rental"
});

//User -> Rating (én rating hører til én bruger, en bruger kan have mange ratings)
db.users.hasMany(db.ratings, {
  foreignKey: "RaterUserID",
  as: "ratings"
});

//Rating -> User (én rating hører til én bruger)
db.ratings.belongsTo(db.users, {
  foreignKey: "RaterUserID",
  as: "rater"
});


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

// Item -> RentalRequests
db.items.hasMany(db.rentalRequests, {
  foreignKey: "ItemID",
  as: "rentalRequests",
  onDelete: "CASCADE"
});
db.rentalRequests.belongsTo(db.items, {
  foreignKey: "ItemID",
  as: "item"   // 🔥 IMPORTANT for include()
});

// User -> RentalRequests
/*db.users.hasMany(db.rentalRequests, {
  foreignKey: "RenterUserID"
});
db.rentalRequests.belongsTo(db.users, {
  foreignKey: "RenterUserID",
  as: "renter"
});*/


module.exports = db;
const db = require("../models");

const Item = db.items;
const ItemImage = db.itemImages;
const Category = db.categories;
const ItemAccessory = db.itemAccessories;

// CREATE item (optionally with images)
exports.create = async (req, res) => {
  try {
    const item = await Item.create(req.body);

    // If images are included in request
    if (req.body.images && req.body.images.length > 0) {
      const images = req.body.images.map((img, index) => ({
        ItemID: item.ItemID,
        ImageURL: typeof img === "string" ? img : img.ImageURL,
        IsPrimary: typeof img === "string" ? index === 0 : !!img.IsPrimary
      }));

      await ItemImage.bulkCreate(images);
    }

    res.send(item);

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error creating Item"
    });
  }
};

// GET all items (with images)
exports.findAll = async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: ItemImage,
          as: "images"
        },
        {
          model: Category,
          attributes: ["CategoryID", "CategoryName"]
        },
        {
          model: ItemAccessory,
          as: "accessories"
        }
      ]
    });

    res.send(items);

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};

// GET one item by ID (with images)
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const item = await Item.findByPk(id, {
      include: [
        {
          model: ItemImage,
          as: "images"
        },
        {
          model: Category,
          attributes: ["CategoryID", "CategoryName"]
        },
        {
          model: ItemAccessory,
          as: "accessories"
        }
      ]
    });

    if (item) {
      res.send(item);
    } else {
      res.status(404).send({
        message: `Cannot find Item with id=${id}`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Error retrieving Item with id=" + id
    });
  }
};

// UPDATE item
exports.update = async (req, res) => {
  const id = req.params.id;

  try {
    const updateData = { ...req.body };
    delete updateData.images;
    delete updateData.accessories;

    const [num] = await Item.update(updateData, {
      where: { ItemID: id }
    });

    if (req.body.images !== undefined) {
      await ItemImage.destroy({ where: { ItemID: id } });

      if (Array.isArray(req.body.images) && req.body.images.length > 0) {
        const images = req.body.images.map((img, index) => ({
          ItemID: id,
          ImageURL: typeof img === 'string' ? img : img.ImageURL,
          IsPrimary: typeof img === 'string' ? index === 0 : !!img.IsPrimary
        }));

        await ItemImage.bulkCreate(images);
      }
    }

    if (req.body.accessories !== undefined) {
      await ItemAccessory.destroy({ where: { ItemID: id } });

      if (Array.isArray(req.body.accessories) && req.body.accessories.length > 0) {
        const accessories = req.body.accessories.map(name => ({
          ItemID: id,
          AccessoryName: String(name).trim()
        })).filter(item => item.AccessoryName);

        if (accessories.length > 0) {
          await ItemAccessory.bulkCreate(accessories);
        }
      }
    }

    if (num === 1 || req.body.images || req.body.accessories) {
      res.send({
        message: "Item was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Item with id=${id}. Maybe not found or empty body`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Error updating Item with id=" + id
    });
  }
};

// DELETE item (images auto-delete via CASCADE)
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const num = await Item.destroy({
      where: { ItemID: id }
    });

    if (num == 1) {
      res.send({
        message: "Item deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Item with id=${id}`
      });
    }

  } catch (err) {
    res.status(500).send({
      message: "Could not delete Item with id=" + id
    });
  }
};

// DELETE ALL items
exports.deleteAll = async (req, res) => {
  try {
    const nums = await Item.destroy({
      where: {},
      truncate: false
    });

    res.send({
      message: `${nums} Items deleted successfully`
    });

  } catch (err) {
    res.status(500).send({
      message: err.message || "Error deleting all items"
    });
  }
};
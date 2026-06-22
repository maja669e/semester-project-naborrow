// Controller til genstande — håndterer oprettelse, hentning, opdatering og sletning.
// findByUser inkluderer låneanmodninger og udlejninger for at beregne isCurrentlyRented,
// så frontend kan vise korrekt status (Tilgængelig / Udlånt / Inaktiv).
const db = require("../models");

const Item          = db.items;
const ItemImage     = db.itemImages;
const Category      = db.categories;
const ItemAccessory = db.itemAccessories;
const RentalRequest = db.rentalRequests;
const Rental        = db.rentals;

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

// GET all items (with images + active rental status).
// Driver Udforsk-siden (ikke-ejer-visning), så her gælder to ting modsat findByUser:
//   1. IsActive: true i WHERE — inaktive genstande er taget ned af ejeren og må
//      ikke optræde for andre brugere overhovedet.
//   2. Samme isCurrentlyRented/currentRentalEndDate-beregning som findByUser, så
//      "Udlånt indtil ..." kan vises korrekt i Udforsk.
exports.findAll = async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { IsDeleted: false, IsActive: true },
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
        },
        {
          model: RentalRequest,
          as: "rentalRequests",
          required: false,
          include: [
            {
              model: Rental,
              as: "rental",
              required: false
            }
          ]
        }
      ]
    });

    // Identisk status-logik som findByUser: en godkendt anmodning med et aktivt lån
    // betyder udlånt, og returdatoen (EndDate) hentes fra RentalRequest.
    const result = items.map(item => {
      const data = item.toJSON();
      const activeRequest = data.rentalRequests?.find(
        req => req.Status === "approved" && req.rental?.Status === "active"
      );
      return {
        ...data,
        isCurrentlyRented: !!activeRequest,
        currentRentalEndDate: activeRequest?.EndDate ?? null,
      };
    });

    res.send(result);

  } catch (err) {
    res.status(500).send({
      message: err.message
    });
  }
};


//Find all items by a specific user (with images + active rental status)
exports.findByUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const items = await Item.findAll({
      where: {
        UserID: userId,
        IsDeleted: false
      },
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
        },
        {
          model: RentalRequest,
          as: "rentalRequests",
          required: false,
          include: [
            {
              model: Rental,
              as: "rental",
              required: false
            }
          ]
        }
      ]
    });

    // Beregn isCurrentlyRented + returdato for hver genstand:
    // find en godkendt anmodning med et aktivt lån. Returdatoen (EndDate) ligger
    // på RentalRequest, ikke på Rental, så den hentes derfra til "Udlånt indtil ...".
    const result = items.map(item => {
      const data = item.toJSON();
      const activeRequest = data.rentalRequests?.find(
        req => req.Status === "approved" && req.rental?.Status === "active"
      );
      return {
        ...data,
        isCurrentlyRented: !!activeRequest,
        currentRentalEndDate: activeRequest?.EndDate ?? null,
      };
    });

    res.send(result);

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
    const item = await Item.findOne({
      where: { ItemID: id, IsDeleted: false },
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

// DELETE item (soft delete — sætter IsDeleted så lånehistorik bevares)
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const [num] = await Item.update(
      { IsDeleted: true, DeletedAt: new Date() },
      { where: { ItemID: id } }
    );

    if (num === 1) {
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
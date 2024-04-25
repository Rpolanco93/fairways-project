const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const router = express.Router();

//? Helper functions

function getPreviewImage(findAll) {
    let preview = findAll.map(Booking => {
        const jsonSpot = Booking.toJSON();
        if (jsonSpot.Spot.SpotImages[0]) {
            jsonSpot.Spot.previewImage = jsonSpot.Spot.SpotImages[0].url;
          } else {
            jsonSpot.Spot.previewImage = null;
          }
          delete jsonSpot.Spot.SpotImages
        return jsonSpot;
      });
    return preview
}



//* Get all Bookings for a Spot based on the Spot's id
router.get("/current", requireAuth, async (req, res, next) => {
    let findAll = await Booking.findAll({
        where: {
            userId: req.user.id
        },
        include: [{
            model: Spot,
            include: [{
                model: SpotImages,
                attributes: ['url']
            }],
            attributes: {
                exclude: ['updatedAt', 'createdAt', 'description']
            }
        }]
    })

//find avg reviews and previewImage
let spots = getPreviewImage(findAll)

return res.json({Bookings: spots})
})

module.exports = router;

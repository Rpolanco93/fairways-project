const express = require('express');
const { requireAuth } = require('../../../utils/auth.js');
const { Spot, SpotImages, Booking } = require('../../../db/models/index.js');
const { getPreviewImage } = require('./helper.js');

const router = express.Router();

//* Get all Bookings for a Spot based on the Spot's id
router.get("/current", requireAuth, async (req, res, next) => {
    let bookings = await Booking.findAll({
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
    bookings = getPreviewImage(bookings)

    return res.json({Bookings: bookings})
})

module.exports = router;
const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const {deleteSpotImage} = require("./helper");
const router = express.Router();

//* Delete a Spot Image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
    let image = await SpotImages.findByPk(req.params.imageId)
    if (!image) return res.status(404).json({
        "message": "Spot Image couldn't be found"
    })

    let spot = await Spot.findByPk(image.spotId)
    if (spot.ownerId !== req.user.id) return res.status(403).json({
      message: "Forbidden"
    })

    await deleteSpotImage(req.params.imageId);

    res.json({
        "message": "Successfully deleted"
    })
})

module.exports = router;

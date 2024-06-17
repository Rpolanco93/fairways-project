const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
//* import helper functions and checks
const { validateSpot, validateQuery, validateReview, getAvgAndImage, getAvgReviewAndCount } = require('./validator.js')
const {validateSpotImages} = require("../spot-images/validator");
const {addSpotImage} = require("./helper");
const {deleteAllSpotImages} = require("../spot-images/helper");
const router = express.Router();

//* Edit Spot
router.put("/:spotId",
    requireAuth, validateSpot, validateSpotImages,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        const { address, city, state, country, lat, lng, name, description, price} = req.body
        try {
            let spot = await Spot.findByPk(spotId)
            //check that spot exist
            if (!spot || spotId == null) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }

            //check that curr user owns spot
            if (spot.ownerId !== ownerId) return res.status(403).json({
                message: "Forbidden"
            })

            //update spot
            await spot.update({
                address, city, state, country, lat, lng, name, description, price
            })

            await deleteAllSpotImages(spotId);

            //Check to see if images have been included
            const images = req.body.images;

            if (Array.isArray(images) && images.length > 0) {
                for (const image of images) {
                    await addSpotImage(spot, image.url, image.preview)
                }
            }

            res.json(spot)
        } catch(err) {
            return next(err)
        }
})

module.exports = router;

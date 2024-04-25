const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const router = express.Router();

//* Get all Reviews of the Current User
router.get("/current",
    requireAuth,
    async (req, res, next) => {
    const userId = req.user.id
    let getReviews = await Review.findAll({
        where: {
            userId
        },
        include: [
            {
                model: User,
                attributes: ["id", 'firstName', 'lastName']
            },
            {
                model: Spot,
                include: [{
                    model: SpotImages,
                    where: {
                        previewImage: true
                    }
                }],
                attributes: {
                    exclude: ['description', 'createdAt', 'updatedAt']
                }
            },
            {
                model: ReviewImages,
                attributes: ['id', 'url']
            }
        ]
    })

    getReviews = getReviews.map(review => {
        const jsonSpot = review.toJSON();
        if (jsonSpot.Spot.SpotImages[0]) {
            jsonSpot.Spot.previewImage = jsonSpot.Spot.SpotImages[0].url;
          } else {
            jsonSpot.Spot.previewImage = null;
          }
          delete jsonSpot.Spot.SpotImages
        return jsonSpot;
      });

    return res.json({Reviews: getReviews})
})

module.exports = router;

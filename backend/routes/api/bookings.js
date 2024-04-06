const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation.js')

const router = express.Router()

const validateSpot = [
    check('address')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Country is required'),
    check('lat')
      .exists({ checkFalsy: true })
      .isFloat({gte: -90, lte: 90})
      .withMessage('Latitude is not valid'),
    check('lng')
      .exists({ checkFalsy: true })
      .isFloat({gte: -180, lte: 180})
      .withMessage('Longitude is not valid'),
    check('name')
      .exists({ checkFalsy: true })
      .isLength({min: 1, max: 50})
      .withMessage('Name must be less than 50 characters'),
    check('description')
      .exists({ checkFalsy: true })
      .withMessage('Description is required'),
    check('price')
      .exists({ checkFalsy: true })
      .isFloat({min:0})
      .withMessage('Price per day is required'),
    handleValidationErrors
];

const validateReview = [
    check('review')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Review text is required'),
      check('stars')
      .exists({ checkFalsy: true })
      .isInt({gt: 0, lt: 5.1})
      .withMessage('Stars must be an integer from 1 to 5'),
      handleValidationErrors
]

function getAvgAndImage(findAll) {
    let spots = findAll.map(spot => {
        let toJson = spot.toJSON()
        if (toJson.Reviews.length) {
            const numOfReviews = toJson.Reviews.length
            let totalReview = 0;
            for (let review of toJson.Reviews) {
                totalReview += review.stars
            }
            toJson.avgRating = totalReview / numOfReviews
        } else {
            toJson.avgRating = null;
        }
        delete toJson.Reviews

        if (toJson.SpotImages[0]) {
            toJson.previewImage = toJson.SpotImages[0].url;
        } else {
            toJson.previewImage = null;
        }
        delete toJson.SpotImages
        return toJson
    })
    return spots
}

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

function getAvgReviewAndCount(spot) {
    let toJson = spot.toJSON()
    if (toJson.Reviews.length) {
        toJson.numReviews = toJson.Reviews.length
        let totalReview = 0;
        for (let review of toJson.Reviews) {
            totalReview += review.stars
        }
        toJson.avgRating = totalReview / toJson.numReviews
    } else {
        toJson.avgRating = null;
    }
    delete toJson.Reviews
return toJson
}

//* Get all Bookings of the Current User
router.get("/current", requireAuth, async (req, res, next) => {
    const getBookings = await Booking.findAll({
        where: {
            userId: req.user.id
        },
        include: [
            {
                 model: Spot,
                include: [{
                    model: SpotImages,
                    required: false,
                    where: {
                        previewImage: true
                    },
                    attributes: ['url']
                }],
                attributes: {
                    exclude: ['description', 'createdAt', 'updatedAt']
                }
            }
        ],
        order: ['spotId']
    })

    let Bookings = getPreviewImage(getBookings)

    return res.json({Bookings})
})

module.exports = router;

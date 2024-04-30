const { check, query } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation')

//* helper to validate the spot
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
      .isFloat({min: -90, max: 90})
      .withMessage('Latitude is not valid'),
    check('lng')
      .exists({ checkFalsy: true })
      .isFloat({min: -180, max: 180})
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

const validateSpotsQuery = [
    query('page')
    .default(1)
    .exists({ checkFalsy: true })
    .isInt({min:1, max:10})
      .withMessage('Page must be greater than or equal to 1 & less then or equal to 10'),
    query('size')
      .default(20)
      .isInt({min:1, max:20})
      .withMessage('Size must be greater than or equal to 1 & less then or equal to 20'),
    query('maxLat')
      .optional(true)
      .isFloat({gte: -90, lte: 90})
      .withMessage('Maximum latitude is invalid'),
    query('minLat')
      .optional(true)
      .isFloat({gte: -90, lte: 90})
      .withMessage('Minimum latitude is invalid'),
    query('maxLng')
      .optional(true)
      .isFloat({gte: -180, lte: 180})
      .withMessage('Maximum longitude is invalid'),
    query('minLng')
      .optional(true)
      .isFloat({gte: -180, lte: 180})
      .withMessage('Minimum longitude is invalid'),
    query('minPrice')
      .optional(true)
      .isFloat({min: 0})
      .withMessage('Minimum price must be greater than or equal to 0'),
    query('maxPrice')
      .optional(true)
      .isFloat({min: 0})
      .withMessage('Maximum price must be greater than or equal to 0'),
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

function getAvgReviewAndCount(spot) {
        let toJson = spot.toJSON()
        if (toJson.Reviews.length) {
            toJson.numReviews = toJson.Reviews.length
            let totalReview = 0;
            for (let review of toJson.Reviews) {
                totalReview += review.stars
            }
            toJson.avgStarRating = totalReview / toJson.numReviews
            toJson.numReviews = totalReview
        } else {
            toJson.avgStarRating = null
            toJson.numReviews = 0
        }
        delete toJson.Reviews
    return toJson
}

module.exports = {
    validateSpot,
    validateSpotsQuery,
    validateReview,
    getAvgAndImage,
    getAvgReviewAndCount
};

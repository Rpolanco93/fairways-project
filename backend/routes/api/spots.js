const express = require('express');
const { requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation.js')
const router = express.Router();

//* helper to validate the spot
const validateSpot = [
    check('address')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
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

//*Get all Spots
router.get("/", async (req, res, next) => {
    let findAll = await Spot.findAll({
        include: [{
            model: Review,
            required: false,
            attributes: ['stars'],
            },
            {
                model: SpotImages,
                required: false,
                where: {
                    previewImage: true
                },
                attributes: ['url']
            }
        ],
        group: [['Spot.id','ASC'],['Reviews.id'],['SpotImages.id']]
    })

    //find avg reviews and previewImage
    let spots = getAvgAndImage(findAll)

    return res.json({Spots: spots})
})

//*Get all Spots owned by Current User
router.get("/session",
    requireAuth,
    async (req, res, next) => {
        let findAll = await Spot.findAll({
            where: {
                ownerId: req.user.id
            },
            include: [{
                model: Review,
                required: false,
                attributes: ['stars'],
                },
                {
                    model: SpotImages,
                    required: false,
                    where: {
                        previewImage: true
                    },
                    attributes: ['url']
                }
            ],
            group: [['Spot.id','ASC'],['Reviews.id'],['SpotImages.id']]
        })

    //find avg reviews and previewImage
    let spots = getAvgAndImage(findAll)

    return res.json({Spots: spots})
})

//* Get details of a Spot from an id
//? passes in prod but may need to be refactored
router.get("/:spotId", async (req, res, next) => {
    const { spotId } = req.params
    let getSpot = await Spot.findOne({
        where: {
            id: spotId
        },
        include: [
            {
                model: Review,
                required: false,
                attributes: ["stars"]
            },
            {
                model: SpotImages,
                attributes: ['id', 'url', ['previewImage', 'preview']]
            },
            {
                model: User,
                as: "Owner",
                attributes: ['id', 'firstName', 'lastName']
            }
        ]
    })

    if (getSpot === null) return res.status(404).json({
        message: "Spot couldn't be found"
    });

    let spot = getAvgReviewAndCount(getSpot)

    return res.json(spot)
})

//* Create a Spot
router.post("/",
    requireAuth,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { address, city, state, country, lat, lng, name, description, price} = req.body
        try {
            const newSpot = await Spot.create({ownerId, address, city, state, country, lat, lng, name, description, price})
            return res.json(newSpot)
        } catch(err) {
            err.status = 400;
            err.body = {
                message: "Bad Request",
                errors: {
                    address, city, state, country, lat, lng, name, description, price
                }
            }
            return next(err)
        }

})

//* Add an Image to a Spot based on the Spot's id
//! failing in Prod. Err: {title: 'Server Error', message: 'column "SpotId" does not exist', stack: null}
router.post("/:spotId/images",
    requireAuth,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        const { url, preview } = req.body
        try {
            let spot = await Spot.findByPk(spotId)
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                return next(err);
            }
            //create new image tied to the spot
            const newImage = await SpotImages.create({spotId, url, previewImage: preview })
            newImage.toJSON()
            //create the obj to return specified fields
            const image = {
                id: newImage.id,
                url: newImage.url,
                preview: newImage.previewImage
            }

            return res.json(image)

            } catch(err) {
            return next(err)
        }
})

//* Edit Spot
router.put("/:spotId",
    requireAuth,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        const { address, city, state, country, lat, lng, name, description, price} = req.body
        try {
            let spot = await Spot.findByPk(spotId)
            //check that spot exist
            if (!spot.id) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 400;
                err.body = {
                    message: "Bad Request",
                    errors: {
                        address, city, state, country, lat, lng, name, description, price
                    }
                }
                return next(err)
            }
            //update spot
            await spot.update({
                address, city, state, country, lat, lng, name, description, price
            })

            res.json(spot)

        } catch(err) {
            return next(err)
        }
})

//* Delete an existing spot
router.delete("/:spotId",
    requireAuth,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        try {
            let spot = await Spot.findByPk(spotId)
            //check that spot exist
            if (!spot.id) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 400;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }
            //delete spot
            await Spot.destroy({
                where: {
                  id: spotId,
                },
              });

            res.json({
                message: "Successfully deleted"
            })

        } catch(err) {
            return next(err)
        }
})


//* Get all Reviews by a Spot's id
//! failed in prod: error: {"title":"Server Error","message":"column Review.UserId does not exist","stack":null}
router.get("/:spotId/reviews", async (req, res, next) => {
    try {
        const Reviews = await Review.findAll({
            where: {
                spotId: req.params.spotId
            },
            include: [
                {
                    model: User,
                    attributes: ["id", 'firstName', 'lastName']
                },
                {
                    model: ReviewImages,
                    attributes: ['id', 'url']
                }
            ]
        })

        if (Reviews.length == 0) {
            const err = new Error("Spot couldn't be found")
            err.status = 404
            next(err)
        } else  {
            return res.json({Reviews})
        }
    } catch(err) {
        return next(err)
    }
})

//* Create a Review for a Spot based on the Spot's id
//! failed in prod err: {title: 'Server Error', message: 'Error', stack: null}
//! || {title: 'Server Error', message: 'column "UserId" does not exist', stack: null}
router.post("/:spotId/reviews",
    requireAuth,
    async (req, res, next) => {
        const userId = req.user.id;
        const { spotId } = req.params;
        const { review, stars } = req.body
    try {
        //* Body validation errors
        if (!review || !stars) {
            const err = new Error("Error")
            err.status = 400
            err.body = {
                "message": "Bad Request",
                "errors": {
                    "review": "Review text is required",
                    "stars": "Stars must be an integer from 1 to 5",
                }
              }
            return next(err)
        }

        //* Couldn't find a Spot with the specified id
        if (!(await Spot.count({ where: { id: spotId }}))) {
            const err = new Error("Error")
            err.status = 404
            err.body = {
                "message": "Spot couldn't be found",
              }
            return next(err)
        }

        //* Review from current user already exist
        if (await Review.count({ where: { spotId, userId }})) {
            const err = new Error("Error")
            err.status = 404
            err.body = {
                "message": "User already has a review for this spot",
              }
            return next(err)
        }

        //* if no error occurs
        const newReview = await Review.create({
            userId, spotId, review, stars
        })

        return res.status(201).json(newReview)
    } catch(err) {
        return next(err)
    }

})


module.exports = router;

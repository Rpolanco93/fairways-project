const express = require('express');
const { requireAuth, restoreUser } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../db/models');
const { Op, Sequelize, DATE } = require('sequelize');
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
      .withMessage('Price per day is required and must be a positive number'),
    handleValidationErrors
];

const validateQuery = [
    check('page')
    .exists({ checkFalsy: true })
    .isInt({min:1, max:10})
      .withMessage('Page must be greater than or equal to 1'),
    check('size')
      .exists({ checkFalsy: true })
      .isInt({min:1, max:20})
      .withMessage('Size must be greater than or equal to 1'),
    check('maxLat')
      .exists({ checkFalsy: true })
      .isFloat({gte: -90, lte: 90})
      .withMessage('Maximum latitude is invalid'),
      check('minLat')
      .exists({ checkFalsy: true })
      .isFloat({gte: -90, lte: 90})
      .withMessage('Minimum latitude is invalid'),
    check('maxLng')
      .exists({ checkFalsy: true })
      .isFloat({gte: -180, lte: 180})
      .withMessage('Maximum longitude is invalid'),
    check('minLng')
      .exists({ checkFalsy: true })
      .isFloat({gte: -180, lte: 180})
      .withMessage('Minimum longitude is invalid'),
    check('minPrice')
      .exists({ checkFalsy: true })
      .isFloat({min: 0})
      .withMessage('Minimum price must be greater than or equal to 0'),
    check('maxPrice')
      .exists({ checkFalsy: true })
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
            toJson.avgRating = totalReview / toJson.numReviews
        } else {
            toJson.avgRating = null;
        }
        delete toJson.Reviews
    return toJson
}

//*Get all Spots
router.get("/", async (req, res, next) => {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query
    let limit;
    let offset;

    //check for validation errors
    if (page === 0) return res.status(400).json({
        message: "Bad Request",
        errors: { "page": "Page must be greater than or equal to 1" }
    });
    if (size < 1) return res.status(400).json({
        message: "Bad Request",
        errors: { "size": "Size must be greater than or equal to 1" }
    });
    if (minLat < -90 || minLat > 90 ) return res.status(400).json({
        message: "Bad Request",
        errors: { minLat: "Minimum latitude is invalid" }
    });
    if (maxLat > 90 || maxLat < -90) return res.status(400).json({
        message: "Bad Request",
        errors: { "maxLat": "Maximum latitude is invalid" }
    });
    if (minLng > 180 || minLng < -180) return res.status(400).json({
        message: "Bad Request",
        errors: { "minLng": "Maximum longitude is invalid" }
    });
    if (maxLng < -180 || maxLng > 180) return res.status(400).json({
        message: "Bad Request",
        errors: { "maxLng": "Minimum longitude is invalid" }
    });
    if (minPrice < 0) return res.status(400).json({
        message: "Bad Request",
        errors: { "minPrice": "Minimum price must be greater than or equal to 0" }
    });
    if (maxPrice < 0) return res.status(400).json({
        message: "Bad Request",
        errors: { "maxPrice": "Maximum price must be greater than or equal to 0" }
    });

    if (!page) page = 1;
    if (!size) size = 20;

    if (page >= 1 && size >= 1) {
        limit = size;
        offset = size * (page - 1);
    }

    const where = {};
    if (minLat) where.minLat = { [Op.gte]: minLat };
    if (maxLat) where.maxLat = { [Op.lte]: maxLat };
    if (minLng) where.lng = { [Op.gte]: minLng };
    if (maxLng) where.maxLng = { [Op.lte]: maxLng };
    if (minPrice) where.price = { [Op.gte]: minPrice }
    if (maxPrice) where.price = { [Op.lte]: maxPrice }

    let findAll = await Spot.findAll({
        where,
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
        limit,
        offset,
        group: [['Spot.id']]
    })

    //find avg reviews and previewImage
    let spots = getAvgAndImage(findAll)



    return res.json({
        Spots: spots,
        page,
        size
    })

//* original code prior to query filters
    // let findAll = await Spot.findAll({
    //     include: [{
    //         model: Review,
    //         required: false,
    //         attributes: ['stars'],
    //         },
    //         {
    //             model: SpotImages,
    //             required: false,
    //             where: {
    //                 previewImage: true
    //             },
    //             attributes: ['url']
    //         }
    //     ],
    //     group: [['Spot.id'],['Reviews.id'],['SpotImages.id']]
    // })

    // //find avg reviews and previewImage
    // let spots = getAvgAndImage(findAll)

    // return res.json({Spots: spots})
})

//*Get all Spots owned by Current User
router.get("/current",
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
    requireAuth, validateSpot,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { address, city, state, country, lat, lng, name, description, price} = req.body

        try {
            const newSpot = await Spot.create({ownerId, address, city, state, country, lat, lng, name, description, price})
            return res.status(201).json(newSpot)
        } catch(err) {
            return next(err)
        }
})

//* Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images",
    requireAuth, restoreUser,
    async (req, res, next) => {
        const { url, preview } = req.body
        const previewImage = preview
        const spot = await Spot.findByPk(req.params.spotId);
        if (spot === null) return res.status(404).json({
            "message": "Spot couldn't be found"
          })
        if (spot.ownerId !== req.user.id) {
          return res.status(403).json({
            message: 'Forbidden'
          })
        }
        const image = (await spot.createSpotImage({url, previewImage})).toJSON()
        res.json({
            id: image.id,
            url: image.url,
            preview: image.previewImage
        })
})

//* Edit Spot
router.put("/:spotId",
    requireAuth, validateSpot,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        const { address, city, state, country, lat, lng, name, description, price} = req.body
        try {
            let spot = await Spot.findByPk(spotId)
            //check that spot exist
            if (!spot.id || spotId == null) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) return res.status(404).json({
                message: "Forbidden"
            })


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
            if (!spot) return res.status(400).json({
                message: "Spot does not exist"
            })
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) return res.status(404).json({
                message: "Forbidden"
            })
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
router.get("/:spotId/reviews", async (req, res, next) => {
    try {
        const checkSpot = await Spot.findByPk(req.params.spotId)
        if (!checkSpot) return res.status(404).json({
            message: "Spot couldn't be found"
        })

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

        return res.json({Reviews})

    } catch(err) {
        return next(err)
    }
})

//* Create a Review for a Spot based on the Spot's id
router.post("/:spotId/reviews",
    requireAuth, validateReview,
    async (req, res, next) => {
        const userId = req.user.id;
        const { spotId } = req.params;
        const { review, stars } = req.body
    try {
        const findSpot = await Spot.findByPk(spotId)
        //* Couldn't find a Spot with the specified id
        if (!findSpot) return res.status(404).json({
            message: "Spot couldn't be found"
        })

        //* Review from current user already exist
        const checkReviews = await Review.findOne({where: { spotId, userId}})
        if (checkReviews) return res.status(500).json({
            message: "User already has a review for this spot"
        })

        //* if no error occurs
        const newReview = await Review.create({
            userId, spotId, review, stars
        })

        return res.status(201).json(newReview)
    } catch(err) {
        return next(err)
    }

})

//* Get all Bookings for a Spot based on the Spot's id
router.get("/:spotId/bookings", requireAuth, async (req, res, next) => {
    let spot = await Spot.findByPk(req.params.spotId)
    let getBookings;
    if (!spot) return res.status(404).json({
        message: "Spot couldn't be found"
      })
    if (spot.ownerId === req.user.id) {
        getBookings = await Booking.findAll({
            where: { spotId: req.params.spotId },
            include: {
                model: User,
                required: false,
                attributes: ['id','firstName','lastName']
              }
        })
    } else {
        getBookings = await Booking.findAll({
            where: { spotId: req.params.spotId },
            attributes: ["spotId", "startDate", "endDate"]
        })
    }

    return res.json({Bookings: getBookings})
})

//* Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, async (req, res, next) => {
    let { startDate, endDate} = req.body;
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    let spot = await Spot.findByPk(req.params.spotId);
    if (!spot) return res.status(404).json({
        message: "Spot couldn't be found"
    })

    //check that startDate is in the future and greater than the end date
    let currDate = new DATE(Sequelize.literal('CURRENT_TIMESTAMP'))

    if (startDate < currDate) return res.status(400).json({
        "message": "Bad Request",
        "errors": {
          "startDate": "startDate cannot be in the past",
        }
    })

    if (endDate <= startDate) return res.status(400).json({
        "message": "Bad Request",
        "errors": {
          "endDate": "endDate cannot be on or before startDate"
        }
    })

    // //check for booking conflict
    // const checkBookings = await Booking.findOne({
    //     where: {
    //         spotId: req.params.spotId,
    //         //check for bookings that start or end within the request booking
    //         [Op.or]: [{
    //             startDate: {
    //                 [Op.between]:[startDate,endDate]
    //             }},
    //             { endDate: {
    //                 [Op.between]:[startDate,endDate]
    //             }},
    //             //check for bookings that contain the requested booking dates
    //             { [Op.and]:{
    //                 startDate:{
    //                     [Op.lte]: startDate
    //                 },
    //                 endDate:{
    //                     [Op.gte]:endDate
    //                 }}
    //             }]
    //     },
    // })

    //check for start date on existing booking
    const checkStartDate = await Booking.findOne({
        where: {
            spotId: req.params.spotId,
            //check for bookings that start or end within the request booking
            [Op.or]: [{
                startDate: {
                    [Op.between]:[startDate,endDate]
                }},
                { endDate: {
                    [Op.between]:[startDate,endDate]
                }},
                //check for bookings that contain the requested booking dates
                { [Op.and]:{
                    startDate:{
                        [Op.lte]: startDate
                    },
                    endDate:{
                        [Op.gte]:endDate
                    }}
                }]
        },
    })

    if (checkStartDate) return res.status(400).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking"
        }
    })

    //check for end date conflicting with an existing booking
    const checkBookings = await Booking.findOne({
            where: {
                spotId: req.params.spotId,
                //check for bookings that start or end within the request booking
                [Op.or]: [{
                    startDate: {
                        [Op.between]:[startDate,endDate]
                    }},
                    { endDate: {
                        [Op.between]:[startDate,endDate]
                    }},
                    //check for bookings that contain the requested booking dates
                    { [Op.and]:{
                        startDate:{
                            [Op.lte]: startDate
                        },
                        endDate:{
                            [Op.gte]:endDate
                        }}
                    }]
            },
        })

    if (checkEndDate) return res.status(400).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
            endDate: "End date conflicts with an existing booking"
        }
    })

    let booking = await Booking.create({
        spotId: req.params.spotId,
        userId: req.user.id,
        startDate,
        endDate
    })

    booking.toJSON()

    return res.json(booking)
})



module.exports = router;

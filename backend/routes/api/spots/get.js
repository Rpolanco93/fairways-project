const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');

//* import helper functions and checks
const { validateSpot, validateSpotsQuery, validateReview, getAvgAndImage, getAvgReviewAndCount } = require('./validator.js')
const router = express.Router();

//*Get all Spots
router.get("/", validateSpotsQuery, async (req, res, next) => {
    let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query
    let limit = size;
    let offset = size * (page - 1);

    const where = {};
    //Add dynamic query filters
    [
        {key: 'minLat', field: 'lat', op: Op.gte},
        {key: 'maxLat', field: 'lat', op: Op.lte},
        {key: 'minLng', field: 'lng', op: Op.gte},
        {key: 'maxLng', field: 'lng', op: Op.lte},
        {key: 'minPrice', field: 'price', op: Op.gte},
        {key: 'maxPrice', field: 'price', op: Op.lte},
    ].forEach(parameter => {
        if (req.query[parameter.key]) {
            if (!where[parameter.field]) {
                where[parameter.field] = {
                    [Op.and]: []
                }
            }

            const filter = {}
            filter[parameter.op] = req.query[parameter.key]

            where[parameter.field][Op.and].push(filter);
        }
    });

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

    if (!getSpot) return res.status(404).json({
        message: "Spot couldn't be found"
    });

    let spot = getAvgReviewAndCount(getSpot)

    return res.json(spot)
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

module.exports = router;

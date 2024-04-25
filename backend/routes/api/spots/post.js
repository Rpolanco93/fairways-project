const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check, body } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
//* import helper functions and checks
const { validateSpot, validateQuery, validateReview, getAvgAndImage, getAvgReviewAndCount } = require('./validator.js')
const router = express.Router();

//* validate the start and end dates for a booking
const validateBooking = [
    body('endDate')
        .exists({ checkFalsy: true })
        .toDate()
        .custom((value, { req, res }) => {
            if (req.body.endDate < req.body.startDate) {
                throw new Error ("endDate cannot come before startDate")
            }
                return true;
        }),

    body(['startDate', 'endDate'])
        .exists({ checkFalsy: true })
        .toDate()
        .withMessage((_value, meta) => `Booking requires a ${meta.path === 'startDate' ? 'startDate' : 'endDate'} that is not null and a valid date`),

    handleValidationErrors
];

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

//! review and rewrite it
//* Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, validateBooking, async (req, res, next) => {
    const spotId = parseInt(req.params.spotId);
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    if (isNaN(spotId)) {
        return res.status(400).json({ message: "Spot ID must be a valid integer" });
    }

    try {
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        if (spot.ownerId === userId) {
            return res.status(403).json({ message: "Cannot book your own spot" });
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const existingBookings = await Booking.findAll({ where: { spotId } });

        for (const booking of existingBookings) {
            const existingStartDate = new Date(booking.startDate);
            const existingEndDate = new Date(booking.endDate);
            let errorMessage = {};
            // Check if the new booking dates conflict with existing bookings
            if ((startDateObj <= existingEndDate && startDate >= existingStartDate) || startDateObj.getTime() === existingEndDate.getTime()) {
                errorMessage.startDate = "Start date conflicts with an existing booking"
            }

            if (endDateObj > existingStartDate || endDateObj.getTime() === existingStartDate.getTime()) {
                errorMessage.endDate = "End date conflicts with an existing booking"
            }

            return res.status(403).json({ message: "Sorry, this spot is already booked for the specified dates", errors: errorMessage });


            // if ((startDateObj < existingEndDate && endDateObj > existingStartDate) ||
            //     startDateObj.getTime() === existingEndDate.getTime() ||
            //     endDateObj.getTime() === existingStartDate.getTime()) {
            //     return res.status(403).json({ message: "Sorry, this spot is already booked for the specified dates" });
            // }
        }


        const newBooking = await Booking.create({ userId, spotId, startDate, endDate });
        res.status(200).json(newBooking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
})


module.exports = router;

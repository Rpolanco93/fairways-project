const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking, sequelize } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check, body } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
//* import helper functions and checks
const { validateSpot, validateQuery, validateReview, getAvgAndImage, getAvgReviewAndCount } = require('./validator.js')
const { validateBooking } = require('../bookings/validator.js')
const {addSpotImage} = require("./helper");
const {validateSpotImages} = require("../spot-images/validator");

const router = express.Router();

//* Create a Spot
router.post("/",
    requireAuth, validateSpot, validateSpotImages,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { address, city, state, country, lat, lng, name, description, price} = req.body

        try {
            //Create spot
            const spot = await Spot.create({ownerId, address, city, state, country, lat, lng, name, description, price})

            //Check to see if images have been included
            const images = req.body.images;
            console.log(images)
            if (Array.isArray(images) && images.length > 0) {
                for (const image of images) {
                    await addSpotImage(spot, image.url, image.preview)
                }
            }

            //Return created spot
            return res.status(201).json(spot)
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

        return res.json((await addSpotImage(spot, url, previewImage)));
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

/*
 * TODO: Existing booking logic is incorrect and didn't prevent overlaps. I used the postgres method to make it pass
 *  but you will need to figure out how you want to resolve this.
 */
//! review and rewrite it
//* Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, validateBooking, async (req, res, next) => {
    //Lookup spot based on spotId
    const spot = await Spot.findByPk(req.params.spotId);

    //If no spot is found return an error message
    if (!spot) {
        return res.status(404).json({message: "Spot couldn't be found"});
    }

    //Cannot book our own spot
    if (req.user.id === spot.ownerId) {
        return res.status(403).json({message: "Spot must NOT belong to the current user"});
    }

    //Check for overlap
    const overlap = await Booking.findOne({
        where: {
            [Op.and]: [
                {
                    spotId: req.params.spotId
                },
                sequelize.where(
                    sequelize.fn('DATERANGE', sequelize.col('startDate'), sequelize.col('endDate'), '[]'),
                    '&&',
                    sequelize.fn('DATERANGE', req.body.startDate, req.body.endDate, '[]')
                )
            ]
        }
    });

    //Abort on overlap
    if (overlap) {
        return res.status(403).json({
            message: "Sorry, this spot is already booked for the specified dates",
            errors: {
                "startDate": "Start date conflicts with an existing booking",
                "endDate": "End date conflicts with an existing booking"
            }
        });
    }

    //Add the booking for the spot
    const booking = await spot.createBooking({
        userId: req.user.id,
        spotId: req.params.spotId,
        startDate: req.body.startDate,
        endDate: req.body.endDate
    });

    //Return bookings
    return res.status(200).json(booking);
    /*
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
    */
})


module.exports = router;

const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');

const router = express.Router();

//* Get all Bookings of the Current User
router.get("/session",
    requireAuth,
    async (req, res, next) => {
    const userId = req.user.id
    // const findReview = await Review.findByPk(reviewId, {
    //     include: { model: ReviewImages, attributes: []},
    //     attributes: {
    //         include: [[Sequelize.fn('count', Sequelize.col('ReviewImages.id')), 'reviewImageCount']]
    //     }
    // })

    try {
        const Bookings = await Booking.findAll({
            where: {
                userId
            },
            include: [
                {
                    model: Spot,
                    include: [{
                        model: SpotImages,
                        where: {
                            previewImage: true
                        },
                    }],
                    attributes: {
                        exclude: ['description', 'createdAt', 'updatedAt']
                    }
                }
            ]
        })

        return res.json(Bookings)

    } catch(err) {
        return next(err)
    }

})

module.exports = router;

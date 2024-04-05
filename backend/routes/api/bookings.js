const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');

const router = express.Router();

//* Get all Bookings of the Current User
//! production err: {"title":"Server Error","message":"column Booking.SpotId does not exist","stack":null}
router.get("/current",
    requireAuth,
    async (req, res, next) => {
    try {
        const getBookings = await Booking.findAll({
            where: {
                userId: req.user.id
            }
        })

        return res.json({ Bookings: getBookings})

    } catch(err) {
        return next(err)
    }

})

module.exports = router;

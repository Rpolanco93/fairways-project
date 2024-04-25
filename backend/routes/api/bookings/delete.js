const express = require('express');

const { restoreUser, requireAuth } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models');
const { Op, Sequelize } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')

const router = express.Router()

//* Delete a Booking
router.delete("/:bookingId", requireAuth, async (req, res, next) => {
    let booking = await Booking.findByPk(req.params.bookingId)
    let currDate = new Date()
    currDate.setUTCHours(0,0,0,0)
    const startDateObj = new Date(booking.startDate);
    const endDateObj = new Date(booking.endDate);

    if (!booking || req.params.bookingId === null) return res.status(404).json({
      message: "Booking couldn't be found"
    })

    //check that curr user owns spot
    if (booking.userId !== req.user.id) return res.status(400).json({
        message: "Not Authorized"
    })

    if (startDateObj < currDate && endDateObj > currDate) return res.status(403).json({
        message: "Bookings that have been started can't be deleted"
    })

    await Booking.destroy({ where: { id: req.params.bookingId }})

    return res.json({
        "message": "Successfully deleted"
      })
})

module.exports = router;

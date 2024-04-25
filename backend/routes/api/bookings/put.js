const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check, body } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const router = express.Router();

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



//* Update and return an existing booking.
//requireAuth
router.put('/:bookingId', requireAuth, validateBooking, async (req, res) => {
    let { startDate, endDate } = req.body;
    const bookingId = req.params.bookingId;
    const userId = req.user.id;
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    let currDate = new Date()
    currDate.setUTCHours(0,0,0,0)

    try {
        let booking = await Booking.findByPk(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking couldn't be found" });
        }

        if (booking.userId !== userId) {
            return res.status(403).json({ "message": "Forbidden"});
        }

        if (endDate < currDate) {
            return res.status(403).json({ message: "Past bookings can't be modified" });
        }

        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        const existingBookings = await Booking.findAll({
            where: {
                spotId: booking.spotId,
                id: { [Sequelize.Op.ne]: bookingId }
            }
        });

        for (const existingBooking of existingBookings) {
            const existingStartDate = new Date(existingBooking.startDate);
            const existingEndDate = new Date(existingBooking.endDate);

            if ((startDateObj < existingEndDate && endDateObj > existingStartDate) ||
                startDateObj.getTime() === existingEndDate.getTime() ||
                endDateObj.getTime() === existingStartDate.getTime()) {
                return res.status(403).json({
                    message: "Sorry, this spot is already booked for the specified dates",
                    errors: {
                        startDate: "Start date conflicts with an existing booking",
                        endDate: "End date conflicts with an existing booking"
                    }
                });
            }
        }

        booking.startDate = startDate;
        booking.endDate = endDate;
        await booking.save();

        res.status(200).json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
  });

module.exports = router;

const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking, sequelize } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check, body } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const { validateBooking } = require('./validator.js')

const router = express.Router();

/*
 * TODO: Existing booking logic is incorrect and didn't prevent overlaps. I used the postgres method to make it pass
 *  but you will need to figure out how you want to resolve this.
 */
//* Update and return an existing booking.
//requireAuth
router.put('/:bookingId', requireAuth, validateBooking, async (req, res) => {
    //Lookup spot based on spotId
    const booking = await Booking.findByPk(req.params.bookingId);

    //If no spot is found return an error message
    if (!booking) {
        return res.status(404).json({message: "Booking couldn't be found"});
    }

    //If booking isn't owned by the current user
    if (booking.userId !== req.user.id) {
        return res.status(403).json({message: "Forbidden"});
    }

    //Check for overlap
    const overlap = await Booking.findOne({
        where: {
            [Op.and]: [
                {
                    [Op.not]: {
                        id: req.params.bookingId
                    }
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

    //Update the booking
    await booking.update({
        startDate: req.body.startDate,
        endDate: req.body.endDate
    });

    //Return bookings
    return res.status(200).json(booking);

    /*
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
    */
  });

module.exports = router;

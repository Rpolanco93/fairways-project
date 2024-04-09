const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation.js')

const router = express.Router()

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
      .withMessage('Price per day is required'),
    handleValidationErrors
];


function getPreviewImage(findAll) {
    let preview = findAll.map(Booking => {
        const jsonSpot = Booking.toJSON();
        if (jsonSpot.Spot.SpotImages[0]) {
            jsonSpot.Spot.previewImage = jsonSpot.Spot.SpotImages[0].url;
          } else {
            jsonSpot.Spot.previewImage = null;
          }
          delete jsonSpot.Spot.SpotImages
        return jsonSpot;
      });
    return preview
}

//* Get all Bookings for a Spot based on the Spot's id
router.get("/current", requireAuth, async (req, res, next) => {
    let findAll = await Booking.findAll({
        where: {
            userId: req.user.id
        },
        include: [{
            model: Spot,
            include: [{
                model: SpotImages,
                attributes: ['url']
            }],
            attributes: {
                exclude: ['updatedAt', 'createdAt', 'description']
            }
        }]
    })

//find avg reviews and previewImage
let spots = getPreviewImage(findAll)

return res.json({Bookings: spots})
})

//* Update and return an existing booking. old
// router.put("/:bookingId", requireAuth, async (req, res, next) => {
//     let { startDate, endDate } = req.body;
//     startDate = new Date(startDate);
//     endDate = new Date(endDate);

//     let booking = await Booking.findByPk(req.params.bookingId)

//     if (!booking) return res.status(404).json({
//         message: "Booking couldn't be found"
//     })
//     let currDate = new Date(Sequelize.literal('CURRENT_TIMESTAMP'))

//     if (booking.startDate < currDate) return res.status(403).json({
//         message: "Past bookings can't be modified"
//     })

//     //check that startDate is in the future and greater than the end date
//     if (startDate < currDate || endDate <= startDate) return res.status(400).json({
//         "message": "Bad Request",
//         "errors": {
//           "startDate": "startDate cannot be in the past",
//           "endDate": "endDate cannot be on or before startDate"
//         }
//     })

//     booking.update({ startDate, endDate })

//     return res.json(booking)
// })

//* Update and return an existing booking.
router.put('/:bookingId', requireAuth, async (req, res) => {
  const { startDate, endDate } = req.body;
  const bookingId = req.params.bookingId;
  const userId = req.user.id;
  startDate = new DATEONLY(startDate);
  endDate = new DATEONLY(endDate);

  //check that startDate is in the future and greater than the end date
  let currDate = new DATEONLY(Sequelize.literal('CURRENT_TIMESTAMP'))

  try {
      const booking = await Booking.findByPk(bookingId);
      if (!booking) {
          return res.status(404).json({ message: "Booking couldn't be found" });
      }

      if (booking.userId !== userId) {
          return res.status(403).json({ message: "Not authorized to edit this booking" });
      }

      if (endDate < currDate) {
          return res.status(403).json({ message: "Past bookings can't be modified" });
      }

      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      if (startDateObj >= endDateObj) {
          return res.status(400).json({ errors: { endDate: "endDate cannot come before startDate" } });
      }

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

//* Delete a Booking
router.delete("/:bookingId", requireAuth, async (req, res, next) => {
    let booking = await Booking.findByPk(req.params.bookingId)

    if (!booking) return res.status(404).json({
      message: "Booking couldn't be found"
    })

    //check that curr user owns spot
    if (booking.userId !== req.user.id) return res.status(400).json({
        message: "Not Authorized"
    })

    let currDate = new Date(Sequelize.literal('CURRENT_TIMESTAMP'))

    if (booking.startDate < currDate && booking.endDate > currDate) return res.status(403).json({
        message: "Bookings that have been started can't be deleted"
    })

    await Booking.destroy({ where: { id: req.params.bookingId }})

    return res.json({
        "message": "Successfully deleted"
      })
})

module.exports = router;

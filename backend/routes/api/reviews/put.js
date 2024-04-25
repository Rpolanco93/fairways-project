const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const router = express.Router();

//validation function
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
];


//* Update and return an existing review.
router.put("/:reviewId",
requireAuth, validateReview,
async (req, res, next) => {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { review , stars } = req.body
try {
    const findReview = await Review.findByPk(reviewId)

    if (!findReview) return res.status(404).json({
        message: "Review couldn't be found"
    })

    if (userId !== findReview.userId) {
        return res.status(403).json({
          message: "Forbidden"
        })
    }

    await findReview.update({ review, stars })

    res.json(findReview)

} catch(err) {
    return next(err)
}
})

module.exports = router;

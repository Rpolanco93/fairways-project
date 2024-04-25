const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const router = express.Router();

//* Delete an existing review.
router.delete("/:reviewId",
    requireAuth,
    async (req, res, next) => {
        const userId = req.user.id;
        const { reviewId } = req.params;
    try {
        const findReview = await Review.findByPk(reviewId)

        if (!findReview) return res.status(404).json({
            message: "Review couldn't be found"
        })

        if (req.user.id !== findReview.userId) {
            return res.status(403).json({
              message: "Forbidden"
            })
        }

        await findReview.destroy()

        res.json({
            "message": "Successfully deleted"
          })

    } catch(err) {
        return next(err)
    }

})

module.exports = router;

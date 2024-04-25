const express = require('express');

const { restoreUser, requireAuth } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models');
const { Op, Sequelize } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')

const router = express.Router()

//* Delete a Review Image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
    let image = await ReviewImages.findByPk(req.params.imageId)
    if (!image) return res.status(404).json({
        "message": "Review Image couldn't be found"
    })

    let review = await Review.findByPk(image.reviewId)
    if (review.userId !== req.user.id) return res.status(403).json({
        "message": "Forbidden"
      })

    await ReviewImages.destroy({where: {id: req.params.imageId}})

    res.json({
        "message": "Successfully deleted"
    })
})


module.exports = router;

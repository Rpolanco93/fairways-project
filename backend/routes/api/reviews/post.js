const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../../utils/validation.js')
const router = express.Router();

//* Add an Image to a Review based on the Review's id
router.post("/:reviewId/images",
    requireAuth,
    async (req, res, next) => {
        const review = await Review.findByPk(req.params.reviewId);
        if (!review) return res.status(404).json({
            message: "Review couldn't be found"
          })
          if (review.userId !== req.user.id) {
            return res.status(403).json({
              message: 'Forbidden'
            })
        }
        const count = await review.countReviewImages();
        if (count > 9 ) {
            return res.status(403).json({
                "message": "Maximum number of images for this resource was reached"
              })
        }
          const image = (await review.createReviewImage(req.body)).toJSON()
          const {id, url} = image
          res.json({
              id,
              url
          })
})



module.exports = router;

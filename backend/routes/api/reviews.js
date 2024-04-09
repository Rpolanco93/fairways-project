const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');
const { check } = require('express-validator')
const { handleValidationErrors } = require('../../utils/validation.js')
const router = express.Router();

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

//* Get all Reviews of the Current User
router.get("/current",
    requireAuth,
    async (req, res, next) => {
    const userId = req.user.id
    let getReviews = await Review.findAll({
        where: {
            userId
        },
        include: [
            {
                model: User,
                attributes: ["id", 'firstName', 'lastName']
            },
            {
                model: Spot,
                include: [{
                    model: SpotImages,
                    where: {
                        previewImage: true
                    }
                }],
                attributes: {
                    exclude: ['description', 'createdAt', 'updatedAt']
                }
            },
            {
                model: ReviewImages,
                attributes: ['id', 'url']
            }
        ]
    })

    getReviews = getReviews.map(review => {
        const jsonSpot = review.toJSON();
        if (jsonSpot.Spot.SpotImages[0]) {
            jsonSpot.Spot.previewImage = jsonSpot.Spot.SpotImages[0].url;
          } else {
            jsonSpot.Spot.previewImage = null;
          }
          delete jsonSpot.Spot.SpotImages
        return jsonSpot;
      });

    return res.json({Reviews: getReviews})
})

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

//* Update and return an existing review.
router.put("/:reviewId",
requireAuth, validateReview,
async (req, res, next) => {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { review , stars } = req.body
try {
    const findReview = await Review.findByPk(reviewId)

    if (!findReview) return res.status(400).json({
        message: "Review couldn't be found"
    })

    if (req.user.id === review.userId) {
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

//* Delete an existing review.
router.delete("/:reviewId",
    requireAuth,
    async (req, res, next) => {
        const userId = req.user.id;
        const { reviewId } = req.params;
    try {
        const findReview = await Review.findByPk(reviewId)

        if (!findReview) return res.status(404).json({
            message: "Your review couldn't be found"
        })

        if (req.user.id === review.userId) {
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

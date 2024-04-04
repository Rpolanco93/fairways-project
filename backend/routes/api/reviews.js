const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');

const router = express.Router();

//* Get all Reviews of the Current User
router.get("/session",
    requireAuth,
    async (req, res, next) => {
    //! need to find out how to add previewImage to Spot
    const userId = req.user.id
    const Reviews = await Review.findAll({
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
                    },
                    attributes: []
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

    return res.json({Reviews})
})

//* Add an Image to a Review based on the Review's id
router.post("/:reviewId/images",
    requireAuth,
    async (req, res, next) => {
        const userId = req.user.id;
        const { reviewId } = req.params;
        const { url } = req.body
    try {
        const findReview = await Review.findByPk(reviewId, {
            include: { model: ReviewImages, attributes: []},
            attributes: {
                include: [[Sequelize.fn('count', Sequelize.col('ReviewImages.id')), 'reviewImageCount']]
            }
        })

        let review = findReview.toJSON()

        if (!review.id) {
            const err = new Error("Error")
            err.status = 404
            err.body = {
                "message": "Review couldn't be found",
              }
            return next(err)
        }

        if (review.reviewImageCount == "10") {
            const err = new Error("Error")
            err.status = 403
            err.body = {
                "message": "Maximum number of images for this resource was reached",
              }
            return next(err)
        }

        const newImage = await ReviewImages.create({
            reviewId, url
        })

        return res.json({
            id: newImage.id,
            url
        })

    } catch(err) {
        return next(err)
    }
})

//* Update and return an existing review.
router.put("/:reviewId",
requireAuth,
async (req, res, next) => {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { review , stars } = req.body
try {
    if (!review || !stars) {
        const err = new Error("Error")
        err.status = 400
        err.body = {
            "message": "Bad Request",
            "errors": {
              "review": "Review text is required",
              "stars": "Stars must be an integer from 1 to 5",
            }
          }
        return next(err)
    }

    const findReview = await Review.findByPk(reviewId)

    if (!findReview.id) {
        const err = new Error("Error")
        err.status = 404
        err.body = {
            "message": "Review couldn't be found"
          }
        return next(err)
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

        if (!findReview.id) {
            const err = new Error("Error")
            err.status = 404
            err.body = {
                "message": "Review couldn't be found"
              }
            return next(err)
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

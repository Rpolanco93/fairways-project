const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');

const router = express.Router();

//*Get all Spots
router.get("/", async (req, res, next) => {
    const spotsList = await Spot.findAll({
        include: [
            { model: Review },
            { model: SpotImages }
        ]
    })
    //cannot toJSON an array from findAll
    let allSpots = [];
    //go through the spots and toJSON each one individually
    spotsList.forEach(spot => {
        allSpots.push(spot.toJSON())
    });
    //go through the spotsList arr and find the avg rating and preview image
    let Spots = Spot.calculateAvg(allSpots)

    return res.json({Spots})
})

//*Get all Spots owned by Current User
router.get("/session",
    restoreUser,
    async (req, res, next) => {
        const getSpots = await Spot.findAll({
            where: {
                ownerId: req.user.id
            },
            include: [
                { model: Review },
                { model: SpotImages }
            ]
        })

    //cannot toJSON an array from findAll
    let allSpots = [];
    //go through the spots and toJSON each one individually
    getSpots.forEach(spot => {
        allSpots.push(spot.toJSON())
    });
    //go through the spotsList arr and find the avg rating and preview image
    let Spots = Spot.calculateAvg(allSpots)

    return res.json({Spots})
})

//* Get details of a Spot from an id
router.get("/:spotId", async (req, res, next) => {
    const { spotId } = req.params
    let getSpot = await Spot.findByPk(spotId, {
        include: [
            {
                model: Review,
                attributes: []
            },
            {
                model: SpotImages,
                attributes: ['id', 'url', ['previewImage', 'preview']]
            },
            {
                //! find out how to run the as command
                model: User,
                attributes: ['id', 'firstName', 'lastName']
            }
        ],
        attributes: {
            include: [
                [Sequelize.fn('count', Sequelize.col('Reviews.id')), 'reviewCount'],
                [Sequelize.fn('avg', Sequelize.col('stars')), 'avgStarRating']
            ]
          }
    })

    if (!getSpot.id) {
        const err = new Error(`Couldn't find a Spot with the specified id`);
        err.status = 404;
        return next(err);
    } else {
        return res.json(
            getSpot
        )
    }
})

//* Create a Spot
router.post("/",
    restoreUser,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { address, city, state, country, lat, lng, name, description, price} = req.body
        try {
            const newSpot = await Spot.create({ownerId, address, city, state, country, lat, lng, name, description, price})
            return res.json(newSpot)
        } catch(err) {
            err.status = 400;
            err.body = {
                message: "Bad Request",
                errors: {
                    address, city, state, country, lat, lng, name, description, price
                }
            }
            return next(err)
        }

})

//* Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images",
    restoreUser,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        const { url, preview } = req.body
        try {
            let spot = await Spot.findByPk(spotId)
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                return next(err);
            }
            //create new image tied to the spot
            const newImage = await SpotImages.create({spotId, url, previewImage: preview })
            newImage.toJSON()
            //create the obj to return specified fields
            const image = {
                id: newImage.id,
                url: newImage.url,
                preview: newImage.previewImage
            }

            return res.json(image)

            } catch(err) {
            return next(err)
        }
})

//* Edit Spot
router.put("/:spotId",
    restoreUser,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        const { address, city, state, country, lat, lng, name, description, price} = req.body
        try {
            let spot = await Spot.findByPk(spotId)
            //check that spot exist
            if (!spot.id) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 400;
                err.body = {
                    message: "Bad Request",
                    errors: {
                        address, city, state, country, lat, lng, name, description, price
                    }
                }
                return next(err)
            }
            //update spot
            await spot.update({
                address, city, state, country, lat, lng, name, description, price
            })

            res.json(spot)

        } catch(err) {
            return next(err)
        }
})

//* Delete an existing spot
router.delete("/:spotId",
    restoreUser,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        try {
            let spot = await Spot.findByPk(spotId)
            //check that spot exist
            if (!spot.id) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 404;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) {
                const err = new Error(`Spot couldn't be found`);
                err.status = 400;
                err.body = {
                    message: "Spot couldn't be found",
                }
                return next(err)
            }
            //delete spot
            await Spot.destroy({
                where: {
                  id: spotId,
                },
              });

            res.json({
                message: "Successfully deleted"
            })

        } catch(err) {
            return next(err)
        }
})


//* Get all Reviews by a Spot's id
router.get("/:spotId/reviews", async (req, res, next) => {
    try {
        const Reviews = await Review.findAll({
            where: {
                spotId: req.params.spotId
            },
            include: [
                {
                    model: User,
                    attributes: ["id", 'firstName', 'lastName']
                },
                {
                    model: ReviewImages,
                    attributes: ['id', 'url']
                }
            ]
        })

        if (Reviews.length == 0) {
            const err = new Error("Spot couldn't be found")
            err.status = 404
            next(err)
        } else  {
            return res.json({Reviews})
        }
    } catch(err) {
        return next(err)
    }
})

//* Create a Review for a Spot based on the Spot's id
router.post("/:spotId/reviews",
    restoreUser,
    async (req, res, next) => {
        const userId = req.user.id;
        const { spotId } = req.params;
        const { review, stars } = req.body
    try {
        //* Body validation errors
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

        //* Couldn't find a Spot with the specified id
        if (!(await Spot.count({ where: { id: spotId }}))) {
            const err = new Error("Error")
            err.status = 404
            err.body = {
                "message": "Spot couldn't be found",
              }
            return next(err)
        }

        //* Review from current user already exist
        if (await Review.count({ where: { spotId, userId }})) {
            const err = new Error("Error")
            err.status = 404
            err.body = {
                "message": "User already has a review for this spot",
              }
            return next(err)
        }

        //* if no error occurs
        const newReview = await Review.create({
            userId, spotId, review, stars
        })

        return res.status(201).json(newReview)
    } catch(err) {
        return next(err)
    }

})


module.exports = router;

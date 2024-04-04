const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages } = require('../../db/models');
const { Op, Sequelize } = require('sequelize');

const router = express.Router();

//*Get all Spots
//!failing in prod. err: {"title":"Server Error","message":"column Reviews.UserId does not exist","stack":null}
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
//!failing in prod. err: {"title":"Server Error","message":"column Reviews.UserId does not exist","stack":null}
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
//? passes in prod but may need to be refactored
// {
//     "id":3,
//     "ownerId":2,
//     "name":"Cypress Point Club",
//     "address":"3150 17 Mile Dr,",
//     "city":"Pebble Beach","state":"CA",
//     "country":"Murica","lat":56.3437,
//     "lng":2.8023,
//     "description":"Amazing ocean views",
//     "price":"150",
//     "createdAt":"2024-04-04T04:32:18.554Z",
//     "updatedAt":"2024-04-04T04:32:18.554Z",
//     "reviewCount":"1",
//? avg rating returns incorrectly
//     "avgStarRating":"4.0000000000000000",
//     "SpotImages":[{"id":3,"url":"reviewimage3.com","preview":true}],
//     "Owner":{"id":3,"firstName":"test","lastName":"tester"}}


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
                model: User,
                as: "Owner",
                attributes: ['id', 'firstName', 'lastName']
            }
        ],
        attributes: {
            include: [
                //! Won't work in postgres.. need to use reviews.sum and reviews.count
                [Sequelize.fn('count', Sequelize.col('Reviews.id')), 'reviewCount'],
                [Sequelize.fn('avg', Sequelize.col('stars')), 'avgStarRating']
            ]
        },
        group: [['Spot.id'],['Reviews.id'],['Owner.id'],['SpotImages.id']]
    })

//! refactor to remove the stack from the error message
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
//! failing in Prod. Err: {title: 'Server Error', message: 'column "SpotId" does not exist', stack: null}
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
//! failed in prod: error: {"title":"Server Error","message":"column Review.UserId does not exist","stack":null}
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
//! failed in prod err: {title: 'Server Error', message: 'Error', stack: null}
//! || {title: 'Server Error', message: 'column "UserId" does not exist', stack: null}
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

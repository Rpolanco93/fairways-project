const express = require('express');
const bcrypt = require('bcryptjs');

const { restoreUser, requireAuth } = require('../../utils/auth.js');
const { Spot, Review, SpotImages } = require('../../db/models');

const router = express.Router();

//Get all Spots
router.get("/", async (req, res, next) => {
    const spotsList = await Spot.findAll({
        include: [
            {
                model: Review
            },
            {
                model: SpotImages
            }
        ]
    })

    //cannot toJSON an array from findAll
    let Spots = [];
    let currSpot;
    //go through the spots and toJSON each one individually
    spotsList.forEach(spot => {
        Spots.push(spot.toJSON())
    });
    //go through the spotsList arr and find the avg rating and preview image
    for (let index of Spots) {
        const totalReviews = index.Reviews.length
        let totalReview = 0;
        for (let review of index.Reviews) {
            totalReview += review.stars
        }

        index.avgRating = totalReview / totalReviews

        index.SpotImages.forEach(image => {
            if (image.previewImage) {
                index.previewImage = image.url
            }
        })
        delete index.Reviews
        delete index.SpotImages
    }

    return res.json({Spots})
})



module.exports = router;

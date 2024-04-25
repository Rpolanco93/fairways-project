const express = require('express');
const { requireAuth, restoreUser } = require('../../../utils/auth.js');
const { Spot, Review, SpotImages, User, ReviewImages, Booking } = require('../../../db/models/index.js');
const { Op, Sequelize, DATE, DATEONLY } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../../utils/validation.js');
const router = express.Router();

//* Delete an existing spot
router.delete("/:spotId",
    requireAuth,
    async (req, res, next) => {
        const ownerId = req.user.id
        const { spotId } = req.params
        try {
            let spot = await Spot.findByPk(spotId)
            //check that spot exist
            if (!spot) return res.status(404).json({
                message: "Spot couldn't be found"
            })
            //check that curr user owns spot
            if (spot.ownerId !== ownerId) return res.status(404).json({
                message: "Forbidden"
            })

            delete spot
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

module.exports = router;

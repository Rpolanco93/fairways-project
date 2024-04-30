const express = require('express');
const fs = require('fs');
const path = require("path");

const router = express.Router();

const Database = require('../../db/models');

const counts = async () => {
    return {
        User: (await Database.User.count()),
        Spot: (await Database.Spot.count()),
        SpotImage: (await Database.SpotImages.count()),
        Review: (await Database.Review.count()),
        ReviewImage: (await Database.ReviewImages.count()),
        Booking: (await Database.Booking.count())
    };
}

router.get('/database/truncate', async (_req, res, _next) => {
    await Database.sequelize.query(`TRUNCATE TABLE "${process.env.SCHEMA}"."Users" RESTART IDENTITY CASCADE`);

    return res.json(await counts());
});

router.get('/database/seed', async (_req, res, next) => {
    const directory = __dirname + '/../../db/seeders/';

    const seeders = fs.readdirSync(__dirname + '/../../db/seeders/');

    for (const seeder of seeders) {
        await require(path.join(directory, seeder)).up(Database.sequelize, Database.Sequelize);
    }

    return res.json(await counts());
});

module.exports = router;
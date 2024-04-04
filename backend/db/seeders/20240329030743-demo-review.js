'use strict';

const { Review } = require("../models")

//options package to provide the schema in prod
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define the schema in options
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        review: "Trip of a lifetime",
        stars: 5
      },
      {
        userId: 2,
        spotId: 1,
        review: "well worth the price",
        stars: 2
      },
      {
        userId: 3,
        spotId: 2,
        review: "amazing",
        stars: 4
      },      {
        userId: 2,
        spotId: 3,
        review: "amazing",
        stars: 4
      },
      {
        userId: 1,
        spotId: 4,
        review: "could be better",
        stars: 1
      },
    ], { validate: true, returning: false })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1,2,3,4] }
    }, {});
  }
};

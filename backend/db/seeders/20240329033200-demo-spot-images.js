'use strict';

const { SpotImages } = require("../models")

//options package to provide the schema in prod
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define the schema in options
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await SpotImages.bulkCreate([
      {
        spotId: 1,
        url: 'reviewimage1.com',
        previewImage: true
      },
      {
        spotId: 2,
        url: 'reviewimage2.com',
        previewImage: true
      },
      {
        spotId: 3,
        url: 'reviewimage3.com',
        previewImage: true
      },
      {
        spotId: 4,
        url: 'reviewimage4.com',
        previewImage: true
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      reviewId: { [Op.in]: [1,2,3,4,5] }
    }, {});
  }
};

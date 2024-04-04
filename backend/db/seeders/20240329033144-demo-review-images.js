'use strict';

const { ReviewImages } = require("../models")

//options package to provide the schema in prod
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define the schema in options
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await ReviewImages.bulkCreate([
      {
        reviewId: 1,
        url: 'reviewimage1.com',
        previewImage: true
      },
      {
        reviewId: 2,
        url: 'reviewimage2.com',
        previewImage: true
      },
      {
        reviewId: 3,
        url: 'reviewimage3.com',
        previewImage: true
      },
      {
        reviewId: 4,
        url: 'reviewimage4.com',
        previewImage: true
      },
      {
        reviewId: 5,
        url: 'reviewimage5.com',
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

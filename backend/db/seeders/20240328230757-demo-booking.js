'use strict';

const { Booking } = require("../models")

//options package to provide the schema in prod
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define the schema in options
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        startDate: "2024-12-31",
        endDate: "2025-01-07"
      },
      {
        spotId: 2,
        userId: 2,
        startDate: "2024-12-31",
        endDate: "2025-01-07"
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2024-12-31",
        endDate: "2025-01-07"
      },
      {
        spotId: 4,
        userId: 1,
        startDate: "2024-12-31",
        endDate: "2025-01-07"
      }
    ], { validate: true, returning: false })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1,2,3,4] }
    }, {});
  }
};

'use strict';

const { Spot } = require("../models");

//options package to provide the schema in prod
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define the schema in options
}

module.exports = {
  async up (queryInterface, Sequelize) {
   await Spot.bulkCreate([
    {
      ownerId: 1,
      name: "St. Andrews",
      address: "123 road",
      city: "St Andrews",
      state: "CA",
      country: "Scotland",
      lat: 56.3437,
      lng: 2.8023,
      description: "Considered the oldest golf course",
      price: 350
    },
    {
      ownerId: 1,
      name: "Augusta National",
      address: "2604 Washington Rd",
      city: "Augusta",
      state: "GA",
      country: "Murica",
      lat: 56.3437,
      lng: 2.8023,
      description: "Where Masters are made",
      price: 300
    },
    {
      ownerId: 2,
      name: "Cypress Point Club",
      address: "3150 17 Mile Dr,",
      city: "Pebble Beach",
      state: "CA",
      country: "Murica",
      lat: 56.3437,
      lng: 2.8023,
      description: "Amazing ocean views",
      price: 150
    },
    {
      ownerId: 3,
      name: "Shinnecock Hills",
      address: "200 Tuckahoe Rd",
      city: "Southampton",
      state: "NY",
      country: "Murica",
      lat: 56.3437,
      lng: 2.8023,
      description: "Built in 1892",
      price: 150
    },
   ], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ["St. Andrews", "Augusta National", "Cypress Point Club", "Shinnecock Hills"] }
    }, {});
  }
};

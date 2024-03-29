'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; //defines the schema in the options object
}

options.tableName = 'Users';

// /** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn(options, 'firstName', {
      type: Sequelize.STRING,
      allowNull: false,
    }, options);

    await queryInterface.addColumn(options, 'lastName',  {
      type: Sequelize.STRING,
      allowNull: false,
    }, options);
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.removeColumn(options, 'lastName');

    await queryInterface.removeColumn(options, 'firstName');
  }
};

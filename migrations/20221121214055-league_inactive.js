'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('leagues', 'inactive', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('leagues', 'inactive')
  }
};

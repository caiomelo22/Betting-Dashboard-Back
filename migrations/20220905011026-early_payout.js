'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('bets', 'earlyPayout', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('bets', 'earlyPayout')
  }
};

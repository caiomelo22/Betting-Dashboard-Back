'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('bets', 'type', {
        type: Sequelize.ENUM('Moneyline', 'Total', 'BothScore', 'Spread'),
        allowNull: false,
    })
    await queryInterface.addColumn('moneylinebets', 'spread', {
        type: Sequelize.FLOAT,
        allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('moneylinebets', 'spread')
    await queryInterface.changeColumn('bets', 'type', {
        type: Sequelize.ENUM('Moneyline', 'Total', 'BothScore'),
        allowNull: false,
    })
  }
};

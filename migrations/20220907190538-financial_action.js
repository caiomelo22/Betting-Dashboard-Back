'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('financialactions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        value: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        actionType: {
          type: Sequelize.ENUM('Withdraw', 'Deposit'),
          allowNull: true,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('financialactions');
  }
};

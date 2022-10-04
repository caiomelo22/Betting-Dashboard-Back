'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("bothScoreBets", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      betId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      prediction: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    await queryInterface.changeColumn('bets', 'type', {
        type: Sequelize.ENUM('Moneyline', 'Total', 'BothScore'),
        allowNull: false,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('bothScoreBets');
    await queryInterface.changeColumn('bets', 'type', {
        type: Sequelize.ENUM('Moneyline', 'Total'),
        allowNull: false,
    })
  }
};

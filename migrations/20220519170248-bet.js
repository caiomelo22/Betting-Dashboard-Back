'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bets", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      matchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'matches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      value: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      odds: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      won: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('Moneyline', 'Total'),
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bets');
  }
};

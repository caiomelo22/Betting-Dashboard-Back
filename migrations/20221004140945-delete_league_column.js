'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('teams', 'leagueId')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('teams', 'leagueId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'leagues', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    })
  }
};

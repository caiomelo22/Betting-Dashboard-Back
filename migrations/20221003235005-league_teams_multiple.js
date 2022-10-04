'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const teams = (await queryInterface.sequelize.query('SELECT * FROM teams WHERE leagueId IS NOT NULL'))[0]

    await queryInterface.createTable('leagueTeams', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        leagueId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'leagues', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        teamId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'teams', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        season: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
      })

      let insertRows = [];
      for(let i = 0; i < teams.length; i++) {
        insertRows.push({ teamId: teams[i].id, leagueId: teams[i].leagueId, season: 2022, createdAt: new Date(), updatedAt: new Date() });
      }
      await queryInterface.bulkInsert('leagueTeams', insertRows);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('leagueTeams');
  }
};

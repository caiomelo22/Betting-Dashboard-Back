'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("teams", {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });

    const { readFile } = require('fs/promises');
    let teams = JSON.parse(await readFile(`src/utils/teams/nba.json`, "utf8"));
    let teamsToInsert = [];
    for (let i = 0; i < teams.length; i++) {
      teamsToInsert.push({id: 1, name: teams[i].full_name, leagueId: 1, createdAt: new Date(), updatedAt: new Date() });
    }
    await queryInterface.bulkInsert('teams', teamsToInsert);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teams');
  }
};

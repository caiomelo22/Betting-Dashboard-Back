'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('leagues', [
      {id: 3, name: 'Serie B (Brazil)', sportId: 1, createdAt: new Date(), updatedAt: new Date()},
    ]);

    const { readFile } = require('fs/promises');
    let teams = JSON.parse(await readFile(`src/utils/teams/brazil_serie_b.json`, "utf8"));
    let teamsToInsert = [];
    for (let i = 0; i < teams.length; i++) {
      teamsToInsert.push({ name: teams[i].name, leagueId: 3, createdAt: new Date(), updatedAt: new Date() });
    }
    await queryInterface.bulkInsert('teams', teamsToInsert);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

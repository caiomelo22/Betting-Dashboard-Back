'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('leagues', [
      {id: 4, name: 'MLS (USA)', sportId: 1, createdAt: new Date(), updatedAt: new Date()},
    ]);

    const { readFile } = require('fs/promises');
    let teams = JSON.parse(await readFile(`src/utils/teams/mls.json`, "utf8"));
    let teamsToInsert = [];
    for (let i = 0; i < teams.length; i++) {
      teamsToInsert.push({ name: teams[i].team.name, leagueId: 4, createdAt: new Date(), updatedAt: new Date() });
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

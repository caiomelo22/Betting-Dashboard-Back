'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('leagues', [
            { id: 39, name: 'Premier League (England)', sportId: 1, createdAt: new Date(), updatedAt: new Date() },
        ]);
        const { readFile } = require('fs/promises');
        let teams = JSON.parse(await readFile(`src/utils/teams/england_premier_league.json`, "utf8"));
        let teamsToInsert = [];
        let leagueTeamsToInsert = [];
        for (let i = 0; i < teams.length; i++) {
            const teamCount = (await queryInterface.sequelize.query(`SELECT COUNT(*) FROM teams WHERE id = ${teams[i].team.id}`))[0][0]['COUNT(*)']
            if (teamCount == 0) {
                teamsToInsert.push({ id: teams[i].team.id, name: teams[i].team.name, createdAt: new Date(), updatedAt: new Date() });
            }
            leagueTeamsToInsert.push({ teamId: teams[i].team.id, leagueId: 39, season: 2022, createdAt: new Date(), updatedAt: new Date() });
        }
        if(teamsToInsert.length) {
            await queryInterface.bulkInsert('teams', teamsToInsert);
        }
        await queryInterface.bulkInsert('leagueTeams', leagueTeamsToInsert);
    },
    async down(queryInterface, Sequelize) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    }
};
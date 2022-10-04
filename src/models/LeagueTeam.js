const database = require("../database/db");
const { Team } = require("./Team");

const LeagueTeam = database.sequelize.define("leagueTeams", {
  leagueId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'leagues', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  teamId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'teams', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  season: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
  },
});

LeagueTeam.belongsTo(Team, {as: 'team'})

module.exports = {
    LeagueTeam
};
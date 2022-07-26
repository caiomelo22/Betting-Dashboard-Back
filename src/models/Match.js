const database = require("../database/db");
const Team = require('./Team').Team;
const League = require('./League').League;
const Bet = require('./Bet').Bet;

const Match = database.sequelize.define("matches", {
  leagueId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'leagues', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  homeTeamId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'teams', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  awayTeamId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'teams', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  scoreHomeTeam: {
    type: database.Sequelize.INTEGER,
    allowNull: true,
  },
  scoreAwayTeam: {
    type: database.Sequelize.INTEGER,
    allowNull: true,
  },
  matchDate: {
    type: database.Sequelize.DATE,
    allowNull: false,
  },
});

Match.belongsTo(League, { as: 'league' })
Match.belongsTo(Team, { as: 'homeTeam' });
Match.belongsTo(Team, { as: 'awayTeam' });

Bet.belongsTo(Match, {as: 'match'});
Match.hasMany(Bet, { foreignKey: 'matchId', as: 'bets' });

module.exports = {
  Match
};
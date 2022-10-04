const database = require("../database/db");
const { LeagueTeam } = require("./LeagueTeam");
const Sport = require('./Sport').Sport;

const League = database.sequelize.define("leagues", {
  sportId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'sports', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
});

League.belongsTo(Sport, { as: 'sport' });
League.hasMany(LeagueTeam, {foreignKey: 'leagueId', as: 'teams'})

module.exports = {
  League
};
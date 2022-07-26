const database = require("../database/db");
const Sport = require('./Sport').Sport;
const Team = require('./Team').Team;

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
Team.belongsTo(League);
League.hasMany(Team, { foreignKey: 'leagueId', as: 'teams' });

module.exports = {
  League
};
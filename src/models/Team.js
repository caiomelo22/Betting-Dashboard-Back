const database = require("../database/db");

const Team = database.sequelize.define("teams", {
  leagueId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'leagues', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  name: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = {
  Team
};
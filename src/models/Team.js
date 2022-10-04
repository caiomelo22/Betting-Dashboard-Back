const database = require("../database/db");

const Team = database.sequelize.define("teams", {
  name: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = {
  Team
};
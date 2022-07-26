const database = require("../database/db");

const Sport = database.sequelize.define("sports", {
  name: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = {
  Sport
};
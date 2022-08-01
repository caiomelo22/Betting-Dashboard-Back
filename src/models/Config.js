const database = require("../database/db");

const Config = database.sequelize.define("configs", {
  key: {
    type: database.Sequelize.STRING,
    allowNull: false,
  },
  value: {
    type: database.Sequelize.STRING,
    allowNull: true,
  }
});

module.exports = {
  Config
};
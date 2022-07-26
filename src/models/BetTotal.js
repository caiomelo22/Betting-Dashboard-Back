const database = require("../database/db");

const BetTotal = database.sequelize.define("totalbets", {
  betId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'bets', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  prediction: {
    type: database.Sequelize.ENUM('Over', 'Under'),
    allowNull: false,
  },
  line: {
    type: database.Sequelize.FLOAT,
    allowNull: false,
  }
});

module.exports = {
  BetTotal
};
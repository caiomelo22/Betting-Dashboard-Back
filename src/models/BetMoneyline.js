const database = require("../database/db");

const BetMoneyline = database.sequelize.define("moneylinebets", {
  betId: {
    type: database.Sequelize.INTEGER,
    allowNull: false,
    references: { model: 'bets', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  prediction: {
    type: database.Sequelize.ENUM('Home', 'Away', 'Draw'),
    allowNull: false,
  },
});


module.exports = {
  BetMoneyline
};
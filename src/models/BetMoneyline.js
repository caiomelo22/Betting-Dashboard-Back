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
  spread: {
    type: database.Sequelize.FLOAT,
    allowNull: true,
  },
  includeDraw: {
    type: database.Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
});


module.exports = {
  BetMoneyline
};
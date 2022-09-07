const database = require("../database/db");

const FinancialAction = database.sequelize.define("financialactions", {
  value: {
    type: database.Sequelize.FLOAT,
    allowNull: false,
  },
  actionType: {
    type: database.Sequelize.ENUM('Withdraw', 'Deposit'),
    allowNull: true,
  }
});

module.exports = {
    FinancialAction
};
const database = require("../database/db");
const BetMoneyline = require('./BetMoneyline').BetMoneyline;
const BetTotal = require('./BetTotal').BetTotal;
const { BetBothScore } = require('./BetBothScore')

const Bet = database.sequelize.define("bets", {
    matchId: {
        type: database.Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'matches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    value: {
        type: database.Sequelize.FLOAT,
        allowNull: true,
    },
    odds: {
        type: database.Sequelize.FLOAT,
        allowNull: true,
    },
    won: {
        type: database.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    earlyPayout: {
        type: database.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    type: {
        type: database.Sequelize.ENUM('Moneyline', 'Total', 'BothScore'),
        allowNull: false,
    },
    parlayId: {
        type: database.Sequelize.INTEGER,
        allowNull: null,
        references: { model: 'parlays', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
});

BetMoneyline.belongsTo(Bet, { as: 'bet' });
Bet.hasOne(BetMoneyline, { foreignKey: 'betId', as: 'moneyline' });

BetTotal.belongsTo(Bet, { as: 'bet' });
Bet.hasOne(BetTotal, { foreignKey: 'betId', as: 'total' });

BetBothScore.belongsTo(Bet, { as: 'bet' });
Bet.hasOne(BetBothScore, { foreignKey: 'betId', as: 'bothScore' });

module.exports = {
    Bet
};
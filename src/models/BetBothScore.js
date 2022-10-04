const database = require("../database/db");

const BetBothScore = database.sequelize.define("bothScoreBets", {
    betId: {
        type: database.Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'bets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    prediction: {
        type: database.Sequelize.BOOLEAN,
        allowNull: false,
    },
});


module.exports = {
    BetBothScore
};
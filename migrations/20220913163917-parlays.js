'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('bets', 'value', {
            type: Sequelize.FLOAT,
            allowNull: true,
        })
        await queryInterface.changeColumn('bets', 'odds', {
            type: Sequelize.FLOAT,
            allowNull: true,
        })
        await queryInterface.createTable('parlays', {
            id: {
              type: Sequelize.INTEGER,
              primaryKey: true,
              autoIncrement: true
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            finished: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            won: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            value: {
              type: Sequelize.FLOAT,
              allowNull: false,
            },
            odds: {
              type: Sequelize.FLOAT,
              allowNull: false,
            },
            createdAt: Sequelize.DATE,
            updatedAt: Sequelize.DATE,
        })
        await queryInterface.addColumn('bets', 'parlayId', {
            type: Sequelize.INTEGER,
            allowNull: null,
            references: { model: 'parlays', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('bets', 'value', {
            type: Sequelize.FLOAT,
            allowNull: false,
        })
        await queryInterface.changeColumn('bets', 'odds', {
            type: Sequelize.FLOAT,
            allowNull: false,
        })
        await queryInterface.removeColumn('bets', 'parlayId')
        await queryInterface.dropTable('parlays')
    }
};

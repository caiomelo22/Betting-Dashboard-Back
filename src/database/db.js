require('dotenv').config({ path: './.env' })
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USER, process.env.DATABASE_PASS, {
    host: process.env.DATABASE_HOST,
    dialect: "mysql"
});

module.exports = {
    Sequelize,
    sequelize
}
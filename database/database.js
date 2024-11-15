const { Sequelize } = require('sequelize');

const sequelizeInstance = new Sequelize({
    dialect: process.env.DIALECT,
    host: process.env.HOST,
    port: process.env.PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});

module.exports = sequelizeInstance;
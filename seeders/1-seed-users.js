'use strict';
const bcrypt = require('bcryptjs')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const users = [
      { email: 'admin@coffee.com', password: bcrypt.hashSync('admin123',10), role: 'admin',    createdAt: now, updatedAt: now },
      { email: 'user@coffee.com',  password: bcrypt.hashSync('user1234',10), role: 'customer', createdAt: now, updatedAt: now }
    ];
    await queryInterface.bulkInsert('Users', users, {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

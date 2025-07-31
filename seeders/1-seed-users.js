'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up (queryInterface, Sequelize) {
    // remove any existing rows for these emails
    await queryInterface.bulkDelete('Users', {
      email: [ 'admin@coffee.com', 'user@coffee.com' ]
    }, {});

    const now = new Date();
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@coffee.com',
        password: bcrypt.hashSync('admin123',10),
        role: 'admin',
        createdAt: now,
        updatedAt: now
      },
      {
        email: 'user@coffee.com',
        password: bcrypt.hashSync('user1234',10),
        role: 'customer',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {
      email: [ 'admin@coffee.com', 'user@coffee.com' ]
    }, {});
  }
};

'use strict';
const fs = require('fs').promises;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const raw = await fs.readFile('./data/details.json', 'utf8');
    const data = JSON.parse(raw).map(el => {
      delete el.id;
      el.createdAt = el.updatedAt = new Date();
      return el;
    });
    await queryInterface.bulkInsert('Details', data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Details', null, {});
  }
};

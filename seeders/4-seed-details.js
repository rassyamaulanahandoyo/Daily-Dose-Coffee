'use strict';
const fs = require('fs').promises;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const [products] = await queryInterface.sequelize.query(`SELECT id FROM "Products" ORDER BY id ASC`);

    const raw = await fs.readFile('./data/details.json', 'utf8');
    const parsed = JSON.parse(raw);

    const data = parsed.map((el, i) => {
      delete el.id;
      el.ProductId = products[i]?.id; 
      el.createdAt = el.updatedAt = new Date();
      return el;
    }).filter(el => el.ProductId); 

    await queryInterface.bulkInsert('Details', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Details', null, {});
  }
};
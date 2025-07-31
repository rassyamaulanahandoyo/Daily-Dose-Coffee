'use strict';
const fs = require('fs').promises;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // load categories.json so we can map "type" → CategoryId
    const catsRaw = await fs.readFile('./data/categories.json', 'utf8');
    const categories = JSON.parse(catsRaw);

    // load products.json
    const prodsRaw = await fs.readFile('./data/products.json', 'utf8');
    const products = JSON.parse(prodsRaw);

    // transform into the shape your Products table expects
    const data = products.map(p => {
      const cat = categories.find(c => c.name === p.type);
      return {
        name:        p.name,
        description: p.name,      
        price:       p.price,
        stock:       p.stock,
        imageURL:    p.imageURL,
        CategoryId:  cat ? cat.id : null,
        UserId:      1,           
        createdAt:   new Date(),
        updatedAt:   new Date()
      };
    });

    await queryInterface.bulkInsert('Products', data, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {truncate: true, restartIdentity:1});
  }
};

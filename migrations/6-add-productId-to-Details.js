'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('Details', 'ProductId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,                 
      references: { model: 'Products', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Details', 'ProductId');
  }
}
// Script to clear all data from the database
const mongoose = require('mongoose');
const dbConnect = require('../lib/db');
const { Income, Expense } = require('../lib/models');

async function clearDatabase() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    
    console.log('Deleting all income records...');
    const incomeResult = await Income.deleteMany({});
    console.log(`Deleted ${incomeResult.deletedCount} income records`);
    
    console.log('Deleting all expense records...');
    const expenseResult = await Expense.deleteMany({});
    console.log(`Deleted ${expenseResult.deletedCount} expense records`);
    
    console.log('All data has been deleted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase(); 
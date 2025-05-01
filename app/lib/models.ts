import mongoose from 'mongoose';

// Income Schema
const incomeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['photocopy', 'bottles'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  note: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Expense Schema
const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  note: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

export const Income = mongoose.models.Income || mongoose.model('Income', incomeSchema);
export const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema); 
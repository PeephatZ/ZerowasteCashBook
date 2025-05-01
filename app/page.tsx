'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

// Define interfaces for data
interface IncomeItem {
  _id: string;
  type: string;
  amount: number;
  date: string;
  category: string;
  note?: string;
}

interface ExpenseItem {
  _id: string;
  description: string;
  amount: number;
  date: string;
  note?: string;
}

// Combined transaction type
type Transaction = 
  | (IncomeItem & { transactionType: 'income' })
  | (ExpenseItem & { transactionType: 'expense' });

export default function HomePage() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [photocopyIncome, setPhotocopyIncome] = useState(0);
  const [bottleIncome, setBottleIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch incomes
        const incomesRes = await axios.get('/api/income');
        const incomes: IncomeItem[] = incomesRes.data;
        
        // Fetch expenses
        const expensesRes = await axios.get('/api/expense');
        const expenses: ExpenseItem[] = expensesRes.data;
        
        // Calculate income totals
        const incomeTotal = incomes.reduce((sum: number, item: IncomeItem) => sum + item.amount, 0);
        const photocopyTotal = incomes
          .filter((item: IncomeItem) => item.type === 'photocopy')
          .reduce((sum: number, item: IncomeItem) => sum + item.amount, 0);
        const bottleTotal = incomes
          .filter((item: IncomeItem) => item.type === 'bottles')
          .reduce((sum: number, item: IncomeItem) => sum + item.amount, 0);
        
        // Calculate expense total
        const expenseTotal = expenses.reduce((sum: number, item: ExpenseItem) => sum + item.amount, 0);
        
        // Calculate balance
        const remainingBalance = incomeTotal - expenseTotal;
        
        // Combine transactions for history
        const allTransactions: Transaction[] = [
          ...incomes.map(income => ({ 
            ...income, 
            transactionType: 'income' as const
          })),
          ...expenses.map(expense => ({ 
            ...expense, 
            transactionType: 'expense' as const
          }))
        ];
        
        // Sort by date (newest first)
        const sortedTransactions = allTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      
        // Update state
        setTotalIncome(incomeTotal);
        setPhotocopyIncome(photocopyTotal);
        setBottleIncome(bottleTotal);
        setTotalExpense(expenseTotal);
        setBalance(remainingBalance);
        setTransactions(sortedTransactions.slice(0, 10)); // Get 10 most recent transactions
        setError('');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Function to get transaction description
  const getTransactionDescription = (transaction: Transaction) => {
    if (transaction.transactionType === 'income') {
      return transaction.type === 'photocopy' 
        ? 'รายได้จากร้านถ่ายเอกสาร' 
        : 'รายได้จากการขายขวด';
    } else {
      return transaction.description || 'รายจ่าย';
    }
  };

  return (
    <div>
      {/* แบนเนอร์ */}
      <div className="banner">
        <div className="banner-content">
          <img src="/แบนเนอร์.png" alt="Zero Waste Banner" className="banner-image" />
        </div>
      </div>

      {/* รายงานสรุป */}
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
            รายงานสรุป
          </h2>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
        ) : (
          <>
            {/* Dashboard grid with different card sizes */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem', 
              marginBottom: '3rem'
            }}>
              {/* รายได้ทั้งหมด */}
              <div className="stats-card highlight-card" style={{ gridColumn: 'span 2' }}>
                <h3 style={{ fontSize: '1.5rem' }}>รายได้ทั้งหมด</h3>
                <div style={{ fontSize: '2.5rem' }} className="stats-value">฿{totalIncome.toLocaleString()}</div>
                <div style={{ fontSize: '1.1rem' }} className="stats-label">บาท</div>
              </div>
              
              {/* รายจ่ายทั้งหมด */}
              <div className="stats-card">
                <h3>รายจ่ายทั้งหมด</h3>
                <div className="stats-value text-red-500">฿{totalExpense.toLocaleString()}</div>
                <div className="stats-label">บาท</div>
              </div>
              
              {/* ยอดคงเหลือ */}
              <div className="stats-card primary-card">
                <h3 style={{ fontSize: '1.5rem' }}>ยอดคงเหลือ</h3>
                <div 
                  style={{ fontSize: '3rem', margin: '1rem 0' }} 
                  className={`stats-value ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  ฿{balance.toLocaleString()}
                </div>
                <div style={{ fontSize: '1.2rem' }} className="stats-label">บาท</div>
              </div>
              
              {/* รายได้จากร้านถ่ายเอกสาร */}
              <div className="stats-card secondary-card">
                <h3>รายได้จากร้านถ่ายเอกสาร</h3>
                <div className="stats-value">฿{photocopyIncome.toLocaleString()}</div>
                <div className="stats-label">บาท</div>
              </div>
              
              {/* รายได้จากการขายขวด */}
              <div className="stats-card secondary-card">
                <h3>รายได้จากการขายขวด</h3>
                <div className="stats-value">฿{bottleIncome.toLocaleString()}</div>
                <div className="stats-label">บาท</div>
              </div>
            </div>

            {/* ประวัติการทำรายการล่าสุด */}
            <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', color: 'var(--primary-color)', marginBottom: '1.5rem' }}>
                ประวัติการทำรายการล่าสุด
              </h2>
              
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                  ไม่พบรายการธุรกรรมล่าสุด
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--gray-100)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--gray-300)' }}>วันที่</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--gray-300)' }}>รายละเอียด</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid var(--gray-300)' }}>จำนวนเงิน</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid var(--gray-300)' }}>หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} style={{ backgroundColor: 'white' }}>
                          <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
                            {formatDate(transaction.date)}
                          </td>
                          <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
                            {getTransactionDescription(transaction)}
                          </td>
                          <td style={{ 
                            padding: '0.75rem', 
                            borderBottom: '1px solid var(--gray-200)', 
                            textAlign: 'right',
                            color: transaction.transactionType === 'income' ? 'var(--success-color)' : 'var(--danger-color)',
                            fontWeight: 'bold'
                          }}>
                            {transaction.transactionType === 'income' ? '+' : '-'}
                            ฿{transaction.amount.toLocaleString()}
                          </td>
                          <td style={{ padding: '0.75rem', borderBottom: '1px solid var(--gray-200)' }}>
                            {transaction.note || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 
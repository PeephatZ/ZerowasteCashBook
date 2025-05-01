'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import IncomeForm from '../components/IncomeForm';
import ExpenseForm from '../components/ExpenseForm';

type NotificationType = {
  message: string;
  type: 'success' | 'error';
};

type Transaction = {
  _id: string;
  amount: number;
  date: string;
  category: string;
  note?: string;
  type?: 'income' | 'expense';
};

export default function AdminPage() {
  const [refresh, setRefresh] = useState(0);
  const [transactions, setTransactions] = useState<{ incomes: Transaction[], expenses: Transaction[] }>({ incomes: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [editingItem, setEditingItem] = useState<{ id: string, type: 'income' | 'expense', data: Transaction } | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], // 1 เดือนย้อนหลัง
    endDate: new Date().toISOString().split('T')[0] // วันปัจจุบัน
  });

  useEffect(() => {
    // ซ่อนการแจ้งเตือนหลังจาก 3 วินาที
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        const [incomesRes, expensesRes] = await Promise.all([
          axios.get('/api/income'),
          axios.get('/api/expense')
        ]);
        setTransactions({
          incomes: incomesRes.data,
          expenses: expensesRes.data
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ โปรดลองอีกครั้งในภายหลัง');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refresh]);

  const handleRefresh = () => setRefresh(prev => prev + 1);
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const handleDelete = async (id: string, type: 'income' | 'expense') => {
    if (!confirm('คุณต้องการลบรายการนี้หรือไม่?')) return;
    
    try {
      const endpoint = type === 'income' ? `/api/income?id=${id}` : `/api/expense?id=${id}`;
      const response = await axios.delete(endpoint);
      showNotification(response.data.message, 'success');
      handleRefresh();
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('เกิดข้อผิดพลาดในการลบรายการ', 'error');
    }
  };

  const handleEdit = (id: string, type: 'income' | 'expense', data: Transaction) => {
    setEditingItem({ id, type, data });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSubmitEdit = async (formData: any) => {
    if (!editingItem) return;
    
    try {
      const { id, type } = editingItem;
      const endpoint = type === 'income' ? `/api/income?id=${id}` : `/api/expense?id=${id}`;
      const response = await axios.put(endpoint, formData);
      showNotification(response.data.message, 'success');
      setEditingItem(null);
      handleRefresh();
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('เกิดข้อผิดพลาดในการแก้ไขรายการ', 'error');
    }
  };

  const formStyles = {
    background: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '1rem'
  };

  const headingStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: 'var(--primary-color)'
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    marginLeft: '0.5rem'
  };

  const renderEditForm = () => {
    if (!editingItem) return null;

    const { type, data } = editingItem;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <h2 style={{ ...headingStyle, marginTop: 0 }}>
            แก้ไข{type === 'income' ? 'รายรับ' : 'รายจ่าย'}
          </h2>
          
          {type === 'income' ? (
            <IncomeForm 
              onSubmit={handleSubmitEdit}
              initialData={data}
              onCancel={handleCancelEdit}
              isEditing
            />
          ) : (
            <ExpenseForm 
              onSubmit={handleSubmitEdit} 
              initialData={data}
              onCancel={handleCancelEdit}
              isEditing
            />
          )}
        </div>
      </div>
    );
  };

  // ปรับปรุงฟังก์ชั่นสำหรับการส่งออกข้อมูลเป็น CSV
  const generateCSV = () => {
    // หัวตารางของไฟล์ CSV
    let csvContent = "Type,Category,Amount,Date,Note\n";
    
    const startTimestamp = new Date(exportDateRange.startDate).getTime();
    const endTimestamp = new Date(exportDateRange.endDate + 'T23:59:59').getTime();
    
    // กรองข้อมูลตามช่วงวันที่
    const filteredIncomes = transactions.incomes.filter(income => {
      const incomeDate = new Date(income.date).getTime();
      return incomeDate >= startTimestamp && incomeDate <= endTimestamp;
    });
    
    const filteredExpenses = transactions.expenses.filter(expense => {
      const expenseDate = new Date(expense.date).getTime();
      return expenseDate >= startTimestamp && expenseDate <= endTimestamp;
    });
    
    // ข้อมูลรายรับ
    filteredIncomes.forEach(income => {
      const date = new Date(income.date).toLocaleDateString('th-TH');
      const row = [
        "Income",
        income.category || "",
        income.amount || 0,
        date,
        income.note || ""
      ].map(value => `"${value}"`).join(',');
      
      csvContent += row + "\n";
    });
    
    // ข้อมูลรายจ่าย
    filteredExpenses.forEach(expense => {
      const date = new Date(expense.date).toLocaleDateString('th-TH');
      const row = [
        "Expense",
        expense.category || "",
        expense.amount || 0,
        date,
        expense.note || ""
      ].map(value => `"${value}"`).join(',');
      
      csvContent += row + "\n";
    });
    
    // คำนวณสรุปรวม
    const totalIncome = filteredIncomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;
    
    // เพิ่มข้อมูลสรุป
    csvContent += "\n";
    csvContent += '"รายรับทั้งหมด",,"' + totalIncome.toFixed(2) + '"\n';
    csvContent += '"รายจ่ายทั้งหมด",,"' + totalExpense.toFixed(2) + '"\n';
    csvContent += '"คงเหลือ",,"' + balance.toFixed(2) + '"\n';
    
    // สร้าง Blob และลิงก์สำหรับดาวน์โหลด
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${exportDateRange.startDate}-to-${exportDateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportOptions(false);
  };
  
  // แสดงตัวเลือกในการส่งออกข้อมูล
  const renderExportOptions = () => {
    if (!showExportOptions) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          width: '90%',
          maxWidth: '500px'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
            ส่งออกข้อมูลรายรับรายจ่าย
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              เริ่มต้น
            </label>
            <input 
              type="date" 
              value={exportDateRange.startDate}
              onChange={(e) => setExportDateRange({...exportDateRange, startDate: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--gray-300)' }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              สิ้นสุด
            </label>
            <input 
              type="date"
              value={exportDateRange.endDate}
              onChange={(e) => setExportDateRange({...exportDateRange, endDate: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--gray-300)' }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button 
              onClick={() => setShowExportOptions(false)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'var(--gray-200)',
                border: 'none',
                color: 'var(--gray-700)',
                cursor: 'pointer'
              }}
            >
              ยกเลิก
            </button>
            <button 
              onClick={generateCSV}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'var(--primary-color)',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ส่งออก CSV
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
          จัดการข้อมูลรายรับรายจ่าย
        </h1>
        <button 
          onClick={() => setShowExportOptions(true)}
          style={{
            backgroundColor: 'var(--secondary-color)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          ส่งออกข้อมูล CSV
        </button>
      </div>
      
      {notification && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: notification.type === 'success' ? '#ECFDF5' : '#FEE2E2',
          color: notification.type === 'success' ? '#065F46' : '#DC2626',
          borderRadius: '0.375rem', 
          marginBottom: '1rem',
          border: `1px solid ${notification.type === 'success' ? '#A7F3D0' : '#FECACA'}`
        }}>
          {notification.message}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '0.375rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        <div style={formStyles}>
          <h2 style={headingStyle}>เพิ่มรายรับ</h2>
          <IncomeForm 
            onSubmit={(data) => {
              handleRefresh();
              showNotification('เพิ่มรายรับสำเร็จ', 'success');
            }} 
          />
        </div>
        
        <div style={formStyles}>
          <h2 style={headingStyle}>เพิ่มรายจ่าย</h2>
          <ExpenseForm 
            onSubmit={(data) => {
              handleRefresh();
              showNotification('เพิ่มรายจ่ายสำเร็จ', 'success');
            }} 
          />
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2 style={headingStyle}>รายการล่าสุด</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</div>
        ) : transactions.incomes.length === 0 && transactions.expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>ยังไม่มีรายการ</div>
        ) : (
          <div>
            {[...transactions.incomes.map(item => ({ ...item, type: 'income' as const })), 
               ...transactions.expenses.map(item => ({ ...item, type: 'expense' as const }))]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((transaction) => (
                <div
                  key={transaction._id}
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '0.5rem', 
                    border: '1px solid var(--gray-200)',
                    marginBottom: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: transaction.type === 'income' ? 'var(--primary-color)' : '#DC2626' }}>
                        {transaction.category}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ fontWeight: 'bold', marginRight: '1rem' }}>
                        {(transaction.type === 'income' ? '+' : '-') + transaction.amount.toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleEdit(transaction._id, transaction.type, transaction)}
                        style={{ ...buttonStyle, backgroundColor: '#F3F4F6', color: '#374151', border: 'none' }}
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id, transaction.type)}
                        style={{ ...buttonStyle, backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none' }}
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {new Date(transaction.date).toLocaleDateString('th-TH')}
                    {transaction.note && ` - ${transaction.note}`}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
      
      {renderExportOptions()}
      {renderEditForm()}
    </div>
  );
} 
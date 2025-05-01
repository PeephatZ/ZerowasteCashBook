'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const formGroupStyle = {
  marginBottom: '1rem'
};

const labelStyle = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '500' as const,
  color: 'var(--gray-700)'
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  borderRadius: '0.375rem',
  border: '1px solid var(--gray-300)',
  transition: 'all 0.2s'
};

const buttonStyle = {
  padding: '0.75rem 1rem',
  backgroundColor: 'var(--primary-color)',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  fontWeight: '500' as const,
  cursor: 'pointer',
  transition: 'background-color 0.2s'
};

const errorStyle = {
  color: 'var(--danger-color)',
  fontSize: '0.875rem',
  marginTop: '0.5rem',
  padding: '0.5rem',
  backgroundColor: '#FEE2E2',
  borderRadius: '0.375rem',
  marginBottom: '1rem'
};

interface IncomeFormProps {
  onSubmit: (data?: any) => void;
  initialData?: {
    _id?: string;
    amount: number;
    date: string;
    category: string;
    type?: string;
    note?: string;
  };
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function IncomeForm({ onSubmit, initialData, onCancel, isEditing = false }: IncomeFormProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('');
  const [type, setType] = useState('photocopy'); // Default to photocopy
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDate(initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setCategory(initialData.category);
      setType(initialData.type || 'photocopy');
      setNote(initialData.note || '');
    }
  }, [initialData]);

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setType('photocopy');
    setNote('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Validate input data
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      setIsSubmitting(false);
      return;
    }

    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const formData = {
        amount: parseFloat(amount),
        date: new Date(date),
        category,
        type,
        note
      };
      
      console.log('Submitting income data:', formData);
      
      if (isEditing) {
        onSubmit(formData);
      } else {
        const response = await axios.post('/api/income', formData);
        console.log('Response:', response.data);
        resetForm();
        onSubmit(formData);
      }
    } catch (error: any) {
      console.error('Error processing income:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      setError(
        error.response?.data?.error || 
        'เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดลองอีกครั้ง'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      {error && (
        <div style={errorStyle}>
          <p>{error}</p>
        </div>
      )}

      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="amount">
          จำนวนเงิน
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={inputStyle}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="date">
          วันที่
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={inputStyle}
        />
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="type">
          ประเภทรายได้
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="photocopy">รายได้จากร้านถ่ายเอกสาร</option>
          <option value="bottles">รายได้จากการขายขวด</option>
        </select>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="category">
          หมวดหมู่
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          style={inputStyle}
        >
          <option value="">เลือกหมวดหมู่</option>
          <option value="daily">รายวัน</option>
          <option value="weekly">รายสัปดาห์</option>
          <option value="monthly">รายเดือน</option>
          <option value="other">อื่นๆ</option>
        </select>
      </div>

      <div style={formGroupStyle}>
        <label style={labelStyle} htmlFor="note">
          หมายเหตุ
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ ...inputStyle, minHeight: '5rem' }}
          placeholder="รายละเอียดเพิ่มเติม..."
        />
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ ...buttonStyle, backgroundColor: '#9CA3AF', flex: 1 }}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{ ...buttonStyle, flex: 1 }}
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </button>
        </div>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ ...buttonStyle, width: '100%' }}
        >
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายรับ'}
        </button>
      )}
    </form>
  );
} 
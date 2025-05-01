'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, isValid, parseISO } from 'date-fns';

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

interface ExpenseFormProps {
  onSubmit: (data?: any) => void;
  initialData?: {
    _id?: string;
    amount: number;
    date: string;
    description?: string;
    note?: string;
  };
  onCancel?: () => void;
  isEditing?: boolean;
}

export default function ExpenseForm({ onSubmit, initialData, onCancel, isEditing = false }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString());
      setDate(initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setDescription(initialData.description || '');
      setNote(initialData.note || '');
    }
  }, [initialData]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setNote('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    // Validate inputs
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      setIsSubmitting(false);
      return;
    }

    if (!description.trim()) {
      setError('กรุณาระบุรายละเอียดรายจ่าย');
      setIsSubmitting(false);
      return;
    }
    
    // Validate date - make sure it's valid
    const dateObj = new Date(date);
    if (!isValid(dateObj) || !date) {
      setError('รูปแบบวันที่ไม่ถูกต้อง');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const formData = {
        amount: parseFloat(amount),
        date: date,
        description: description.trim(),
        note: note.trim() || undefined
      };
      
      console.log('กำลังส่งข้อมูลรายจ่าย:', formData);
      
      if (isEditing) {
        onSubmit(formData);
      } else {
        const response = await axios.post('/api/expense', formData, {
          timeout: 10000
        });
        console.log('ผลลัพธ์:', response.data);
        resetForm();
        onSubmit(response.data.data);
      }
    } catch (error: any) {
      console.error('เกิดข้อผิดพลาดในการประมวลผลรายจ่าย:', error);
      
      if (error.response) {
        console.error('ข้อมูลการตอบกลับข้อผิดพลาด:', error.response.data);
        console.error('สถานะการตอบกลับข้อผิดพลาด:', error.response.status);
      } else if (error.request) {
        console.error('ไม่ได้รับการตอบกลับจากเซิร์ฟเวอร์');
      }
      
      if (error.code === 'ECONNABORTED') {
        setError('การเชื่อมต่อใช้เวลานานเกินไป โปรดลองอีกครั้ง');
      } else {
        setError(
          error.response?.data?.error || 
          error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดลองอีกครั้ง'
        );
      }
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
        <label style={labelStyle} htmlFor="description">
          รายละเอียด
        </label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={inputStyle}
          placeholder="ระบุรายละเอียดรายจ่าย"
        />
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
          {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายจ่าย'}
        </button>
      )}
    </form>
  );
} 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const handleReset = async () => {
    if (!confirm('คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้')) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setTimeout(() => {
          router.push('/admin');
          router.refresh();
        }, 3000);
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      setResult({ success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">รีเซ็ตฐานข้อมูล</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4 text-red-600 font-semibold">คำเตือน: การดำเนินการนี้จะลบข้อมูลทั้งหมดในระบบและไม่สามารถเรียกคืนได้</p>
        
        <button
          onClick={handleReset}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isLoading ? 'กำลังลบข้อมูล...' : 'ลบข้อมูลทั้งหมด'}
        </button>
        
        {result && (
          <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <p>{result.message || result.error}</p>
            {result.success && result.deleted && (
              <p className="mt-2">
                ลบรายรับ {result.deleted.income} รายการ และรายจ่าย {result.deleted.expense} รายการ
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
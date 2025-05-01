import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { Income, Expense } from '@/app/lib/models';

export async function POST() {
  try {
    await dbConnect();
    
    const incomeResult = await Income.deleteMany({});
    const expenseResult = await Expense.deleteMany({});
    
    return NextResponse.json({ 
      success: true, 
      message: 'ลบข้อมูลทั้งหมดสำเร็จ',
      deleted: {
        income: incomeResult.deletedCount,
        expense: expenseResult.deletedCount
      }
    });
  } catch (error) {
    console.error('Error in reset database:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'เกิดข้อผิดพลาดในการลบข้อมูล' 
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { Income } from '@/app/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const incomes = await Income.find().sort({ date: -1 });
    return NextResponse.json(incomes);
  } catch (error: any) {
    console.error('Error in GET /api/income:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch incomes', 
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Income POST body:', body);
    
    // Validate required fields
    if (!body.amount || isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) {
      return NextResponse.json({ error: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' }, { status: 400 });
    }

    if (!body.type || !['photocopy', 'bottles'].includes(body.type)) {
      return NextResponse.json({ error: 'กรุณาเลือกประเภทรายได้ที่ถูกต้อง' }, { status: 400 });
    }

    if (!body.category) {
      return NextResponse.json({ error: 'กรุณาเลือกหมวดหมู่' }, { status: 400 });
    }

    if (!body.date) {
      body.date = new Date();
    }
    
    await dbConnect();
    const income = await Income.create(body);
    console.log('Created income:', income);
    return NextResponse.json({ message: 'เพิ่มรายรับสำเร็จ', data: income });
  } catch (error: any) {
    console.error('Error in POST /api/income:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ถูกต้อง',
        validationErrors,
        details: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create income',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    await dbConnect();
    const deletedIncome = await Income.findByIdAndDelete(id);
    
    if (!deletedIncome) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'ลบรายรับสำเร็จ' });
  } catch (error: any) {
    console.error('Error in DELETE /api/income:', error);
    return NextResponse.json({ 
      error: 'Failed to delete income',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const body = await request.json();
    await dbConnect();
    
    const updatedIncome = await Income.findByIdAndUpdate(
      id, 
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedIncome) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'แก้ไขรายรับสำเร็จ', data: updatedIncome });
  } catch (error: any) {
    console.error('Error in PUT /api/income:', error);
    return NextResponse.json({ 
      error: 'Failed to update income',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 
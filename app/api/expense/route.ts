import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { Expense } from '@/app/lib/models';

export async function GET() {
  try {
    await dbConnect();
    const expenses = await Expense.find().sort({ date: -1 });
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('Error in GET /api/expense:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch expenses',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Expense POST body:', body);

    // Validate required fields
    if (!body.amount || isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) {
      return NextResponse.json({ error: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' }, { status: 400 });
    }

    if (!body.description) {
      return NextResponse.json({ error: 'กรุณาระบุรายละเอียดค่าใช้จ่าย' }, { status: 400 });
    }

    // Make sure date is valid
    if (!body.date) {
      body.date = new Date();
      console.log('Using default date (now):', body.date);
    } else {
      try {
        // Ensure date is a Date object for MongoDB
        const originalDate = body.date;
        body.date = new Date(body.date);
        console.log('Converted date from', originalDate, 'to', body.date);
        
        if (isNaN(body.date.getTime())) {
          console.error('Invalid date after conversion:', body.date);
          return NextResponse.json({ error: 'รูปแบบวันที่ไม่ถูกต้อง' }, { status: 400 });
        }
      } catch (error) {
        console.error('Error converting date:', error);
        return NextResponse.json({ error: 'รูปแบบวันที่ไม่ถูกต้อง' }, { status: 400 });
      }
    }
    
    // Format data for MongoDB
    const expenseData = {
      description: body.description.trim(),
      amount: parseFloat(body.amount),
      date: body.date,
      note: body.note ? body.note.trim() : undefined
    };
    
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Creating expense with data:', expenseData);
    
    const expense = await Expense.create(expenseData);
    console.log('Created expense successfully:', expense);
    return NextResponse.json({ message: 'เพิ่มรายจ่ายสำเร็จ', data: expense });
  } catch (error: any) {
    console.error('Error in POST /api/expense:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      console.error('Validation errors:', validationErrors);
      return NextResponse.json({ 
        error: 'ข้อมูลไม่ถูกต้อง',
        validationErrors,
        details: error.message 
      }, { status: 400 });
    }
    
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Server Error:', error.code, error.message);
      return NextResponse.json({ 
        error: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้',
        message: 'โปรดลองอีกครั้งในภายหลัง'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create expense',
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
    const deletedExpense = await Expense.findByIdAndDelete(id);
    
    if (!deletedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'ลบรายจ่ายสำเร็จ' });
  } catch (error: any) {
    console.error('Error in DELETE /api/expense:', error);
    return NextResponse.json({ 
      error: 'Failed to delete expense',
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
    
    const updatedExpense = await Expense.findByIdAndUpdate(
      id, 
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'แก้ไขรายจ่ายสำเร็จ', data: updatedExpense });
  } catch (error: any) {
    console.error('Error in PUT /api/expense:', error);
    return NextResponse.json({ 
      error: 'Failed to update expense',
      message: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 
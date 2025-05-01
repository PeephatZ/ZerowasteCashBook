import mongoose from 'mongoose';

// ควรตั้งค่า environment variable MONGODB_URI ในไฟล์ .env.local
// ตัวอย่าง: MONGODB_URI=mongodb+srv://username:password@testapp.psbm2.mongodb.net/?retryWrites=true&w=majority&appName=testapp
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashbook';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Global variable to maintain connection across hot reloads in development
let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = { conn: null, promise: null };

// Check if we're in development and need to use global to persist the connection
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  if (!global._mongooseCache) {
    // @ts-ignore
    global._mongooseCache = { conn: null, promise: null };
  }
  // @ts-ignore
  cached = global._mongooseCache;
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000, // increased timeout
      serverSelectionTimeoutMS: 30000, // increased timeout
      socketTimeoutMS: 30000, // added socket timeout
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 5,
    };

    console.log('Connecting to MongoDB:', MONGODB_URI);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB successfully');
        
        // Add connection error handler
        mongoose.connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
        });
        
        // Add disconnection handler
        mongoose.connection.on('disconnected', () => {
          console.warn('MongoDB disconnected. Attempting to reconnect...');
          cached.conn = null;
          cached.promise = null;
        });
        
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        if (error.name === 'MongoServerSelectionError') {
          console.error('Could not select MongoDB server. Please check your connection string and network connectivity.');
        }
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('Error awaiting MongoDB connection:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 
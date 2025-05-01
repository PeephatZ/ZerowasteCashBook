import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm py-4 mb-6">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">
          <Link href="/admin">
            ระบบจัดการ CashBook
          </Link>
        </h1>
        
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                หน้าหลัก
              </Link>
            </li>
            <li>
              <Link href="/admin/reset" className="text-gray-600 hover:text-blue-600">
                รีเซ็ตข้อมูล
              </Link>
            </li>
            <li>
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                กลับสู่หน้าเว็บไซต์
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
} 
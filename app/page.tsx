import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            QR Menü Sistemi
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Restoranınız için modern ve kullanıcı dostu dijital menü çözümü
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/admin/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Admin Girişi
            </Link>
            <Link
              href="/menu/demo-restoran"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Demo Menü
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

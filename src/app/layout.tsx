import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Cafe Boost",
  description: "Cafe management and ordering platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
            <span className="font-bold text-xl">☕ CafeBoost</span>
            <div className="space-x-4 text-sm">
              <Link href="/" className="hover:underline">Home</Link>
              <Link href="/cafes" className="hover:underline">Cafes</Link>
              <Link href="/login" className="hover:underline">Login</Link>
            </div>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

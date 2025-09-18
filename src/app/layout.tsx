import Link from "next/link";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "🌾 Farmer Price Helper",
  description: "Smart crop price forecasts for Indian farmers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-green-50 text-gray-900">
        <header className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="mr-2">🌾</span>
              Market Price Forecast
            </h1>
            <Link
      href="https://crop-yield-predictor-complete-websi.vercel.app/"
      className="hidden md:inline-block text-sm font-medium text-white
                 hover:text-yellow-200 hover:underline underline-offset-4
                 transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      Home
    </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

        <footer className="bg-gradient-to-r from-green-700 to-green-800 text-white py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm mb-2">© {new Date().getFullYear()} Farmer Price Helper</p>
            <p className="text-xs">
              Data sourced from{" "}
              <a
                href="https://data.gov.in"
                className="underline hover:text-green-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                data.gov.in
              </a>
              . Built with ❤️ for Indian farmers.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

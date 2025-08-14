import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boursorama Finance Analyzer",
  description: "Analyze your Boursorama CSV data with charts and filters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
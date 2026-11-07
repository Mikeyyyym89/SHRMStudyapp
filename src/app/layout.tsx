import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHRM Study Prep",
  description:
    "Flashcards, practice questions, and real-world scenarios for SHRM-CP and SHRM-SCP certification.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}

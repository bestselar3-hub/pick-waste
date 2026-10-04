import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PickWaste Admin',
  description: 'Waste logistics control center',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

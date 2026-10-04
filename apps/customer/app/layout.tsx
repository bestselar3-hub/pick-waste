import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PickWaste',
  description: 'Request and track waste pickups',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

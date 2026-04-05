import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flight Booking System',
  description: 'Portfolio-ready flight booking and confirmation application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

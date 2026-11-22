import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kirish',
  description:
    "Hamkor Ta'lim platformasiga kiring: topshiriqlar, guruhlar va baholaringizni bir joyda boshqaring.",
  alternates: { canonical: '/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}

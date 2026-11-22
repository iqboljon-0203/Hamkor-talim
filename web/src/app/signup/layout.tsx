import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish",
  description:
    "Hamkor Ta'lim platformasida bepul ro'yxatdan o'ting — o'qituvchi yoki o'quvchi sifatida raqamli ta'limni boshlang.",
  alternates: { canonical: '/signup' },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}

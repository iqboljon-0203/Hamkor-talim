import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = "Hamkor Ta'lim — Zamonaviy raqamli ta'lim platformasi";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)',
          color: '#f8fafc',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 30, color: '#f59e0b', fontWeight: 700, letterSpacing: 2 }}>
          HAMKOR-TALIM.UZ
        </div>
        <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, marginTop: 24, lineHeight: 1.05 }}>
          Hamkor Ta'lim
        </div>
        <div style={{ display: 'flex', fontSize: 40, marginTop: 24, color: '#cbd5e1', maxWidth: 980 }}>
          Topshiriqlar, guruhlar va baholar — o'qituvchi va o'quvchilar uchun yagona raqamli platforma
        </div>
      </div>
    ),
    size
  );
}

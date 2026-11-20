export default async function handler(req, res) {
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    'https://skmoaeimhufhetmntiie.supabase.co';
  const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbW9hZWltaHVmaGV0bW50aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjY4NjIsImV4cCI6MjA3ODYwMjg2Mn0.TkUAf9S2may5WIjXhCWWsKHwlAKmhEfGp8_PNLJfHzo';

  try {
    const startTime = Date.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    const duration = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      status: 'active',
      supabaseStatus: response.status,
      durationMs: duration,
      timestamp: new Date().toISOString(),
      message: "Supabase muvaffaqiyatli uyg'otildi va faol saqlandi (pauza bo'lishining oldi olindi)",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get('redirect') || '/';

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || clientId === 'your_google_client_id_here') {
    // Jika Google OAuth belum disetup, kembalikan pesan bantuan panduan setup
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const callbackUrl = `${protocol}://${host}/api/auth/google/callback`;

    return NextResponse.json(
      {
        success: false,
        message:
          'Fitur Google OAuth memerlukan GOOGLE_CLIENT_ID dan GOOGLE_CLIENT_SECRET di file .env.local.',
        setupGuide: {
          callbackUrl,
          instructions: [
            '1. Buka Google Cloud Console (https://console.cloud.google.com/)',
            '2. Buat Project baru atau pilih project yang sudah ada',
            '3. Buka "APIs & Services" > "Credentials" > "Create Credentials" > "OAuth client ID"',
            '4. Pilih Application Type: "Web application"',
            `5. Di "Authorized redirect URIs", tambahkan: ${callbackUrl}`,
            '6. Salin Client ID dan Client Secret ke file .env.local:',
            '   GOOGLE_CLIENT_ID=your_client_id_here',
            '   GOOGLE_CLIENT_SECRET=your_client_secret_here',
          ],
        },
      },
      { status: 501 }
    );
  }

  // Bangun Google OAuth Redirect URL
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  const state = Buffer.from(JSON.stringify({ redirect: redirectPath })).toString('base64');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}

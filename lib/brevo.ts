/**
 * Helper pengiriman email transaksional via Brevo (Sendinblue) REST API v3
 */

interface SendOtpEmailParams {
  toEmail: string;
  toName: string;
  otp: string;
}

export async function sendOtpVerificationEmail({
  toEmail,
  toName,
  otp,
}: SendOtpEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@laporkampus.ac.id';
  const senderName = process.env.BREVO_SENDER_NAME || 'LaporKampus';

  // Jika BREVO_API_KEY belum dikonfigurasi, berikan peringatan di log console namun jangan crash
  if (!apiKey || apiKey.includes('your_brevo_api_key_here')) {
    const msg = `[BREVO NOT CONFIGURED] BREVO_API_KEY belum diisi di environment variables Vercel/Server.`;
    console.error(msg);
    return {
      success: false,
      error: msg,
    };
  }

  console.log(`[BREVO SENDING] Mengirim email OTP ke ${toEmail} menggunakan sender ${senderEmail}...`);

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Kode Verifikasi LaporKampus</title>
      <style>
        body { font-family: 'Quicksand', 'Segoe UI', Arial, sans-serif; background-color: #eef1fb; margin: 0; padding: 24px; color: #2d2a45; }
        .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 24px; padding: 32px; box-shadow: 0 12px 32px rgba(109, 90, 230, 0.12); border: 1px solid #dfe4f4; }
        .header { text-align: center; margin-bottom: 24px; }
        .logo { display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #8575ea, #6d5ae6); border-radius: 16px; line-height: 48px; color: #ffffff; font-weight: bold; font-size: 20px; text-align: center; }
        .title { font-size: 20px; font-weight: 700; color: #2d2a45; margin-top: 12px; }
        .otp-box { background: #f6f4ff; border: 2px dashed #6d5ae6; border-radius: 18px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6d5ae6; font-family: monospace; }
        .footer { font-size: 11px; color: #6b6690; text-align: center; margin-top: 24px; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">LK</div>
          <div class="title">Verifikasi Akun LaporKampus</div>
        </div>
        <p>Halo, <strong>${toName}</strong>!</p>
        <p>Terima kasih telah mendaftar di <strong>LaporKampus</strong>. Masukkan kode One-Time Password (OTP) berikut untuk memverifikasi alamat email Anda:</p>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <p style="margin: 8px 0 0; font-size: 12px; color: #6b6690;">Kode berlaku selama 15 menit</p>
        </div>

        <p style="font-size: 13px; color: #6b6690;">Jangan berikan kode ini kepada siapapun demi keamanan akun kampus Anda.</p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} LaporKampus — Sistem Pelaporan Sarana & Prasarana Kampus.<br>
          Email otomatis, mohon tidak membalas pesan ini.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject: `Kode Verifikasi LaporKampus: ${otp}`,
        htmlContent: emailHtml,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      console.error('[BREVO ERROR HTTP ' + res.status + ']:', JSON.stringify(data));
      return { success: false, error: data?.message || `Brevo error HTTP ${res.status}` };
    }

    console.log('[BREVO SUCCESS] Email terkirim ke ' + toEmail + ', messageId:', data?.messageId);
    return { success: true, messageId: data?.messageId };
  } catch (err: any) {
    console.error('[BREVO CONNECTION ERROR]:', err);
    return { success: false, error: err.message || 'Koneksi ke Brevo gagal' };
  }
}

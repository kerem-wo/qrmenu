// Email service using Resend
// Fallback to console.log if RESEND_API_KEY is not set

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@qrmenu.app';

  // If no API key, log to console (development mode)
  if (!apiKey) {
    console.log('📧 Email would be sent (RESEND_API_KEY not set):');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('HTML:', options.html);
    return { success: true };
  }

  try {
    const resend = await import('resend');
    const client = new resend.Resend(apiKey);

    const { data, error } = await client.emails.send({
      from: options.from || fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data?.id);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error?.message || 'Unknown error' };
  }
}

export function generatePasswordResetEmail(resetUrl: string, restaurantName?: string): string {
  const restaurant = restaurantName || 'Restoranınız';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Şifre Sıfırlama</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${restaurant}</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Admin Paneli</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
        <h2 style="color: #1f2937; margin-top: 0;">Şifre Sıfırlama İsteği</h2>
        
        <p style="color: #4b5563;">Merhaba,</p>
        
        <p style="color: #4b5563;">
          ${restaurant} admin paneli için şifre sıfırlama talebinde bulundunuz. 
          Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            Şifremi Sıfırla
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Veya bu linki tarayıcınıza yapıştırın:<br>
          <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>⚠️ Önemli:</strong> Bu link 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
        </p>
      </div>
    </body>
    </html>
  `;
}

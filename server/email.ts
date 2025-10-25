import { Resend } from 'resend';

const resend = new Resend('re_PK6t7M7j_5MXFAge3FWvPqPfZPd7VezGg');

export async function sendPasswordResetEmail(
  toEmail: string, 
  resetToken: string,
  username: string
): Promise<void> {
  // Use localhost for testing - Resend may block unverified domains in links
  const resetUrl = `http://localhost:5000/reset-password?token=${resetToken}`;
  
  const result = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: toEmail,
    subject: 'Reset Your Orephia Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #2d2d2d;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              padding: 30px 0;
              border-bottom: 2px solid #B76E79;
            }
            .logo {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 32px;
              color: #722F37;
              font-weight: 600;
            }
            .content {
              padding: 40px 20px;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #B76E79;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: 500;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #eee;
              margin-top: 40px;
            }
            .warning {
              background-color: #fff5f5;
              padding: 15px;
              border-left: 4px solid #722F37;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">OREPHIA</div>
          </div>
          <div class="content">
            <h2 style="color: #722F37;">Password Reset Request</h2>
            <p>Hello ${username},</p>
            <p>We received a request to reset your password for your Orephia account. Click the button below to create a new password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Orephia. All rights reserved.</p>
            <p>Luxury Women's Fashion & Accessories</p>
          </div>
        </body>
      </html>
    `,
  });

  if (result.error) {
    throw new Error(`Resend API Error: ${result.error.message}`);
  }

  console.log(`Email sent successfully - ID: ${result.data?.id}`);
}

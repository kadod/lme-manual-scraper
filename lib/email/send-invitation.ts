/**
 * Email Invitation Module
 * Sends staff invitation emails using Resend (if configured)
 */

interface InvitationEmailData {
  to: string
  inviterName: string
  organizationName: string
  role: string
  inviteUrl: string
}

/**
 * Send invitation email to new staff member
 * @param data Email data including recipient, inviter info, and invitation URL
 * @returns Promise with success status
 */
export async function sendInvitationEmail(
  data: InvitationEmailData
): Promise<{ success: boolean; error?: string }> {
  const { to, inviterName, organizationName, role, inviteUrl } = data

  // Check if Resend is configured
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured. Email will not be sent.')
    console.log('Invitation URL:', inviteUrl)
    return { success: false, error: 'Email service not configured' }
  }

  try {
    // Dynamic import of resend to avoid errors if not installed
    const { Resend } = await import('resend')
    const resend = new Resend(resendApiKey)

    const emailHtml = generateInvitationEmailHtml({
      inviterName,
      organizationName,
      role,
      inviteUrl,
    })

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@lme-saas.com',
      to,
      subject: `${organizationName} へのスタッフ招待`,
      html: emailHtml,
    })

    if (result.error) {
      console.error('Failed to send invitation email:', result.error)
      return { success: false, error: result.error.message }
    }

    console.log('Invitation email sent successfully:', result.data?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Generate HTML template for invitation email
 */
function generateInvitationEmailHtml(data: {
  inviterName: string
  organizationName: string
  role: string
  inviteUrl: string
}): string {
  const { inviterName, organizationName, role, inviteUrl } = data

  const roleLabels = {
    admin: '管理者',
    member: 'メンバー',
    readonly: '閲覧者',
  }

  const roleLabel = roleLabels[role as keyof typeof roleLabels] || role

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>スタッフ招待</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #00B900;
          margin-bottom: 10px;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #00B900;
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 28px;
          border-radius: 6px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
        }
        .button:hover {
          background-color: #009000;
        }
        .info-box {
          background-color: #f5f5f5;
          border-left: 4px solid #00B900;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .expiry-notice {
          color: #e74c3c;
          font-size: 14px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">L Message SaaS</div>
          <h1 style="margin: 0; color: #333;">スタッフ招待</h1>
        </div>

        <div class="content">
          <p>こんにちは、</p>

          <p>
            <strong>${inviterName}</strong> さんから、
            <strong>${organizationName}</strong> のスタッフとして招待されました。
          </p>

          <div class="info-box">
            <strong>権限:</strong> ${roleLabel}
          </div>

          <p>
            以下のボタンをクリックして、招待を承認してください。
          </p>

          <div style="text-align: center;">
            <a href="${inviteUrl}" class="button">招待を承認する</a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            またはこのリンクをブラウザにコピー＆ペーストしてください:<br>
            <a href="${inviteUrl}" style="color: #00B900; word-break: break-all;">${inviteUrl}</a>
          </p>

          <p class="expiry-notice">
            この招待リンクは7日間有効です。期限切れの場合は、管理者に再送信を依頼してください。
          </p>
        </div>

        <div class="footer">
          <p>
            このメールに心当たりがない場合は、無視していただいて構いません。<br>
            L Message SaaS チーム
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Email templates for ForexMentor

interface InviteCodeEmailProps {
  name: string;
  inviteCode: string;
  expiresAt: number;
}

export function generateInviteCodeEmail({
  name,
  inviteCode,
  expiresAt,
}: InviteCodeEmailProps): string {
  const formattedCode = inviteCode.match(/.{1,4}/g)?.join("-") || inviteCode;
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ForexMentor Invite Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ForexMentor</h1>
              <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 16px;">Master Your Trading Psychology</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">Welcome, ${name}! 🎉</h2>

              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your invite request has been approved! We're excited to have you join our community of disciplined traders.
              </p>

              <!-- Invite Code Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 24px; text-align: center; margin: 32px 0;">
                <p style="margin: 0 0 12px; color: #e0e7ff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Your Invite Code</p>
                <div style="background-color: rgba(255, 255, 255, 0.15); border-radius: 6px; padding: 16px; margin: 0 0 12px;">
                  <p style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 3px; font-family: 'Courier New', monospace;">${formattedCode}</p>
                </div>
                <p style="margin: 0; color: #e0e7ff; font-size: 13px;">
                  This code can be used <strong style="color: #ffffff;">5 times</strong> - bring your trading buddies!
                </p>
              </div>

              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; border-radius: 4px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #1f2937; font-size: 14px; font-weight: 600;">⏰ Important Details:</p>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
                  <li>Code expires on <strong>${expiryDate}</strong></li>
                  <li>Can be shared with up to 4 friends</li>
                  <li>Each person needs their own email address</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0 24px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3004"}/sign-up"
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);">
                  Create Your Account →
                </a>
              </div>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Ready to master your trading psychology? Click the button above to get started with ForexMentor.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px;">
                Questions? Reply to this email or contact us at support@forexmentor.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ForexMentor. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

interface RequestReceivedEmailProps {
  name: string;
  status: "pending" | "flagged";
}

export function generateRequestReceivedEmail({
  name,
  status,
}: RequestReceivedEmailProps): string {
  const isPending = status === "pending";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ForexMentor Invite Request Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ForexMentor</h1>
              <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 16px;">Master Your Trading Psychology</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">Thank You, ${name}!</h2>

              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                We've received your request to join ForexMentor. ${
                  isPending
                    ? "Our team is reviewing your application."
                    : "Your application requires additional review."
                }
              </p>

              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 600;">📋 What happens next?</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                  ${
                    isPending
                      ? "We typically review applications within 24-48 hours. You'll receive an email with your invite code once approved."
                      : "We need a bit more time to review your application. We'll get back to you within 48 hours."
                  }
                </p>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  💡 <strong>Tip:</strong> While you wait, check out our blog to learn about the psychology of successful trading.
                </p>
              </div>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                We're building a community of disciplined traders who prioritize psychology over strategy. We can't wait to have you join us!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px;">
                Questions? Reply to this email or contact us at support@forexmentor.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ForexMentor. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

interface RequestRejectedEmailProps {
  name: string;
  reason?: string;
}

export function generateRequestRejectedEmail({
  name,
  reason,
}: RequestRejectedEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ForexMentor Invite Request Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ForexMentor</h1>
              <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 16px;">Master Your Trading Psychology</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; color: #1f2937; font-size: 24px; font-weight: 600;">Hi ${name},</h2>

              <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for your interest in ForexMentor. After careful review, we're unable to approve your invite request at this time.
              </p>

              ${
                reason
                  ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0 0 8px; color: #991b1b; font-size: 14px; font-weight: 600;">Reason:</p>
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  ${reason}
                </p>
              </div>
              `
                  : ""
              }

              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 600;">Want to reapply?</p>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                  You're welcome to submit a new request in the future. We're looking for traders who are committed to improving their trading psychology and maintaining consistent discipline.
                </p>
              </div>

              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                We appreciate your understanding and wish you the best in your trading journey.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; color: #9ca3af; font-size: 13px;">
                Questions? Reply to this email or contact us at support@forexmentor.com
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ForexMentor. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

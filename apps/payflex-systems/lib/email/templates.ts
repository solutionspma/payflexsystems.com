/**
 * PAYFLEX SYSTEMS - EMAIL TEMPLATES
 * Provider welcome and notification emails
 */

// Email #1: Agreement Signed - Immediate
export const EMAIL_AGREEMENT_SIGNED = {
  subject: 'Welcome to PayFlex Systems – Enrollment Complete',
  template: (providerName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2933; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background: #0a2540; color: #c9a227; padding: 32px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 14px 28px; background: #0a2540; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">PayFlex Systems</h1>
    </div>
    <div class="content">
      <h2 style="color: #0a2540; margin-top: 0;">Welcome to PayFlex, ${providerName}</h2>
      
      <p>Your Provider Program Agreement has been successfully signed.</p>
      
      <p>Our team is completing final review and will contact you shortly with activation details.</p>
      
      <h3 style="color: #0a2540;">What happens next:</h3>
      <ul>
        <li><strong>Compliance review</strong> – We verify all credentials and documentation</li>
        <li><strong>Program configuration</strong> – We set up your account and payment infrastructure</li>
        <li><strong>Go-live confirmation</strong> – You'll receive activation details and training materials</li>
      </ul>
      
      <p>This process typically takes 3-5 business days.</p>
      
      <p>Thank you for partnering with PayFlex Systems.</p>
      
      <p style="margin-top: 32px;">
        <strong>Questions?</strong><br>
        Email: support@payflexsystems.com<br>
        Website: payflexsystems.com
      </p>
    </div>
    <div class="footer">
      <p>PayFlex Systems | Payment Access Infrastructure</p>
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `
};

// Email #2: Provider Approved
export const EMAIL_PROVIDER_APPROVED = {
  subject: 'PayFlex Systems – Provider Approved ✅',
  template: (providerName: string, loginUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2933; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background: #10b981; color: #ffffff; padding: 32px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 14px 28px; background: #0a2540; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 32px;">✅ You're Approved!</h1>
    </div>
    <div class="content">
      <h2 style="color: #0a2540; margin-top: 0;">Congratulations, ${providerName}</h2>
      
      <p>Your PayFlex provider account has been <strong>approved</strong>.</p>
      
      <p>You may now begin offering PayFlex-enabled out-of-pocket payment support to your patients.</p>
      
      <p style="text-align: center;">
        <a href="${loginUrl}" class="button">Access Your Dashboard</a>
      </p>
      
      <h3 style="color: #0a2540;">Next Steps:</h3>
      <ol>
        <li><strong>Log in to your provider dashboard</strong> – Review your account settings and payment configuration</li>
        <li><strong>Complete onboarding walkthrough</strong> – 10-minute guided tour (optional but recommended)</li>
        <li><strong>Start offering PayFlex</strong> – Present payment options to patients during billing</li>
      </ol>
      
      <h3 style="color: #0a2540;">Need Help?</h3>
      <p>We're here to support you:</p>
      <ul>
        <li><strong>Support:</strong> support@payflexsystems.com</li>
        <li><strong>Documentation:</strong> docs.payflexsystems.com</li>
        <li><strong>Technical Issues:</strong> tech@payflexsystems.com</li>
      </ul>
      
      <p>Welcome to PayFlex. Let's make healthcare access work.</p>
    </div>
    <div class="footer">
      <p>PayFlex Systems | Payment Access Infrastructure</p>
    </div>
  </div>
</body>
</html>
  `
};

// Email #3: Provider Rejected
export const EMAIL_PROVIDER_REJECTED = {
  subject: 'PayFlex Systems – Application Status Update',
  template: (providerName: string, reason: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2933; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { background: #0a2540; color: #c9a227; padding: 32px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">PayFlex Systems</h1>
    </div>
    <div class="content">
      <h2 style="color: #0a2540; margin-top: 0;">Application Status Update</h2>
      
      <p>Thank you for your interest in PayFlex Systems, ${providerName}.</p>
      
      <p>After reviewing your application, we are unable to approve your provider account at this time.</p>
      
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      
      <p>If you believe this decision was made in error or if your circumstances change, please contact us at support@payflexsystems.com.</p>
      
      <p>We appreciate your interest in PayFlex Systems.</p>
    </div>
    <div class="footer">
      <p>PayFlex Systems | Payment Access Infrastructure</p>
    </div>
  </div>
</body>
</html>
  `
};

// Email #4: Dr. Parris-Specific (Optional Custom Tone)
export const EMAIL_DR_PARRIS_LIVE = {
  subject: 'We\'re Live',
  template: (providerName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.8; color: #1f2933; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .content { background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Dr. Parris,</p>
      
      <p>Your PayFlex account is active.</p>
      
      <p>You can now offer structured payment access to patients who need it.</p>
      
      <p>No complexity. No capital risk. Just infrastructure that works.</p>
      
      <p>Dashboard: <a href="https://payflexsystems.com/dashboard" style="color: #0a2540; font-weight: 600;">payflexsystems.com/dashboard</a></p>
      
      <p>Welcome to PayFlex.</p>
      
      <p style="margin-top: 32px;">
        —<br>
        PayFlex Systems
      </p>
    </div>
  </div>
</body>
</html>
  `
};

// Function to send emails (requires email service integration)
export async function sendEmail(to: string, template: { subject: string, template: (arg: any) => string }, data: any) {
  // TODO: Integrate with email service (SendGrid, Postmark, AWS SES, etc.)
  console.log('Sending email:', {
    to,
    subject: template.subject,
    html: template.template(data)
  });
  
  // Example with fetch (would need actual email service endpoint)
  // await fetch('/api/send-email', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     to,
  //     subject: template.subject,
  //     html: template.template(data)
  //   })
  // });
}

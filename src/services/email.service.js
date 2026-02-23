require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BankLedger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = 'Welcome to BankLedger - Your Account Is Ready';

  const text = `Dear ${name},

We are delighted to welcome you to BankLedger.

Your registration has been completed successfully. You may now securely access our services and begin managing your account with confidence and convenience.

At BankLedger, we are committed to delivering reliable, secure, and professional financial solutions tailored to your needs.

Warm regards,
BankLedger Support Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Welcome to BankLedger</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6fb; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fb;">
    <tr>
      <td align="center" style="padding:40px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #0b1f3a, #122b4d); padding:28px 32px; text-align:center;">
              <h1 style="margin:0; font-size:22px; letter-spacing:1px; color:#d4af37; font-weight:600;">
                BANKLEDGER
              </h1>
              <p style="margin:6px 0 0 0; font-size:13px; color:#ffffff;">
                Secure • Reliable • Professional
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px; color:#2f3440; font-size:15px; line-height:1.7;">
              
              <p style="margin-top:0;">Dear ${name},</p>

              <p style="font-size:16px;">
                <strong>Welcome to BankLedger.</strong>
              </p>

              <p>
                We are pleased to inform you that your registration has been completed successfully.
                You may now access our platform to manage your account securely and conveniently.
              </p>

              <p>
                At BankLedger, we are dedicated to providing you with trusted financial services,
                enhanced security, and a seamless digital experience.
              </p>

              <!-- Highlight box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; background:#f8f9fc; border-left:4px solid #d4af37;">
                <tr>
                  <td style="padding:14px 16px; font-size:14px; color:#444;">
                    Your account is now active and ready to use.
                  </td>
                </tr>
              </table>

              <p>
                Thank you for choosing BankLedger.
              </p>

              <p style="margin-top:28px;">
                Warm regards,<br/>
                <strong style="color:#0b1f3a;">BankLedger Support Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f3f8; padding:16px 24px; text-align:center; font-size:12px; color:#777;">
              © ${new Date().getFullYear()} BankLedger. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = 'BankLedger - Transaction Confirmation';

  const text = `Dear ${name},

We would like to inform you that your recent transaction has been completed successfully.

Transaction Details:
Amount: ${amount}
Recipient Account: ${toAccount}

If you do not recognize this transaction or believe there is an issue, please contact our support team immediately.

Thank you for choosing BankLedger.

Warm regards,
BankLedger Support Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Transaction Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6fb; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fb;">
    <tr>
      <td align="center" style="padding:40px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #0b1f3a, #122b4d); padding:28px 32px; text-align:center;">
              <h1 style="margin:0; font-size:22px; letter-spacing:1px; color:#d4af37; font-weight:600;">
                BANKLEDGER
              </h1>
              <p style="margin:6px 0 0 0; font-size:13px; color:#ffffff;">
                Secure • Reliable • Professional
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px; color:#2f3440; font-size:15px; line-height:1.7;">
              
              <p style="margin-top:0;">Dear ${name},</p>

              <p style="font-size:16px;">
                <strong>Your transaction has been completed successfully.</strong>
              </p>

              <p>
                This email is to confirm that your recent transaction on BankLedger was processed
                securely and without interruption.
              </p>

              <!-- Transaction box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; background:#f8f9fc; border-left:4px solid #d4af37;">
                <tr>
                  <td style="padding:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#444;">
                      <tr>
                        <td style="padding:4px 0;"><strong>Transferred Amount</strong></td>
                        <td style="padding:4px 0;" align="right">${amount}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;"><strong>Recipient Account</strong></td>
                        <td style="padding:4px 0;" align="right">${toAccount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p>
                If you do not recognize this transaction or believe there may be an issue,
                please contact our support team immediately for assistance.
              </p>

              <p>
                Thank you for trusting BankLedger for your financial services.
              </p>

              <p style="margin-top:28px;">
                Warm regards,<br/>
                <strong style="color:#0b1f3a;">BankLedger Support Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f3f8; padding:16px 24px; text-align:center; font-size:12px; color:#777;">
              © ${new Date().getFullYear()} BankLedger. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = 'BankLedger – Transaction Unsuccessful';

  const text = `Dear ${name},

We regret to inform you that your recent transaction could not be completed at this time.

Transaction Details:
Amount: ${amount}
Recipient Account: ${toAccount}

No funds have been deducted from your account for this transaction.

Please try again later. If the problem persists, we recommend contacting our support team for further assistance.

We apologize for the inconvenience and appreciate your understanding.

Warm regards,
BankLedger Support Team`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Transaction Unsuccessful</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6fb; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6fb;">
    <tr>
      <td align="center" style="padding:40px 12px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #0b1f3a, #122b4d); padding:28px 32px; text-align:center;">
              <h1 style="margin:0; font-size:22px; letter-spacing:1px; color:#d4af37; font-weight:600;">
                BANKLEDGER
              </h1>
              <p style="margin:6px 0 0 0; font-size:13px; color:#ffffff;">
                Secure • Reliable • Professional
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px; color:#2f3440; font-size:15px; line-height:1.7;">
              
              <p style="margin-top:0;">Dear ${name},</p>

              <p style="font-size:16px; color:#8a1f2b;">
                <strong>Your transaction could not be completed.</strong>
              </p>

              <p>
                We regret to inform you that your recent transaction on BankLedger was unsuccessful.
                No funds have been deducted from your account.
              </p>

              <!-- Transaction box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0; background:#f8f9fc; border-left:4px solid #d4af37;">
                <tr>
                  <td style="padding:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#444;">
                      <tr>
                        <td style="padding:4px 0;"><strong>Attempted Amount</strong></td>
                        <td style="padding:4px 0;" align="right">${amount}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;"><strong>Recipient Account</strong></td>
                        <td style="padding:4px 0;" align="right">${toAccount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p>
                Please try again later. If the issue continues, we recommend contacting our support
                team for further assistance.
              </p>

              <p>
                We sincerely apologize for the inconvenience and appreciate your understanding.
              </p>

              <p style="margin-top:28px;">
                Warm regards,<br/>
                <strong style="color:#0b1f3a;">BankLedger Support Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f3f8; padding:16px 24px; text-align:center; font-size:12px; color:#777;">
              © ${new Date().getFullYear()} BankLedger. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendEmail(userEmail, subject, text, html);
}
module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
};
const nodemailer = require("nodemailer");

let lastSentEmail = null; // Store for dev preview


const sendEmail = async (options) => {
  // 🧠 SMART MOCKING: If no SMTP keys, or in development, just log it beautifully
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === "your-email@gmail.com") {
    console.log("\n--- 📧 [MOCK EMAIL SENT] ---");
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log("----------------------------\n");
    lastSentEmail = { ...options, sentAt: new Date() }; // Store mock
    return;
  }


  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });


  const mailOptions = {
    from: `Nexcart <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

exports.sendResetPasswordEmail = async (email, resetUrl) => {
  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1f2937;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Nexcart</h1>
      </div>
      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-top: 0; color: #111827; font-size: 20px; font-weight: 700;">Reset your password</h2>
        <p style="font-size: 16px; line-height: 24px; color: #4b5563;">
          We received a request to reset your password for your Nexcart account. No changes have been made yet.
        </p>
        <div style="margin: 32px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; line-height: 20px; color: #6b7280; margin-bottom: 0;">
          If you didn't request this, you can safely ignore this email. This link will expire in 10 minutes.
        </p>
      </div>
      <div style="text-align: center; margin-top: 32px; color: #9ca3af; font-size: 12px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} Nexcart Inc. All rights reserved.</p>
        <p style="margin: 4px 0;">123 Commerce St, San Francisco, CA 94103</p>
      </div>
    </div>
  `;


  await sendEmail({
    email,
    subject: "Password Reset Request — Nexcart",
    html,
  });
};

exports.getLastEmail = () => lastSentEmail;


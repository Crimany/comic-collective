const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    // EMAIL_FROM must be a "Send mail as" address of GMAIL_USER, or Gmail replaces it with GMAIL_USER
    from: 'Comic Collective <' + (process.env.EMAIL_FROM || process.env.GMAIL_USER) + '>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
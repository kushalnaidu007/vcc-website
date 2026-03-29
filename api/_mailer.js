const nodemailer = require('nodemailer');

const getTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Missing SMTP env vars');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const sendEmail = async ({ subject, html, replyTo }) => {
  const from = process.env.FORMS_FROM_EMAIL;
  const to = process.env.FORMS_TO_EMAIL;

  if (!from || !to) {
    throw new Error('Missing FORMS_FROM_EMAIL or FORMS_TO_EMAIL');
  }

  const transport = getTransport();
  await transport.sendMail({
    from,
    to,
    subject,
    html,
    replyTo,
  });
};

module.exports = { sendEmail };

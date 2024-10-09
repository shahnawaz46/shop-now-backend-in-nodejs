import nodemailer from 'nodemailer';

export const sendMail = async (senderMail, subject, body) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: 'ShopNow shahnawaz85748@gmail.com',
    to: senderMail,
    subject: subject,
    // text: 'Hello to myself!',
    html: body,
  });
};

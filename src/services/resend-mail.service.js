import { resend } from "../config/resend.config.js";

const sendMail = async (to, subject, body) => {
  const { error } = await resend.emails.send({
    from: `ShopNow ${process.env.RESEND_EMAIL_FROM}`,
    to: [to],
    subject: subject,
    html: body,
  });

  if (error) {
    return console.error({ error });
  }

  console.log("Email sent");
};

export default sendMail;

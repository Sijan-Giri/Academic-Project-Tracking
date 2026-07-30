import nodemailer from 'nodemailer';
import { env } from './env';

const createTransporter = () => {
  if (env.NODE_ENV !== 'production' || !env.SMTP_HOST) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
};

export const transporter = createTransporter();

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (env.NODE_ENV !== 'production' || !env.SMTP_HOST) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject} | Body: ${html.substring(0, 100)}...`);
    return;
  }
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
};
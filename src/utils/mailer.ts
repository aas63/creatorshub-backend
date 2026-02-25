import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,
  MAIL_FROM,
} = process.env;

const transporter =
  SMTP_HOST && SMTP_PORT
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: SMTP_SECURE === "true",
        auth:
          SMTP_USER && SMTP_PASS
            ? {
                user: SMTP_USER,
                pass: SMTP_PASS,
              }
            : undefined,
      })
    : null;

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  if (!transporter || !MAIL_FROM) {
    console.warn(
      "[mailer] SMTP configuration missing; skipping verification email."
    );
    return;
  }

  await transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject: "Your CreatorsHub verification code",
    text: `Enter this code to verify your account: ${code}`,
    html: `<p>Enter this code to verify your account:</p><h2>${code}</h2>`,
  });
}

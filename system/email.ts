import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import sendGridTransport from "nodemailer-sendgrid";
import mailgunTransport from "nodemailer-mailgun-transport";

// Factory function to create the transporter based on the selected service
const createTransporter = (): Transporter => {
  const {
    EMAIL_SERVICE,
    GMAIL_ADDRESS,
    GMAIL_APP_PASSWORD,
    SENDGRID_API_KEY,
    MAILGUN_API_KEY,
    MAILGUN_DOMAIN,
  } = process.env;

  if (!EMAIL_SERVICE) {
    throw new Error("EMAIL_SERVICE environment variable must be set");
  }

  switch (EMAIL_SERVICE.toLowerCase()) {
    case "gmail":
      if (!GMAIL_ADDRESS || !GMAIL_APP_PASSWORD) {
        throw new Error(
          "GMAIL_ADDRESS and GMAIL_APP_PASSWORD must be set for Gmail service"
        );
      }
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: GMAIL_ADDRESS,
          pass: GMAIL_APP_PASSWORD,
        },
      });

    case "sendgrid":
      if (!SENDGRID_API_KEY) {
        throw new Error("SENDGRID_API_KEY must be set for SendGrid service");
      }
      return nodemailer.createTransport(
        sendGridTransport({
          apiKey: SENDGRID_API_KEY,
        })
      );

    case "mailgun":
      if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
        throw new Error(
          "MAILGUN_API_KEY and MAILGUN_DOMAIN must be set for Mailgun service"
        );
      }
      return nodemailer.createTransport(
        mailgunTransport({
          auth: {
            api_key: MAILGUN_API_KEY,
            domain: MAILGUN_DOMAIN,
          },
        })
      );

    default:
      throw new Error(`Unsupported email service: ${EMAIL_SERVICE}`);
  }
};

// Get "From" address based on email service
const getFromAddress = (): string => {
  const {
    EMAIL_SERVICE,
    GMAIL_FROM_ADDRESS,
    SENDGRID_FROM_ADDRESS,
    MAILGUN_FROM_ADDRESS,
  } = process.env;

  switch (EMAIL_SERVICE?.toLowerCase()) {
    case "gmail":
      if (!GMAIL_FROM_ADDRESS) {
        throw new Error("GMAIL_FROM_ADDRESS must be set for Gmail service");
      }
      return GMAIL_FROM_ADDRESS;

    case "sendgrid":
      if (!SENDGRID_FROM_ADDRESS) {
        throw new Error(
          "SENDGRID_FROM_ADDRESS must be set for SendGrid service"
        );
      }
      return SENDGRID_FROM_ADDRESS;

    case "mailgun":
      if (!MAILGUN_FROM_ADDRESS) {
        throw new Error("MAILGUN_FROM_ADDRESS must be set for Mailgun service");
      }
      return MAILGUN_FROM_ADDRESS;

    default:
      throw new Error("Unsupported email service or missing From address");
  }
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<string> => {
  try {
    const transporter = createTransporter();

    const mailOptions: SendMailOptions = {
      from: getFromAddress(),
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    return info.response;
  } catch (error: any) {
    console.error("Error sending email: ", error.message);
    throw new Error("Failed to send email");
  }
};

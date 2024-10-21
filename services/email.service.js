import { sendEmail } from "../system/email";
import { CustomError } from "../system/utils";

export const sendVerifyEmailCode = async (email, emailCode) => {
  try {
    const toEmail = email;
    const emailSubject = `${process.env.SITE_NAME} Email Verification`;
    const emailText = `Please use ${emailCode} to verify your email address`;
    const emailSent = sendEmail(toEmail, emailSubject, emailText);
    console.log("EMAIL SENT", emailSent);
  } catch (error) {
    throw new CustomError(`Error sending email: ${error.message}`);
  }
};

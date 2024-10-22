import { sendEmail } from "../system/email";
import { CustomError } from "../system/utils";

// Define the function with proper TypeScript typings
export const sendVerifyEmailCode = async (
  email: string,
  emailCode: string
): Promise<void> => {
  try {
    const toEmail = email;
    const emailSubject = `${
      process.env.SITE_NAME || "Our Site"
    } Email Verification`;
    const emailText = `Please use ${emailCode} to verify your email address`;

    // Ensure sendEmail returns a promise and await it
    const emailSent = await sendEmail(toEmail, emailSubject, emailText);

    console.log("EMAIL SENT", emailSent);
  } catch (error: any) {
    // If error is not an instance of Error, assign a default message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new CustomError(`Error sending email: ${errorMessage}`, 500);
  }
};

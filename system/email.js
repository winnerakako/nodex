const nodemailer = require("nodemailer");

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_ADDRESS,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: ", info.response);
    return info.response;
  } catch (error) {
    console.error("Error sending email: ", error.message);
    throw error;
  }
};

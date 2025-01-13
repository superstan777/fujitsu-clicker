const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const sendMail = async (subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Fujitsu-Clicker" <${process.env.EMAIL}>`,
      to: "viir4d@gmail.com",
      subject,
      text,
    });
    console.log("Email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

module.exports = { sendMail };

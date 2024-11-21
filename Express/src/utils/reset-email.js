const sendResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Replace with your email service
    auth: {
      user: "your-email@gmail.com",
      pass: "your-email-password",
    },
  });

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Password Reset",
    text: `Click on this link to reset your password: ${resetLink}`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };

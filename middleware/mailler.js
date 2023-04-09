const nodemailer = require('nodemailer');
const { generateToken } = require('./functions');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'prathameshghorpade933@gmail.com',
    pass: 'tzyqzqhbyzukodoi',
  },
});

const sendRegistrationEmail = async (userId, firstName, email, password) => {
  try {
    const sendEmail = await transporter.sendMail({
      from: 'helpdesk.scrobits@gmail.com',
      to: email,
      subject: 'Registration Successful',
      html: `<h2>Dear ${firstName},</h2>
      <p>Your registration was successful. Here are your login details:</p>
      <h4>Username: ${email}</h4>
      <h4>Password: ${password}</h4>
      <p>Regards,</p>
      <p>MyApp Team</p>`,
    });

    // Email sent successfully
    if (sendEmail) {
      const token = generateToken(userId);
      return {
        token,
        message: 'Registration successful',
      };
    }
    // Email not sent
    return {
      error: 'Could not send registration email',
    };
  } catch (error) {
    console.error('abcd:', error.message);
  }
};

module.exports = sendRegistrationEmail;

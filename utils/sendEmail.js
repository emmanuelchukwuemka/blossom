const { createTransport } = require('nodemailer');
const util = require('util');

// Reference to the businessController on the USAGE of this file
const transporter = createTransport({
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT || 465,
    secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});
const sendMailAsync = util.promisify(transporter.sendMail).bind(transporter);

const sendEmail = async (options) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: options.to,
		subject: options.subject,
		text: options.text,
		html: options.html,
	};
    try {
		const info = await sendMailAsync(mailOptions);
		console.log(`Email sent: ${info.response}`);
	} catch (error) {
		console.error('Error sending email:', error.message);
		throw error; // Re-throw the error to propagate it to the caller
	}
};

module.exports = sendEmail;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

// Controller function to handle contact form submission
const handleContactForm = async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide name, email, and message.' });
    }

    try {
        // --- Configure Nodemailer Transporter ---
        // Reuse the transporter setup from your forgotPassword logic
        // Ensure EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS are in your .env
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '465', 10), // Ensure port is a number
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports like 587
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail address (or service user)
                pass: process.env.EMAIL_PASS, // Your Gmail App Password (or service pass/key)
            },
             // Add TLS options if needed for certain providers or local testing
             // tls: {
             //    rejectUnauthorized: false // Use only for local development if necessary
             // }
        });

        // --- Define Mail Options ---
        const mailOptions = {
            from: `"${name}" <${email}>`, // Use sender's name and email (might get flagged as spam by some providers)
            replyTo: email, // Set the reply-to field correctly
            to: process.env.EMAIL_USER, // Send the email TO your support address (your EMAIL_USER)
            subject: `New Contact Form Submission from ${name}`, // Subject line
            text: `You received a new message from:\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`, // Plain text body
            html: `
                <p>You received a new message from the SyncSpace contact form:</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
                </ul>
                <hr>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p> 
            `, // HTML body
        };

        // --- Send Mail ---
        console.log("Attempting to send contact email...");
        await transporter.sendMail(mailOptions);
        console.log("Contact email sent successfully.");

        res.status(200).json({ message: 'Message sent successfully! We will get back to you soon.' });

    } catch (error) {
        console.error('Error sending contact email:', error);
        // Check for specific nodemailer errors if needed
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
};

export { handleContactForm };

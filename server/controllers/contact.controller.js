import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

// Controller function to handle contact form submission
const handleContactForm = async (req, res) => {
    const { name, email, message } = req.body;
    console.log("--- Contact Form Request Received ---"); // Log entry
    console.log("Received data:", { name, email, message: message ? 'Yes' : 'No' });

    // Basic validation
    if (!name || !email || !message) {
        console.log("Validation failed: Missing fields.");
        return res.status(400).json({ message: 'Please provide name, email, and message.' });
    }

    try {
        console.log("Validation passed. Configuring transporter...");
        console.log("Using Email User:", process.env.EMAIL_USER);
        console.log("Using Email Host:", process.env.EMAIL_HOST);
        console.log("Using Email Port:", process.env.EMAIL_PORT);
        console.log("Using Email Secure:", process.env.EMAIL_SECURE);
        console.log("Using Email Pass:", process.env.EMAIL_PASS ? 'Exists' : 'MISSING!'); // Check if pass exists

        // --- Configure Nodemailer Transporter ---
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '465', 10),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // Optional: Add debug logging from nodemailer itself
            // logger: true,
            // debug: true, // Enable SMTP connection debug output
        });
        console.log("Transporter configured.");


        // --- Define Mail Options ---
        const mailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`, // Send FROM your own address to avoid spam filters
            replyTo: email, // Set sender's email as reply-to
            to: process.env.EMAIL_USER, // Send TO your support address (your EMAIL_USER)
            subject: `New Contact Form Submission from ${name}`,
            text: `You received a new message from:\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: sans-serif; line-height: 1.6;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    <p>You received a new message from the SyncSpace contact form:</p>
                    <hr style="border: none; border-top: 1px solid #eee;">
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    <hr style="border: none; border-top: 1px solid #eee;">
                    <p><strong>Message:</strong></p>
                    <div style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 5px;">
                        <p style="margin: 0;">${message.replace(/\n/g, '<br>')}</p> 
                    </div>
                </div>
            `,
        };
        console.log("Mail options prepared:", { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });


        // --- Send Mail ---
        console.log("Attempting to send contact email via transporter.sendMail...");
        const info = await transporter.sendMail(mailOptions);
        console.log("Contact email sent successfully. Message ID:", info.messageId); // Log success

        res.status(200).json({ message: 'Message sent successfully! We will get back to you soon.' });

    } catch (error) {
        // Make sure errors are always logged
        console.error('!!! CATCH BLOCK - Error sending contact email:', error);
        // Log specific properties if available
        if (error.code) console.error("Error Code:", error.code);
        if (error.command) console.error("Error Command:", error.command);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
    console.log("--- Contact Form Request End ---"); // Log exit
};

export { handleContactForm };


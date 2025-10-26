import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // <-- Make sure axios is imported

// ... (SVG Icons remain the same) ...
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 inline-block text-indigo-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
);
const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 inline-block text-indigo-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
);

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [statusMessage, setStatusMessage] = useState('');
    const [isError, setIsError] = useState(false); // State to track if message is an error
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- UPDATED handleSubmit ---
    const handleSubmit = async (e) => { // Make async
        e.preventDefault();
        setLoading(true);
        setStatusMessage('');
        setIsError(false);

        try {
            // Make POST request to backend
            // --- THIS IS THE REAL API CALL ---
            const response = await axios.post('http://localhost:5000/api/contact', formData);
            // --- END REAL API CALL ---

            setStatusMessage(response.data.message); // Set success message from backend
            setFormData({ name: '', email: '', message: '' }); // Clear form
        } catch (err) {
            console.error("Contact form error:", err);
            // Set error message from backend or a default
            setStatusMessage(err.response?.data?.message || 'Error sending message. Please try again.');
            setIsError(true); // Mark message as error for styling
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };
    // --- END UPDATE ---

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <header className="text-center mb-12">
                     <Link to="/" className="text-indigo-400 hover:underline mb-4 inline-block">&larr; Back Home</Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">Contact Us</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        We'd love to hear from you. Reach out with questions, feedback, or inquiries.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info Section */}
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700">
                        <h2 className="text-2xl font-bold text-indigo-400 mb-6">Get in Touch</h2>
                        <p className="text-slate-300 mb-6 leading-relaxed">
                            Have a question about SyncSpace? Want to discuss partnership opportunities?
                            Fill out the form or contact us directly using the information below.
                        </p>
                        <div className="space-y-4">
                            <p className="flex items-center text-slate-300">
                                <MailIcon />
                                <a href="mailto:anirmay.05khan@gmail.com" className="hover:text-indigo-400 transition-colors">anirmay.05khan@gmail.com</a>
                            </p>
                            <p className="flex items-center text-slate-300">
                                <PhoneIcon />
                                <span>+91 8367833266</span>
                            </p>
                        </div>
                    </div>

                    {/* Contact Form Section */}
                    <div className="bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700">
                        <h2 className="text-2xl font-bold text-indigo-400 mb-6">Send Us a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
                                <input
                                    type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                                    className="w-full bg-slate-700 rounded p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Your Email</label>
                                <input
                                    type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                                    className="w-full bg-slate-700 rounded p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
                                    placeholder="you@example.com"
                                />
                            </div>
                             <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                                <textarea
                                    id="message" name="message" rows="4" value={formData.message} onChange={handleChange} required
                                    className="w-full bg-slate-700 rounded p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400 resize-none"
                                    placeholder="How can we help?"
                                ></textarea>
                            </div>
                            <div>
                                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                            {statusMessage && (
                                <p className={`text-sm text-center font-medium ${isError ? 'text-red-400' : 'text-green-400'}`}>
                                    {statusMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;


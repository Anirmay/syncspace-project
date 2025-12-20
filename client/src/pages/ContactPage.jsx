import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { initAOS } from '../utils/animationConfig';
import axios from 'axios';

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 }
};

const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
};

const slideIn = {
    initial: { x: -60, opacity: 0 },
    animate: { x: 0, opacity: 1 }
};

// SVG Icons
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 inline-block text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 inline-block text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 inline-block text-indigo-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

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
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [statusMessage, setStatusMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

    useEffect(() => {
        initAOS();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage('');
        setIsError(false);
        setShowSuccessAnimation(false);

        try {
            const response = await axios.post('https://syncspace-project.onrender.com/api/contact', formData);
            setStatusMessage(response.data.message);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setShowSuccessAnimation(true);
            setTimeout(() => setShowSuccessAnimation(false), 3000);
        } catch (err) {
            console.error("Contact form error:", err);
            setStatusMessage(err.response?.data?.message || 'Error sending message. Please try again.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };
    // --- END UPDATE ---

    return (
        <div className="min-h-screen bg-slate-900 text-white pt-16 pb-24 font-inter">
            <div className="container mx-auto max-w-6xl px-8">
                {/* Hero Section */}
                <motion.header 
                    className="text-center mb-24 relative"
                    initial="initial"
                    animate="animate"
                    variants={fadeIn}
                >
                    <motion.h1 
                        className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text"
                        variants={fadeInUp}
                    >
                        Get in Touch
                    </motion.h1>
                    <motion.p 
                        className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                        variants={fadeInUp}
                    >
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </motion.p>
                    
                    {/* Decorative elements */}
                    <motion.div
                        className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl -z-10"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.2, 0.3],
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    />
                </motion.header>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Left Column - Contact Info */}
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={slideIn}
                    >
                        <div className="space-y-12">
                            {/* Contact Methods */}
                            <div>
                                <motion.h2 
                                    className="text-2xl font-bold text-indigo-400 mb-8"
                                    variants={fadeInUp}
                                >
                                    Ways to Connect
                                </motion.h2>
                                <div className="space-y-6">
                                    <motion.div 
                                        className="flex items-start p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                                        whileHover={{ scale: 1.02, borderColor: "rgba(99, 102, 241, 0.5)" }}
                                    >
                                        <MailIcon />
                                        <div className="ml-2">
                                            <h3 className="text-white font-semibold mb-1">Email Us</h3>
                                            <a href="mailto:anirmay.05khan@gmail.com" className="text-slate-400 hover:text-indigo-400 transition-colors">
                                                anirmay.05khan@gmail.com
                                            </a>
                                        </div>
                                    </motion.div>
                                    
                                    <motion.div 
                                        className="flex items-start p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                                        whileHover={{ scale: 1.02, borderColor: "rgba(99, 102, 241, 0.5)" }}
                                    >
                                        <PhoneIcon />
                                        <div className="ml-2">
                                            <h3 className="text-white font-semibold mb-1">Call Us</h3>
                                            <p className="text-slate-400">+91 8367833266</p>
                                            <p className="text-sm text-slate-500">Monday - Friday, 9am - 6pm IST</p>
                                        </div>
                                    </motion.div>

                                    <motion.div 
                                        className="flex items-start p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                                        whileHover={{ scale: 1.02, borderColor: "rgba(99, 102, 241, 0.5)" }}
                                    >
                                        <LocationIcon />
                                        <div className="ml-2">
                                            <h3 className="text-white font-semibold mb-1">Visit Us</h3>
                                            <p className="text-slate-400">Kalna, India</p>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div>
                                <motion.h2 
                                    className="text-2xl font-bold text-indigo-400 mb-8"
                                    variants={fadeInUp}
                                >
                                    Frequently Asked
                                </motion.h2>
                                <div className="space-y-4">
                                    <motion.div 
                                        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                                        whileHover={{ scale: 1.02, borderColor: "rgba(99, 102, 241, 0.5)" }}
                                    >
                                        <h3 className="text-white font-semibold mb-2">What are your response times?</h3>
                                        <p className="text-slate-400 text-sm">We typically respond to inquiries within 24 hours during business days.</p>
                                    </motion.div>
                                    <motion.div 
                                        className="p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                                        whileHover={{ scale: 1.02, borderColor: "rgba(99, 102, 241, 0.5)" }}
                                    >
                                        <h3 className="text-white font-semibold mb-2">Need urgent support?</h3>
                                        <p className="text-slate-400 text-sm">For urgent matters, please call our support line directly.</p>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Contact Form */}
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={slideIn}
                        className="relative"
                    >
                        <motion.div 
                            className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm relative z-10"
                            whileHover={{ boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)" }}
                        >
                            <h2 className="text-2xl font-bold text-indigo-400 mb-8">Send Us a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div
                                    variants={fadeInUp}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                                        <motion.input
                                            whileFocus={{ scale: 1.02 }}
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-700/50 rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
                                            placeholder="Anirmay Khan"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Your Email</label>
                                        <motion.input
                                            whileFocus={{ scale: 1.02 }}
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-700/50 rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
                                            placeholder="anirmaykhan@gmail.com"
                                        />
                                    </div>
                                </motion.div>
                                
                                <motion.div variants={fadeInUp}>
                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
                                    <motion.input
                                        whileFocus={{ scale: 1.02 }}
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-700/50 rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400"
                                        placeholder="What's this about?"
                                    />
                                </motion.div>

                                <motion.div variants={fadeInUp}>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                                    <motion.textarea
                                        whileFocus={{ scale: 1.02 }}
                                        id="message"
                                        name="message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-slate-700/50 rounded-lg p-3 border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white placeholder-slate-400 resize-none"
                                        placeholder="Tell us how we can help..."
                                    ></motion.textarea>
                                </motion.div>

                                <motion.div variants={fadeInUp}>
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 flex items-center justify-center"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending...
                                            </span>
                                        ) : 'Send Message'}
                                    </motion.button>
                                </motion.div>
                            </form>

                            <AnimatePresence>
                                {statusMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`mt-6 p-4 rounded-lg ${isError ? 'bg-red-900/20 border border-red-500/50' : 'bg-green-900/20 border border-green-500/50'}`}
                                    >
                                        <p className={`text-sm font-medium ${isError ? 'text-red-400' : 'text-green-400'}`}>
                                            {statusMessage}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Success animation overlay */}
                        <AnimatePresence>
                            {showSuccessAnimation && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm rounded-2xl z-20"
                                >
                                    <div className="text-center p-8">
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                            className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                                        >
                                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                        <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                                        <p className="text-slate-300">We'll get back to you soon.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;


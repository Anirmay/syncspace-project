import React, { useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { initAOS } from '../utils/animationConfig';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Placeholder Team Member Card
const TeamMemberCard = ({ name, role, imageUrl, bio, socialLinks }) => (
    <motion.div 
        className="bg-slate-700 p-6 rounded-lg text-center shadow-lg border border-slate-600"
        whileHover={{ 
            scale: 1.05,
            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)",
            borderColor: "rgba(99, 102, 241, 0.5)"
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
        }}
    >
        <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
            <img
                className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-indigo-500 shadow-lg"
                src={imageUrl}
                alt={name}
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/374151/E5E7EB?text=?" }}
            />
        </motion.div>
        <motion.h3 
            className="text-xl font-semibold text-white mb-1"
            whileHover={{ scale: 1.05, color: "#818cf8" }}
        >
            {name}
        </motion.h3>
        <motion.p 
            className="text-indigo-400 font-medium mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            {role}
        </motion.p>
        <motion.p 
            className="text-sm text-slate-300 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
        >
            {bio}
        </motion.p>
        {socialLinks && (
            <motion.div 
                className="flex justify-center space-x-4 mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                {socialLinks.map((link, index) => (
                    <motion.a
                        key={index}
                        href={link.url}
                        className="text-indigo-400 hover:text-indigo-300"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {link.icon}
                    </motion.a>
                ))}
            </motion.div>
        )}
    </motion.div>
);

const AboutPage = () => {
    const { scrollYProgress } = useScroll();
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
    
    useEffect(() => {
        initAOS();
    }, []);

    return (
        <div className="min-h-screen bg-slate-900 text-white pt-16 pb-24 font-inter overflow-hidden">
            <div className="container mx-auto max-w-6xl px-8">
                {/* Hero Section */}
                <header className="relative text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: [0, 0.71, 0.2, 1.01]
                        }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                            About SyncSpace
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Connecting teams and streamlining collaboration, one workspace at a time.
                        </p>
                    </motion.div>
                    
                    {/* Decorative elements */}
                    <motion.div
                        style={{ scale }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl -z-10"
                    />
                </header>

                {/* Story Section */}
                <motion.section 
                    className="mb-24"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerChildren}
                >
                    <motion.h2 
                        className="text-3xl font-bold text-center mb-16 text-indigo-400"
                        variants={fadeInUp}
                    >
                        Our Story
                    </motion.h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div 
                            className="bg-slate-800/50 p-8 rounded-2xl shadow-xl border border-slate-700"
                            variants={fadeInUp}
                        >
                            <h3 className="text-2xl font-bold text-white mb-4">The Beginning</h3>
                            <p className="text-slate-300 leading-relaxed">
                                Founded in 2023, SyncSpace emerged from a simple observation: teams were spending more time switching between tools than actually collaborating. We set out to change that by creating a unified platform that brings all essential collaboration tools under one roof.
                            </p>
                        </motion.div>
                        <motion.div 
                            className="bg-slate-800/50 p-8 rounded-2xl shadow-xl border border-slate-700"
                            variants={fadeInUp}
                        >
                            <h3 className="text-2xl font-bold text-white mb-4">Our Growth</h3>
                            <p className="text-slate-300 leading-relaxed">
                                From our humble beginnings with just three developers, we've grown into a global team serving thousands of organizations worldwide. Each milestone has strengthened our commitment to making collaboration seamless and enjoyable.
                            </p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Values Section */}
                <motion.section 
                    className="mb-24"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerChildren}
                >
                    <motion.h2 
                        className="text-3xl font-bold text-center mb-16 text-indigo-400"
                        variants={fadeInUp}
                    >
                        Our Values
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div 
                            className="p-6 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/20"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)" }}
                        >
                            <h3 className="text-xl font-bold text-indigo-400 mb-3">Innovation</h3>
                            <p className="text-slate-300">We constantly push boundaries to create cutting-edge solutions that make collaboration easier and more efficient.</p>
                        </motion.div>
                        <motion.div 
                            className="p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/20"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.25)" }}
                        >
                            <h3 className="text-xl font-bold text-purple-400 mb-3">Transparency</h3>
                            <p className="text-slate-300">We believe in open communication and maintaining clear visibility in everything we do.</p>
                        </motion.div>
                        <motion.div 
                            className="p-6 bg-gradient-to-br from-pink-900/50 to-rose-900/50 rounded-xl border border-pink-500/20"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.25)" }}
                        >
                            <h3 className="text-xl font-bold text-pink-400 mb-3">User-First</h3>
                            <p className="text-slate-300">Every feature and decision is guided by our commitment to providing the best possible user experience.</p>
                        </motion.div>
                    </div>
                </motion.section>

                {/* Mission & Vision Section */}
                <motion.section 
                    className="mb-24 grid md:grid-cols-2 gap-8"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerChildren}
                >
                    <motion.div 
                        className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700"
                        variants={fadeInUp}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)",
                        }}
                    >
                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Our Mission</h2>
                        <p className="text-slate-300 leading-relaxed">
                            To empower teams of all sizes with a unified, intuitive, and powerful platform that eliminates friction in communication and project management. We believe that seamless collaboration is the key to unlocking collective potential and achieving extraordinary results.
                        </p>
                    </motion.div>
                    <motion.div 
                        className="bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700"
                        variants={fadeInUp}
                        whileHover={{
                            scale: 1.02,
                            boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.15)",
                        }}
                    >
                        <h2 className="text-2xl font-bold text-indigo-400 mb-4">Our Vision</h2>
                        <p className="text-slate-300 leading-relaxed">
                            We envision a future where teamwork is effortless, regardless of location or time zone. SyncSpace aims to be the central nervous system for modern teams, providing the tools and real-time connectivity needed to foster innovation, transparency, and efficiency in every project.
                        </p>
                    </motion.div>
                </motion.section>

                {/* Team Section */}
                <motion.section 
                    className="mb-24"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerChildren}
                >
                    <motion.h2 
                        className="text-3xl font-bold text-center mb-16 text-indigo-400"
                        variants={fadeInUp}
                    >
                        Meet Our Team
                    </motion.h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <TeamMemberCard
                            name="Anirmay Khan"
                            role="Founder & CEO"
                            imageUrl="https://placehold.co/100x100/4F46E5/FFFFFF?text=AK"
                            bio="Driving the vision behind SyncSpace with a passion for efficient teamwork."
                            socialLinks={[
                                { url: "https://www.linkedin.com/in/anirmay-khan/", icon: "LinkedIn" },
                                { url: "https://github.com/Anirmay", icon: "Github" }
                            ]}
                        />
                        <TeamMemberCard
                            name="Anirmay Khan"
                            role="Co-Founder & CTO"
                            imageUrl="https://placehold.co/100x100/4F46E5/FFFFFF?text=AK"
                            bio="Building the core technology that powers seamless real-time collaboration."
                            socialLinks={[
                                { url: "https://www.linkedin.com/in/anirmay-khan/", icon: "LinkedIn" },
                                { url: "https://github.com/Anirmay", icon: "GitHub" }
                            ]}
                        />
                        <TeamMemberCard
                            name="Anirmay Khan"
                            role="Lead Designer"
                            imageUrl="https://placehold.co/100x100/4F46E5/FFFFFF?text=AK"
                            bio="Crafting intuitive and beautiful user experiences for SyncSpace users."
                            socialLinks={[
                                { url: "https://www.linkedin.com/in/anirmay-khan/", icon: "LinkedIn" },
                                { url: "https://github.com/Anirmay", icon: "Github" }
                            ]}
                        />
                    </div>
                </motion.section>

                {/* Stats Section */}
                <motion.section 
                    className="text-center"
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={staggerChildren}
                >
                    <motion.h2 
                        className="text-3xl font-bold mb-16 text-indigo-400"
                        variants={fadeInUp}
                    >
                        SyncSpace by the Numbers
                    </motion.h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <motion.div 
                            className="p-6"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.1 }}
                        >
                            <h3 className="text-4xl font-bold text-white mb-2">10k+</h3>
                            <p className="text-slate-400">Active Users</p>
                        </motion.div>
                        <motion.div 
                            className="p-6"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.1 }}
                        >
                            <h3 className="text-4xl font-bold text-white mb-2">500+</h3>
                            <p className="text-slate-400">Organizations</p>
                        </motion.div>
                        <motion.div 
                            className="p-6"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.1 }}
                        >
                            <h3 className="text-4xl font-bold text-white mb-2">1M+</h3>
                            <p className="text-slate-400">Tasks Completed</p>
                        </motion.div>
                        <motion.div 
                            className="p-6"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.1 }}
                        >
                            <h3 className="text-4xl font-bold text-white mb-2">99.9%</h3>
                            <p className="text-slate-400">Uptime</p>
                        </motion.div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default AboutPage;


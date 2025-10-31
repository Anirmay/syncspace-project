import React from 'react';

// Placeholder Team Member Card
const TeamMemberCard = ({ name, role, imageUrl, bio }) => (
    <div className="bg-slate-700 p-6 rounded-lg text-center shadow-lg border border-slate-600 transform transition duration-300 hover:scale-105">
        <img
            className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-indigo-500"
            src={imageUrl}
            alt={name}
            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/100x100/374151/E5E7EB?text=?" }} // Basic fallback
        />
        <h3 className="text-xl font-semibold text-white mb-1">{name}</h3>
        <p className="text-indigo-400 font-medium mb-3">{role}</p>
        <p className="text-sm text-slate-300">{bio}</p>
    </div>
);

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-inter">
            <div className="container mx-auto max-w-4xl"> {/* Adjusted max-width */}
                {/* Page header */}
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">About SyncSpace</h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Connecting teams and streamlining collaboration, one workspace at a time.
                    </p>
                </header>

                {/* Mission Section */}
                <section className="mb-16 bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-indigo-400 mb-4">Our Mission</h2>
                    <p className="text-slate-300 leading-relaxed">
                        To empower teams of all sizes with a unified, intuitive, and powerful platform that eliminates friction in communication and project management. We believe that seamless collaboration is the key to unlocking collective potential and achieving extraordinary results.
                    </p>
                </section>

                {/* Vision Section */}
                <section className="mb-16 bg-slate-800 p-8 rounded-lg shadow-xl border border-slate-700">
                    <h2 className="text-2xl font-bold text-indigo-400 mb-4">Our Vision</h2>
                    <p className="text-slate-300 leading-relaxed">
                        We envision a future where teamwork is effortless, regardless of location or time zone. SyncSpace aims to be the central nervous system for modern teams, providing the tools and real-time connectivity needed to foster innovation, transparency, and efficiency in every project.
                    </p>
                </section>

                {/* Team Section (Placeholder) */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-center mb-10 text-white">Meet the Team (Placeholder)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <TeamMemberCard
                            name="Anirmay Khan"
                            role="Founder & CEO"
                            imageUrl="https://placehold.co/100x100/4F46E5/FFFFFF?text=AJ"
                            bio="Driving the vision behind SyncSpace with a passion for efficient teamwork."
                        />
                        <TeamMemberCard
                            name="Anirmay Khan"
                            role="Co-Founder & CTO"
                            imageUrl="https://placehold.co/100x100/4F46E5/FFFFFF?text=MG"
                            bio="Building the core technology that powers seamless real-time collaboration."
                        />
                        <TeamMemberCard
                            name="Anirmay Khan"
                            role="UX/UI Designer"
                            imageUrl="https://placehold.co/100x100/4F46E5/FFFFFF?text=SC"
                            bio="Crafting intuitive and beautiful user experiences for SyncSpace users."
                        />
                    </div>
                </section>

            </div>
        </div>
    );
};

export default AboutPage;


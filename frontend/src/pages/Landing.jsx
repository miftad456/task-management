import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, ArrowRight, Zap, Shield, Users } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 overflow-hidden">
            {/* Navigation */}
            <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="TaskFlow Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-brand-primary/20" />
                    <span className="text-2xl font-bold tracking-tight text-white">TaskFlow</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/login" className="text-slate-400 hover:text-white font-medium transition-colors">Sign In</Link>
                    <Link to="/register" className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-brand-primary/20">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-primary/10 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-secondary/10 blur-[120px] rounded-full -z-10" />

                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-primary text-sm font-bold tracking-wide uppercase"
                    >
                        <Zap size={16} />
                        <span>The Future of Task Management</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
                    >
                        Manage your work <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">with absolute flow.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        TaskFlow is the ultimate platform for teams to collaborate, track progress, and achieve goals faster than ever. Experience the power of seamless integration.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-primary/20 group">
                            Start for Free
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg glass hover:bg-white/10 transition-all">
                            Watch Demo
                        </button>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
                    {[
                        { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed and efficiency, so you can focus on what matters.' },
                        { icon: Shield, title: 'Secure by Design', desc: 'Your data is encrypted and protected with industry-leading security.' },
                        { icon: Users, title: 'Team Oriented', desc: 'Built for collaboration, with real-time updates and team visibility.' },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="glass p-8 rounded-3xl hover:scale-[1.02] transition-transform"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6">
                                <feature.icon className="text-brand-primary" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-6 text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="TaskFlow Logo" className="w-6 h-6 opacity-50" />
                        <span className="font-bold text-slate-400">TaskFlow</span>
                        <span>© 2026. All rights reserved.</span>
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact Us</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;

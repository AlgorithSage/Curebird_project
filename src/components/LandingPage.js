import React from 'react';
import { HeartPulse, LogIn, Dna, Pill, Stethoscope, Syringe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Gradient Background Component ---
const GradientBackground = () => (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 animate-gradient-xy opacity-80"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
    </div>
);

// --- Floating Icon Component ---
const FloatingIcon = ({ icon, className, duration, delay }) => (
    <motion.div
        className={`absolute text-amber-400/15 ${className}`}
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 15, opacity: 1 }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
        }}
    >
        {icon}
    </motion.div>
);

const LandingPage = ({ onLoginClick }) => {
    const textVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.3, duration: 0.8, ease: "easeOut" }
        })
    };

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden font-sans">
            {/* Background Gradient */}
            <GradientBackground />

            {/* Decorative Floating Icons */}
            <FloatingIcon icon={<Dna size={120} />} className="top-16 left-16" duration={12} delay={0} />
            <FloatingIcon icon={<HeartPulse size={100} />} className="bottom-20 right-24" duration={10} delay={1} />
            <FloatingIcon icon={<Pill size={80} />} className="top-1/3 right-1/4" duration={14} delay={0.5} />
            <FloatingIcon icon={<Stethoscope size={100} />} className="bottom-1/3 left-1/5" duration={16} delay={1.5} />
            <FloatingIcon icon={<Syringe size={70} />} className="top-1/4 left-2/3" duration={18} delay={0.7} />
            <FloatingIcon icon={<Activity size={90} />} className="top-1/2 left-1/3" duration={20} delay={1.2} />

            {/* Main Glass Box */}
            <motion.div
                initial="hidden"
                animate="visible"
                className="text-center z-10 flex flex-col items-center glass p-10 sm:p-14 rounded-3xl shadow-[0_0_60px_rgba(56,189,248,0.2)] max-w-3xl border border-white/10"
            >
                {/* Logo & Title */}
                <motion.div custom={0} variants={textVariants} className="flex justify-center items-center gap-5 mb-8">
                    <div className="bg-amber-500 p-4 rounded-2xl shadow-lg shadow-amber-500/50 animate-pulse">
                        <HeartPulse size={50} className="text-slate-900" />
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">
                        Cure<span className="text-amber-400">bird</span>
                    </h1>
                </motion.div>

                {/* Tagline */}
                <motion.p custom={1} variants={textVariants} className="text-2xl sm:text-3xl text-slate-200 font-medium mt-2">
                    Your Personal, Intelligent Medical Portfolio
                </motion.p>

                {/* Subtext */}
                <motion.p custom={2} variants={textVariants} className="text-lg sm:text-xl text-slate-400 mt-4 max-w-2xl">
                    Securely store your records, track appointments, and gain insights with
                    <span className="text-amber-400 font-semibold"> AI-powered analysis</span>.
                </motion.p>

                {/* Button */}
                <motion.div custom={3} variants={textVariants}>
                    <motion.button
                        whileHover={{ scale: 1.07, boxShadow: "0 0 30px rgba(245,158,11,0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLoginClick}
                        className="mt-10 flex items-center gap-3 bg-amber-500 text-black px-10 py-5 rounded-full shadow-xl hover:bg-amber-400 transition-all duration-300 text-xl font-bold"
                    >
                        <LogIn size={24} />
                        Login / Sign Up
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingPage;


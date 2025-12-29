import React, { useState } from 'react';
import {
    Search, HelpCircle, FileText, Phone, MessageSquare,
    ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-stone-800 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 text-left group"
            >
                <span className={`font-medium transition-colors ${isOpen ? 'text-amber-500' : 'text-stone-300 group-hover:text-amber-500'}`}>
                    {question}
                </span>
                {isOpen ? <ChevronUp size={20} className="text-amber-500" /> : <ChevronDown size={20} className="text-stone-600 group-hover:text-amber-500" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-4 text-stone-400 text-sm leading-relaxed">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function DoctorHelp() {
    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-12">

            {/* 1. Hero Search Section */}
            <div className="text-center space-y-6 py-8">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2">
                    <HelpCircle size={32} className="text-amber-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                    How can we assist you, <span className="text-amber-500">Doctor?</span>
                </h1>
                <p className="text-stone-400 max-w-lg mx-auto">
                    Search our medical guidelines, platform tutorials, or contact support directly.
                </p>

                <div className="relative max-w-xl mx-auto group">
                    <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center bg-[#0c0a09] border border-stone-800 group-hover:border-amber-500/50 rounded-full px-6 py-4 shadow-xl transition-all">
                        <Search size={20} className="text-stone-500 group-hover:text-amber-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Ask a question..."
                            className="bg-transparent border-none outline-none text-white ml-4 w-full placeholder-stone-600"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Quick Assist Cards (Simple & Unique) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 mx-auto bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Platform Guide</h3>
                    <p className="text-xs text-stone-400 mb-4">Master the full potential of your workspace.</p>
                    <button className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 hover:gap-2 transition-all">
                        View Tutorials <ExternalLink size={14} />
                    </button>
                </div>

                <div className="animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 mx-auto bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                        <MessageSquare size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Live Chat</h3>
                    <p className="text-xs text-stone-400 mb-4">Chat with our support team instantly.</p>
                    <button className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 hover:gap-2 transition-all">
                        Start Chat <ExternalLink size={14} />
                    </button>
                </div>

                <div className="animated-border p-6 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)] text-center group hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-14 h-14 mx-auto bg-stone-900 rounded-2xl flex items-center justify-center text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                        <Phone size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Emergency</h3>
                    <p className="text-xs text-stone-400 mb-4">Critical issues affecting patient care.</p>
                    <button className="text-sm font-bold text-amber-500 flex items-center justify-center gap-1 hover:gap-2 transition-all">
                        Call Hotline <ExternalLink size={14} />
                    </button>
                </div>

            </div>

            {/* 3. Minimal FAQ */}
            <div className="animated-border p-8 rounded-[2rem] bg-gradient-to-br from-[#1c1917] to-[#292524] shadow-[inset_0_0_30px_-15px_rgba(245,158,11,0.15)]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-amber-500 rounded-full" />
                    Frequently Asked Questions
                </h3>
                <div className="space-y-1">
                    <FAQItem
                        question="How do I reset my secure prescription PIN?"
                        answer="Go to Security settings > Password Management. You will need to verify your identity via 2FA to reset your signing PIN."
                    />
                    <FAQItem
                        question="Why are patient vitals not syncing?"
                        answer="Ensure the IoT device is connected to the same secure network. Access the 'Device Manager' tab in the patient's profile to re-pair."
                    />
                    <FAQItem
                        question="How do I download end-of-month reports?"
                        answer="Navigate to the Research/Analytics tab on your sidebar. Select the date range and click 'Export PDF'."
                    />
                    <FAQItem
                        question="Can I customize my notification alerts?"
                        answer="Yes. Click the 'Settings' gear icon in the Notifications panel to toggle email vs. in-app alerts for different priorities."
                    />
                </div>
            </div>

        </div>
    );
}

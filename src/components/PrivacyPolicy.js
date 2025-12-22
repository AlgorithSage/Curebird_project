import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Database, Eye, Server } from 'lucide-react';

const PrivacyPolicy = ({ onBack }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onBack}></div>

            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl text-slate-300 p-8 sm:p-12 scrollbar-thin scrollbar-thumb-amber-500/50 scrollbar-track-transparent">
                <button
                    onClick={onBack}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                    <ArrowLeft size={24} />
                    <span className="sr-only">Close</span>
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-sky-500/10 p-3 rounded-2xl">
                        <Lock size={32} className="text-sky-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Privacy Policy</h2>
                        <p className="text-slate-400">Your privacy is our highest priority.</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <section className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <Database className="text-amber-500 mb-3" size={24} />
                            <h4 className="text-lg font-semibold text-white mb-2">Data Collection</h4>
                            <p className="text-sm text-slate-400">We collect medical records, personal details, and usage data only to provide our portfolio and analysis services.</p>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                            <Server className="text-emerald-500 mb-3" size={24} />
                            <h4 className="text-lg font-semibold text-white mb-2">Secure Storage</h4>
                            <p className="text-sm text-slate-400">All health data is encrypted at rest and in transit using military-grade AES-256 encryption protocols.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                            1. Information We Collect
                        </h3>
                        <p className="leading-relaxed mb-4">
                            When you use Curebird, we may collect:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-sky-500">
                            <li><strong>Personal Identity Information:</strong> Name, email address, date of birth.</li>
                            <li><strong>Medical Records:</strong> Lab results, prescriptions, imaging reports, and doctor's notes uploaded by you.</li>
                            <li><strong>Generated Health Data:</strong> Insights and summaries produced by our AI algorithms based on your records.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">2. How We Use Your Data</h3>
                        <p className="leading-relaxed">
                            Your data is used strictly for:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2 marker:text-sky-500">
                            <li>Providing personalized medical portfolio management.</li>
                            <li>Running AI analysis to offer health insights (Cure Analyzer).</li>
                            <li>Communicating imperative account updates or security alerts.</li>
                        </ul>
                        <p className="mt-4 text-sky-200 bg-sky-500/10 p-4 rounded-xl border border-sky-500/20">
                            We do <strong>NOT</strong> sell your personal health information to third-party advertisers or data brokers.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">3. AI Processing</h3>
                        <p className="leading-relaxed">
                            Our AI models process your data to provide insights. While we strive for accuracy, AI processing acts as a tool for organization and preliminary analysis, not a definitive diagnosis.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">4. Third-Party Sharing</h3>
                        <p className="leading-relaxed">
                            We only share data with trusted cloud infrastructure providers (like Google Cloud) strictly necessary to operate our service. All providers are vetted for high security standards.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-white mb-3">5. User Rights</h3>
                        <p className="leading-relaxed">
                            You have the right to access, download, correct, or permanently delete your data at any time via your account settings.
                        </p>
                    </section>
                </div>
            </div>
        </motion.div>
    );
};

export default PrivacyPolicy;

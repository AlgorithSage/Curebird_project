import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, MapPin, Phone } from 'lucide-react';

const Contact = ({ onBack }) => {
    const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');
        // Simulate network request
        setTimeout(() => {
            setStatus('success');
            setFormState({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onBack}></div>

            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl text-slate-300 flex flex-col md:flex-row overflow-hidden">
                <button
                    onClick={onBack}
                    className="absolute top-6 right-6 md:right-auto md:left-6 z-10 p-2 rounded-full bg-black/20 hover:bg-white/10 transition-colors text-white"
                >
                    <ArrowLeft size={24} />
                    <span className="sr-only">Close</span>
                </button>

                {/* Left Side: Info */}
                <div className="w-full md:w-1/3 bg-gradient-to-br from-amber-600 to-amber-800 p-8 sm:p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Get in Touch</h2>
                            <p className="text-amber-100 mb-8">We'd love to hear from you. Our team is always here to chat.</p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <Mail className="mt-1 opacity-80" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Chat to us</h4>
                                        <p className="text-amber-100 text-sm">support@curebird.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <MapPin className="mt-1 opacity-80" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Office</h4>
                                        <p className="text-amber-100 text-sm">123 Health Tech Blvd,<br />Silicon Valley, CA 94025</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="mt-1 opacity-80" />
                                    <div>
                                        <h4 className="font-semibold text-lg">Phone</h4>
                                        <p className="text-amber-100 text-sm">+1 (555) 000-0000</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <p className="text-xs text-amber-200/60">© 2025 Curebird Inc.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full md:w-2/3 p-8 sm:p-12 bg-slate-900">
                    {status === 'success' ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <Send size={40} className="text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                            <p className="text-slate-400">Thanks for reaching out. We'll be in touch shortly.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-2xl font-bold text-white mb-6 md:hidden">Send a Message</h3>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="John Doe"
                                        value={formState.name}
                                        onChange={e => setFormState({ ...formState, name: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="john@example.com"
                                        value={formState.email}
                                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                    placeholder="How can we help?"
                                    value={formState.subject}
                                    onChange={e => setFormState({ ...formState, subject: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                                    placeholder="Tell us more about your inquiry..."
                                    value={formState.message}
                                    onChange={e => setFormState({ ...formState, message: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? 'Sending...' : (
                                    <>Send Message <Send size={20} /></>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Contact;

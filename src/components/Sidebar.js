import React from 'react';
import { LayoutDashboard, FileText, Calendar, Pill, Settings, HeartPulse, Bot, Activity, X, MessageSquare, Mail, Shield, ScrollText } from 'lucide-react';
import CurebirdLogo from '../curebird_logo.png';

const Sidebar = ({ activeView, onNavigate, isOpen, onClose, user }) => {
    const navItems = [
        { name: 'Dashboard' },
        { name: 'All Records' },
        { name: 'Appointments' },
        { name: 'Medications' },
        { name: 'Cure Analyzer' },
        { name: 'Cure Stat' },
        { name: 'Cure AI' },
        { name: 'Settings' },
        { name: 'Contact' },
        { name: 'Terms' },
        { name: 'Privacy' },
    ];

    const getIcon = (name) => {
        switch (name) {
            case 'Dashboard': return <LayoutDashboard size={20} />;
            case 'All Records': return <FileText size={20} />;
            case 'Appointments': return <Calendar size={20} />;
            case 'Medications': return <Pill size={20} />;
            case 'Cure Analyzer': return <Bot size={20} />;
            case 'Cure Stat': return <Activity size={20} />;
            case 'Cure AI': return <MessageSquare size={20} />;
            case 'Settings': return <Settings size={20} />;
            case 'Contact': return <Mail size={20} />;
            case 'Terms': return <ScrollText size={20} />;
            case 'Privacy': return <Shield size={20} />;
            default: return null;
        }
    };

    return (
        <>
            {/* Overlay: Appears behind the drawer and closes it when clicked. Visible on ALL screens when isOpen is true. */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar with universal slide-in behavior and premium glass look */}
            <aside
                className={`w-72 flex-shrink-0 bg-black/95 backdrop-blur-2xl border-r border-yellow-500/20 h-screen fixed top-0 left-0 z-40 
                           transition-transform duration-300 ease-in-out
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 flex items-center justify-between gap-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="relative group shrink-0">
                            {/* Logo Container - Clean, dark, barely visible border to let the logo shine */}
                            <div className="relative w-16 h-16 rounded-full bg-black/40 p-2 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                                {/* The Logo Itself - Glowing and Lively */}
                                <img
                                    src={CurebirdLogo}
                                    alt="Curebird Logo"
                                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-[pulse_3s_ease-in-out_infinite] hover:drop-shadow-[0_0_20px_rgba(245,158,11,1)] transition-all duration-300"
                                />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200">Curebird</h1>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 mt-2">
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <li key={item.name}>
                                <button
                                    onClick={() => {
                                        onNavigate(item.name);
                                        onClose(); // Close sidebar on mobile after navigation
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeView === item.name
                                        ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 text-amber-500 border border-amber-500/30'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-amber-200 hover:translate-x-1'
                                        }`}
                                >
                                    <span className={`transition-colors duration-200 ${activeView === item.name ? 'text-amber-500' : 'text-slate-500 group-hover:text-amber-500'}`}>
                                        {getIcon(item.name)}
                                    </span>
                                    <span className="font-semibold">{item.name}</span>
                                    {activeView === item.name && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile Section */}
                {user && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 border-t border-white/5 backdrop-blur-md">
                        <div className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
                            <div className="relative w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-500/30 overflow-hidden shrink-0">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-500 font-bold">
                                        {user.firstName ? user.firstName.charAt(0) : 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-amber-400 transition-colors">
                                    {user.firstName ? `Welcome, ${user.firstName}` : 'Welcome, User'}
                                </h4>
                                <p className="text-xs text-amber-500/80 font-medium">Pro Member</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside >
        </>
    );
};

export default Sidebar;
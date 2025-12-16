import React from 'react';
import { LayoutDashboard, FileText, Calendar, Pill, Settings, HeartPulse, Bot, Activity, X } from 'lucide-react';

const Sidebar = ({ activeView, onNavigate, isOpen, onClose }) => {
    const navItems = [
        { name: 'Dashboard' },
        { name: 'All Records' },
        { name: 'Appointments' },
        { name: 'Medications' },
        { name: 'Cure Analyzer' },
        { name: 'Cure Stat' },
        { name: 'Settings' },
    ];

    const getIcon = (name) => {
        switch (name) {
            case 'Dashboard': return <LayoutDashboard size={20} />;
            case 'All Records': return <FileText size={20} />;
            case 'Appointments': return <Calendar size={20} />;
            case 'Medications': return <Pill size={20} />;
            case 'Cure Analyzer': return <Bot size={20} />;
            case 'Cure Stat': return <Activity size={20} />;
            case 'Settings': return <Settings size={20} />;
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
                className={`w-72 flex-shrink-0 bg-slate-900/80 backdrop-blur-2xl border-r border-white/10 h-screen fixed top-0 left-0 z-40 
                           transition-transform duration-300 ease-in-out shadow-2xl
                           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-6 flex items-center justify-between gap-3 border-b border-white/10">
                    <div className='flex items-center gap-3'>
                        <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-sky-500/20">
                            <HeartPulse size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Curebird</h1>
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
                                        ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 hover:translate-x-1'
                                        }`}
                                >
                                    <span className={`transition-colors duration-200 ${activeView === item.name ? 'text-sky-400' : 'text-slate-500 group-hover:text-sky-400'}`}>
                                        {getIcon(item.name)}
                                    </span>
                                    <span className="font-semibold">{item.name}</span>
                                    {activeView === item.name && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Decorative bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-6 opacity-40 pointer-events-none">
                    <div className="w-full h-32 bg-gradient-to-t from-sky-500/10 to-transparent rounded-b-none blur-2xl"></div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
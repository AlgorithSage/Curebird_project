import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plus, ChevronRight, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { DiseaseService } from '../../services/DiseaseService';
import AddDiseaseModal from './AddDiseaseModal';

const DiseaseList = ({ userId, onSelectDisease }) => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchDiseases = async () => {
        try {
            if (userId) {
                const data = await DiseaseService.getDiseases(userId);
                setDiseases(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDisease = async (e, diseaseId) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this condition? This action cannot be undone.")) return;

        try {
            await DiseaseService.deleteDisease(userId, diseaseId);
            fetchDiseases();
        } catch (error) {
            console.error("Failed to delete disease:", error);
            alert("Failed to delete condition.");
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, [userId]);

    const getStatusColor = (status, severity) => {
        if (status === 'resolved') return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (severity === 'critical') return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (severity === 'high') return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    };

    if (loading) return <div className="h-40 animate-pulse bg-slate-800/50 rounded-2xl" />;

    return (
        <div className="mb-8">
            <div className="relative mb-8 p-8 rounded-3xl overflow-hidden bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                {/* Background Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl bg-amber-500/10 blur-[100px] -z-10" />

                <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                    {/* Pill Label */}
                    <div className="mb-6 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        Overview
                    </div>

                    {/* Main Heading */}
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Live Health <span className="text-amber-400">Tracker</span>
                    </h2>

                    {/* Description */}
                    <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-2xl">
                        Your central command center for health data. <span className="text-white font-semibold">Track conditions</span>, monitor <span className="text-amber-400 font-semibold">vital trends</span>, and manage your <span className="text-emerald-400 font-semibold">daily insights</span> in one secure, real-time dashboard.
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-950 text-white font-semibold rounded-2xl border border-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        <span className="p-1.5 bg-amber-400/10 text-amber-400 rounded-lg group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors duration-300">
                            <Plus size={18} />
                        </span>
                        <span>Add New Condition</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {diseases.map((disease) => (
                        <motion.div
                            key={disease.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onSelectDisease && onSelectDisease(disease)}
                            className="glass-card cursor-pointer flex justify-between items-start group hover:scale-[1.02] active:scale-95"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{disease.name}</h3>
                                <p className="text-xs text-slate-400 mb-3">Diagnosed: {new Date(disease.diagnosisDate).toLocaleDateString()}</p>

                                <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(disease.status, disease.severity)}`}>
                                    {disease.status === 'active' ? disease.severity.toUpperCase() + ' SEVERITY' : disease.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={(e) => handleDeleteDisease(e, disease.id)}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors z-10"
                                    title="Delete Condition"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="bg-slate-800/50 p-2 rounded-full text-slate-500 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State / Add Prompt */}
                {diseases.length === 0 && (
                    <motion.div
                        onClick={() => setIsAddModalOpen(true)}
                        whileHover={{ scale: 1.02 }}
                        className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 p-5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-full min-h-[120px]"
                    >
                        <Plus size={32} className="text-slate-600 mb-2" />
                        <p className="text-slate-400 font-medium">Add your first condition</p>
                        <p className="text-xs text-slate-600">Track diabetes, BP, etc.</p>
                    </motion.div>
                )}
            </div>

            {
                isAddModalOpen && (
                    <AddDiseaseModal
                        userId={userId}
                        onClose={() => setIsAddModalOpen(false)}
                        onDiseaseAdded={fetchDiseases}
                    />
                )
            }
        </div >
    );
};

export default DiseaseList;

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, deleteDoc, query } from 'firebase/firestore';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { FileText, Search } from 'lucide-react';

import Header from './Header';
import RecordCard from './RecordCard';
import { RecordFormModal, DeleteConfirmModal } from './Modals';
import { SkeletonCard } from './SkeletonLoaders';

const AllRecords = ({ user, db, storage, appId, onLogout, onLoginClick, onToggleSidebar, onNavigate }) => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All'); // New state for dropdown filter
    const [isSearchActive, setIsSearchActive] = useState(false);

    const userId = user ? user.uid : null;

    const recordsCollectionRef = useMemo(() => {
        if (userId) return collection(db, `artifacts/${appId}/users/${userId}/medical_records`);
        return null;
    }, [userId, db, appId]);

    // ... (useEffect remains the same) ...

    useEffect(() => {
        if (recordsCollectionRef) {
            const q = query(recordsCollectionRef);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                recordsData.sort((a, b) => {
                    const timeA = a.createdAt?.seconds ? a.createdAt.seconds : (a.date?.seconds || 0);
                    const timeB = b.createdAt?.seconds ? b.createdAt.seconds : (b.date?.seconds || 0);
                    return timeB - timeA;
                });
                setRecords(recordsData);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching records: ", error);
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            setIsLoading(false);
            setRecords([]);
        }
    }, [recordsCollectionRef]);

    const handleDeleteRecord = async () => {
        if (!recordToDelete || !userId) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/medical_records`, recordToDelete));
        } catch (error) {
            console.error("Error deleting record: ", error);
        } finally {
            setIsDeleteModalOpen(false);
            setRecordToDelete(null);
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.type?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = typeFilter === 'All' || record.type === typeFilter.toLowerCase().replace(' ', '_');

        return matchesSearch && matchesType;
    });

    if (!user) {
        // This view is shown if the user is logged out
        return (
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
                <Header
                    title="All Records"
                    description="Log in to view your records."
                    user={null}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                />
                <div className="text-center py-20">
                    <p className="text-slate-400">Please log in to view your medical records.</p>
                </div>
            </div>
        )
    }

    return (
        <LayoutGroup>
            <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white">
                <Header
                    title="All Records"
                    description="View and manage all your historical medical records."
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                    onAddClick={() => { setEditingRecord(null); setIsFormModalOpen(true); }}
                />

                <main className="mt-8 relative min-h-[60vh]">
                    {/* Centered Initial Search State */}
                    {!isSearchActive && (
                        <motion.div
                            layoutId="search-container"
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 flex flex-col items-center z-10"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                                Find Your Records
                            </h2>
                            <div className="relative w-full group">
                                <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search by doctor, hospital, or type..."
                                    className="w-full bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl pl-16 pr-6 py-5 text-xl shadow-2xl shadow-black/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-white placeholder:text-slate-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchActive(true)}
                                />
                            </div>
                            <p className="mt-4 text-slate-400 text-sm">
                                Try searching for <span className="text-amber-400">"Cardiology"</span>, <span className="text-amber-400">"Dr. Smith"</span>, or date.
                            </p>
                        </motion.div>
                    )}

                    {/* Active Top Search State */}
                    {isSearchActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <motion.div
                                    layoutId="search-container"
                                    className="relative flex-grow group"
                                >
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-400 transition-colors" />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Search by doctor, hospital, or type..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white shadow-lg"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </motion.div>
                                <motion.select
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer min-w-[150px] shadow-lg"
                                >
                                    <option value="All">All Records</option>
                                    <option value="prescription">Prescription</option>
                                    <option value="test_report">Test Report</option>
                                    <option value="diagnosis">Diagnosis</option>
                                    <option value="admission">Hospital Admission</option>
                                    <option value="ecg">ECG</option>
                                </motion.select>
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => { setIsSearchActive(false); setSearchTerm(''); }}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                                >
                                    Retract
                                </motion.button>
                            </div>

                            {isLoading ? (
                                <div className="space-y-4">
                                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                                </div>
                            ) : (
                                filteredRecords.length > 0 ? (
                                    <div className="space-y-4 pb-20">
                                        <AnimatePresence mode="popLayout">
                                            {filteredRecords.map(record => (
                                                <motion.div
                                                    key={record.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    layout
                                                >
                                                    <RecordCard
                                                        record={record}
                                                        storage={storage}
                                                        onEdit={() => { setEditingRecord(record); setIsFormModalOpen(true); }}
                                                        onDelete={() => { setRecordToDelete(record.id); setIsDeleteModalOpen(true); }}
                                                    />
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Bottom Retract Button for easy access */}
                                        <div className="flex justify-center mt-8">
                                            <button
                                                onClick={() => { setIsSearchActive(false); setSearchTerm(''); }}
                                                className="flex items-center gap-2 px-6 py-2 bg-slate-800/80 hover:bg-slate-700 text-amber-500 rounded-full text-sm font-bold border border-amber-500/20 transition-all hover:scale-105"
                                            >
                                                Retract View
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-sm"
                                    >
                                        <div className="bg-slate-800 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-4">
                                            <FileText size={40} className="text-slate-500" />
                                        </div>
                                        <h3 className="mt-4 text-xl font-bold text-slate-200">No Records Found</h3>
                                        <p className="text-slate-500 mt-2">No matches for "<span className="text-amber-500">{searchTerm}</span>"</p>
                                        <button
                                            onClick={() => { setIsSearchActive(false); setSearchTerm(''); }}
                                            className="mt-6 text-sm text-slate-400 hover:text-white underline underline-offset-4"
                                        >
                                            Clear Search & Retract
                                        </button>
                                    </motion.div>
                                )
                            )}
                        </motion.div>
                    )}
                </main>

                <AnimatePresence>
                    {isFormModalOpen && <RecordFormModal onClose={() => setIsFormModalOpen(false)} record={editingRecord} userId={userId} appId={appId} db={db} storage={storage} />}
                    {isDeleteModalOpen && <DeleteConfirmModal onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteRecord} />}
                </AnimatePresence>
            </div>
        </LayoutGroup>
    );
};

export default AllRecords;
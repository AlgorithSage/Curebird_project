import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Brain, ShieldCheck } from './Icons';
import { FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import { API_BASE_URL } from '../config';
import { PromptInputBox } from './PromptInputBox';

// Helper to ensure markdown tables have proper newlines and spacing if LLM collapsed them
const formatMarkdownContent = (text) => {
    if (!text || typeof text !== 'string') return '';

    // Split code blocks out to avoid mutating code contents
    const segments = text.split(/(```[\s\S]*?```)/g);

    const formattedSegments = segments.map((segment) => {
        if (segment.startsWith('```')) {
            return segment;
        }

        // Process line-by-line to uncollapse inline tables safely
        const rawLines = segment.split(/\r?\n/);
        const uncollapsedLines = [];

        for (let line of rawLines) {
            let cur = line;

            // 1. Separate divider rows glued to headers on same line (e.g. "| col1 | col2 | |---|---|")
            cur = cur.replace(/(\|\s*)\|\s*(\s*[-:]{2,}\s*(?:\|\s*[-:]{2,}\s*)+\|?)/g, '$1\n|$2');

            // 2. Separate data row glued to divider on same line (e.g. "|---|---| | val1 | val2 |")
            cur = cur.replace(/(\|\s*[-:]{2,}\s*\|\s*)\|\s*([^|\r\n]+)/g, '$1\n| $2');

            // 3. Separate consecutive complete table rows on same line (e.g. "| a | b | | c | d |")
            cur = cur.replace(/(\|(?:\s*[^|\r\n]+\s*\|){2,}\s*)\|\s*([^|\r\n]+)/g, '$1\n| $2');

            // 4. Split trailing non-pipe text glued directly after table row on same line
            cur = cur.replace(/(\|(?:\s*[^|\r\n]+\s*\|)+)[ \t]+([^|\r\n]+)$/, '$1\n\n$2');

            // 5. Split leading non-pipe text glued directly before table row on same line
            cur = cur.replace(/^([^|\r\n]+)[ \t]+(\|(?:\s*[^|\r\n]+\s*\|)+)/, '$1\n\n$2');

            // Split into any newly created sub-lines
            uncollapsedLines.push(...cur.split(/\r?\n/));
        }

        // Now ensure proper blank lines before and after tables for remark-gfm parser
        const finalLines = [];
        let inTable = false;

        for (let i = 0; i < uncollapsedLines.length; i++) {
            const line = uncollapsedLines[i];
            const trimmed = line.trim();
            const isTableRow = /^\|(.+)\|$/.test(trimmed);

            if (isTableRow) {
                if (!inTable) {
                    // Entering a table: ensure preceding line is blank if it had text
                    if (finalLines.length > 0 && finalLines[finalLines.length - 1].trim() !== '') {
                        finalLines.push('');
                    }
                    inTable = true;
                }
                finalLines.push(line);
            } else {
                if (inTable) {
                    // Exiting a table: ensure this line is blank if it had text
                    if (trimmed !== '') {
                        finalLines.push('');
                    }
                    inTable = false;
                }
                finalLines.push(line);
            }
        }

        return finalLines.join('\n');
    });

    return formattedSegments.join('');
};

const ChatMessage = ({ message, isUser }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-3 sm:mb-4`}
        >
            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                }`}>
                {isUser ? <User size={16} className="text-white sm:w-5 sm:h-5" /> : <Bot size={16} className="text-white sm:w-5 sm:h-5" />}
            </div>

            <div className={`max-w-[95%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                {message.file && (
                    <div className="mb-0.5">
                        {message.file.url ? (
                            <img
                                src={message.file.url}
                                alt={message.file.name || 'Uploaded document'}
                                className="max-w-[220px] max-h-[160px] rounded-2xl object-cover border border-amber-500/30 shadow-lg"
                            />
                        ) : (
                            <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-200 shadow-md">
                                <FileText size={16} className="text-amber-400 shrink-0" />
                                <span className="truncate max-w-[200px] font-medium">{message.file.name}</span>
                            </div>
                        )}
                    </div>
                )}
                <div className={`px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-2xl ${isUser
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black'
                    : 'bg-slate-900/80 border border-slate-700/50 shadow-lg text-slate-100'
                    }`}>
                    {isUser ? (
                        <p className="text-xs sm:text-sm font-medium">{message.text}</p>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-xs sm:text-sm leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => (
                                        <div className="overflow-x-auto my-4 rounded-xl border border-amber-500/20 bg-slate-950/60 shadow-md">
                                            <table className="w-full border-collapse text-left text-xs sm:text-sm" {...props} />
                                        </div>
                                    ),
                                    thead: ({ node, ...props }) => (
                                        <thead className="bg-amber-500/10 text-amber-300 font-bold border-b border-amber-500/20" {...props} />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th className="px-3.5 py-2.5 text-amber-200 font-semibold border-b border-amber-500/20 whitespace-nowrap" {...props} />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td className="px-3.5 py-2.5 border-b border-slate-800/80 text-slate-200" {...props} />
                                    ),
                                    tr: ({ node, ...props }) => (
                                        <tr className="hover:bg-amber-500/5 transition-colors border-b border-slate-800/50 last:border-b-0" {...props} />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p className="mb-2.5 last:mb-0 leading-relaxed" {...props} />
                                    ),
                                    ul: ({ node, ...props }) => (
                                        <ul className="list-disc list-inside space-y-1 my-2" {...props} />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol className="list-decimal list-inside space-y-1 my-2" {...props} />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li className="text-slate-200" {...props} />
                                    ),
                                    h1: ({ node, ...props }) => (
                                        <h1 className="text-base sm:text-lg font-bold text-amber-300 mt-4 mb-2 first:mt-0" {...props} />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2 className="text-sm sm:text-base font-bold text-amber-400 mt-3 mb-1.5 first:mt-0" {...props} />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3 className="text-xs sm:text-sm font-semibold text-amber-400/90 mt-3 mb-1.5 first:mt-0" {...props} />
                                    ),
                                    strong: ({ node, ...props }) => (
                                        <strong className="font-bold text-amber-200" {...props} />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote className="border-l-2 border-amber-500/40 pl-3 italic my-2 text-slate-400" {...props} />
                                    )
                                }}
                            >
                                {formatMarkdownContent(message.text)}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 px-2">
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
            </div>
        </motion.div>
    );
};

const TypingIndicator = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3 mb-4"
    >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <Bot size={20} className="text-white" />
        </div>
        <div className="glass-card px-4 py-3 rounded-2xl">
            <div className="flex gap-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    </motion.div>
);

const CureAI = ({ user, onLogout, onLoginClick, onAddRecordClick, onToggleSidebar, onNavigate, db, appId, initialContext }) => {
    const location = useLocation();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [diseaseContext, setDiseaseContext] = useState([]);
    // New state for Cerebras Summary
    const [medicalSummary, setMedicalSummary] = useState(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Premium Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.4
            }
        }
    };

    const fadeSlideUp = {
        hidden: { opacity: 0, y: 100, filter: "blur(10px)" },
        visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const blurReveal = {
        hidden: { opacity: 0, filter: "blur(20px)", scale: 0.95 },
        visible: {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            transition: { duration: 1, ease: "easeOut" }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);



    // ... (existing imports)

    useEffect(() => {
        // Load disease context
        fetchDiseaseContext();

        const contextToUse = location.state || initialContext;

        if (contextToUse) {
            // Case 1: Context injected from Analyzer
            setMedicalSummary(contextToUse);
            setMessages([{
                text: `**Analysis Loaded.** I have the context of your uploaded document. Ask me anything about the medicines, diagnosis, or side effects mentioned in it.`,
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        } else {
            // Case 2: Default Load (Fetch recent records)
            fetchAndSummarizeRecords();
            // Add welcome message
            setMessages([{
                text: `Hello ${user?.firstName ? `**${user.firstName}**` : 'there'}! Welcome to **Cure AI**. I provide secure, expert-level medical insights and health guidance powered by advanced intelligence. How can I support your wellness today?`,
                isUser: false,
                timestamp: new Date().toISOString()
            }]);
        }
    }, [initialContext, location.state]);

    const fetchDiseaseContext = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health-assistant/context`);
            const data = await response.json();
            if (data.success) {
                setDiseaseContext(data.diseases);
            }
        } catch (error) {
            console.error('Error fetching disease context:', error);
        }
    };

    const fetchAndSummarizeRecords = async () => {
        if (!user || !db || !appId) return;
        setIsSummaryLoading(true);
        try {
            const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');

            const recordsRef = collection(db, `artifacts/${appId}/users/${user.uid}/medical_records`);
            const q = query(recordsRef, orderBy('date', 'desc'), limit(5));
            const querySnapshot = await getDocs(q);

            const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (records.length > 0) {
                // Extract text and file URLs for summary
                const textsToSummarize = records.map(r => {
                    const type = r.type || 'Medical Record';
                    const date = r.date?.toDate ? r.date.toDate().toLocaleDateString() : 'Unknown Date';
                    const content = r.summary || r.digital_copy || r.diagnosis || 'No text content available.';
                    return `Date: ${date}\nType: ${type}\nMetadata Content: ${content}`;
                });

                const fileUrls = records.map(r => r.fileUrl).filter(url => url);

                // Call Backend to Summarize using Cerebras + Deep Analysis
                const response = await fetch(`${API_BASE_URL}/api/generate-summary`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        texts: textsToSummarize,
                        file_urls: fileUrls
                    })
                });

                const data = await response.json();
                if (data.summary) {
                    setMedicalSummary(data.summary);
                }
            }
        } catch (error) {
            console.error("Error generating medical summary:", error);
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const sendMessage = async (messageText, attachedFiles = []) => {
        const textToSend = (typeof messageText === 'string' ? messageText : inputMessage).trim();
        const fileToUpload = (Array.isArray(attachedFiles) && attachedFiles.length > 0) ? attachedFiles[0] : null;

        if ((!textToSend && !fileToUpload) || isLoading) return;

        // FREE TIER LIMIT CHECK (50 messages/day)
        try {
            // We need to check daily count from Firestore
            const { doc, getDoc, updateDoc, setDoc, increment } = await import('firebase/firestore');
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            const subscriptionTier = userData?.subscriptionTier || 'Free';

            if (subscriptionTier === 'Free') {
                const today = new Date().toISOString().split('T')[0];
                const usageRef = doc(db, `users/${user.uid}/usage`, `ai_${today}`);
                const usageSnap = await getDoc(usageRef);

                let currentCount = 0;
                if (usageSnap.exists()) {
                    currentCount = usageSnap.data().count || 0;
                }

                if (currentCount >= 50) {
                    const limitMessage = {
                        text: "**Daily Limit Reached.**\n\nYou have used your 50 free messages for today. Upgrade to **Premium** for unlimited AI health guidance.",
                        isUser: false,
                        timestamp: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, limitMessage]);
                    return;
                }

                // Increment Usage (Optimistic or after success? Let's do optimistic for speed/UX)
                if (usageSnap.exists()) {
                    await updateDoc(usageRef, { count: increment(1) });
                } else {
                    await setDoc(usageRef, { count: 1 });
                }
            }
        } catch (err) {
            console.error("AI Limit Check Failed:", err);
            // Non-blocking but good to log
        }

        const userMessage = {
            text: textToSend || (fileToUpload ? `Uploaded document: ${fileToUpload.name}` : ""),
            isUser: true,
            timestamp: new Date().toISOString(),
            file: fileToUpload ? {
                name: fileToUpload.name,
                type: fileToUpload.type,
                url: fileToUpload.type.startsWith('image/') ? URL.createObjectURL(fileToUpload) : null
            } : null
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            let response;
            if (fileToUpload) {
                const formData = new FormData();
                formData.append('file', fileToUpload);
                formData.append('message', textToSend || "Please analyze this uploaded medical document in detail. Extract and explain all findings, test results, and prescribed medications, and provide clinical insights with next steps.");
                if (conversationId) formData.append('conversation_id', conversationId);
                if (medicalSummary) formData.append('medicalContext', medicalSummary);

                response = await fetch(`${API_BASE_URL}/api/health-assistant/chat`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                response = await fetch(`${API_BASE_URL}/api/health-assistant/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: textToSend,
                        conversation_id: conversationId,
                        medicalContext: medicalSummary
                    })
                });
            }

            const data = await response.json();

            if (data.success) {
                const aiMessage = {
                    text: data.response,
                    isUser: false,
                    timestamp: data.timestamp
                };
                setMessages(prev => [...prev, aiMessage]);
                setConversationId(prev => prev || data.conversation_id);
                if (data.doc_summary && !medicalSummary) {
                    setMedicalSummary(data.doc_summary);
                }
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                text: "I apologize, but I'm having trouble connecting. Please check if the backend server is running and try again.",
                isUser: false,
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = async () => {
        if (conversationId) {
            try {
                await fetch(`${API_BASE_URL}/api/health-assistant/clear`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ conversation_id: conversationId })
                });
            } catch (error) {
                console.error('Error clearing conversation:', error);
            }
        }

        setMessages([{
            text: "Conversation cleared. How can I help you today?",
            isUser: false,
            timestamp: new Date().toISOString()
        }]);
        setConversationId(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto text-white scroll-smooth relative z-0">
            <div className="sticky top-4 z-50 px-2 sm:px-6 mb-8">
                <Header
                    title="Cure AI"
                    description="Powered by Llama 3.3 - Ask me about diseases, symptoms, treatments, and health trends in India"
                    user={user}
                    onLogout={onLogout}
                    onLoginClick={onLoginClick}
                    onToggleSidebar={onToggleSidebar}
                    onNavigate={onNavigate}
                    onAddClick={() => onAddRecordClick && onAddRecordClick()}
                />
            </div>

            {/* Premium Hero Section - Compact AI Console Look */}
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: "-100px" }}
                variants={blurReveal}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 p-4 sm:p-8 mb-6 sm:mb-12 text-center mt-4 sm:mt-6"
            >
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-bold mb-4 sm:mb-6 animate-pulse">
                    <Bot size={14} className="sm:w-4 sm:h-4" /> NEURAL INTERFACE
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-100 mb-3 sm:mb-4 tracking-tight drop-shadow-lg">
                    Cure Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">AI</span>
                </h1>

                <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                    Advanced diagnostics support and health queries. Our <span className="text-amber-400 font-semibold">Dual-Core AI</span> will instantly answer your questions and provide personalized health guidance effectively.
                </p>

                <div className="flex justify-center gap-6 sm:gap-8 mt-6 sm:mt-8 opacity-70">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-sky-400"><Bot size={20} className="sm:w-6 sm:h-6" /></div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-slate-500">Ask</span>
                    </div>
                    <div className="w-12 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400"><Brain size={20} className="sm:w-6 sm:h-6" /></div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-slate-500">Reason</span>
                    </div>
                    <div className="w-12 h-px bg-slate-700 self-center"></div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400"><ShieldCheck size={20} className="sm:w-6 sm:h-6" /></div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-slate-500">Verify</span>
                    </div>
                </div>
            </motion.div>

            {/* Recent Medical Context Section (Cerebras AI Powered) */}
            {(medicalSummary || isSummaryLoading) && (
                <div className="mb-6 px-2">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ margin: "-100px" }}
                        variants={fadeSlideUp}
                        className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl border border-amber-500/20 p-6 relative overflow-hidden shadow-xl"
                    >
                        <div className="flex items-start gap-4">

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-amber-100 mb-2 flex items-center gap-2">
                                    Recent Medical Context
                                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">AI Generated</span>
                                </h3>

                                {isSummaryLoading ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                                        <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                                        <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
                                    </div>
                                ) : (
                                    <div className="text-slate-300 text-sm leading-relaxed">
                                        {medicalSummary}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Background Decoration */}
                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>
            )}

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ margin: "-100px" }}
                variants={containerVariants}
                className="flex flex-col lg:flex-row gap-6 sm:gap-8 mt-2 min-h-0 relative z-10 pb-2"
            >
                {/* Main Chat Area - Premium Glass Console */}
                <div className="flex-1 flex flex-col glass-card !p-0 h-[600px] sm:h-[800px]">
                    {/* Subtle Grid - Professional */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>

                    {/* Premium Glow effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none"></div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative z-10">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} isUser={message.isUser} />
                            ))}
                        </AnimatePresence>

                        {isLoading && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 w-full relative z-20">
                        <PromptInputBox
                            onSend={sendMessage}
                            onClear={clearChat}
                            isLoading={isLoading}
                            placeholder="Speak your heart out..."
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CureAI;

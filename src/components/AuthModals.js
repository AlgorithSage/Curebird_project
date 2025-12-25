// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Phone, CheckCircle, Loader2, ArrowRight, User, Camera, Mail, Upload } from 'lucide-react';

// --- Initialize Providers ---
const googleProvider = new GoogleAuthProvider();

const ModalWrapper = ({ onClose, children }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
        onClick={onClose}
    >
        <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />

            {children}
        </motion.div>
    </motion.div>
);

const AuthModals = ({ onClose, db, storage, auth }) => {
    // Auth State
    const [authStep, setAuthStep] = useState('login'); // 'login' | 'profile'
    const [currentUser, setCurrentUser] = useState(null);

    // Login Form State
    const [phoneNumber, setPhoneNumber] = useState('+91 ');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Profile Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    // UI State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef(null);

    // Initialize Recaptcha
    const onCaptchVerify = () => {
        if (!window.recaptchaVerifier) {
            // SAFEGUARD: Ensure container is empty before creating new instance
            const container = document.getElementById('recaptcha-container');
            if (container) container.innerHTML = '';

            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': (response) => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    setError("Recaptcha expired. Please try again.");
                }
            });
        }
    }

    // Cleanup Recaptcha
    useEffect(() => {
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    // ignore
                }
                window.recaptchaVerifier = null;
            }
        }
    }, []);

    // Helper: Check if Profile Exists
    const checkAndRedirect = async (user) => {
        setCurrentUser(user);
        setError('');
        setLoading(true);

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                console.log("User Profile Found:", userDoc.data());
                setLoading(false);
                onClose(); // Profile exists, login complete
            } else {
                console.log("No Profile Found, redirecting to Onboarding...");
                // Pre-fill data from Google if available
                if (user.displayName) {
                    const names = user.displayName.split(' ');
                    setFirstName(names[0] || '');
                    setLastName(names.length > 1 ? names.slice(1).join(' ') : '');
                }
                if (user.email) setEmail(user.email);
                if (user.photoURL) setProfilePreview(user.photoURL);

                setAuthStep('profile');
                setLoading(false);
            }
        } catch (err) {
            console.error("Error checking profile:", err);
            setError(`Error: ${err.message}`);
            setLoading(false);
        }
    };

    // --- Login Handlers ---

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        const formattedNumber = phoneNumber.trim();
        if (formattedNumber.length < 12) {
            setError("Please enter a valid 10-digit number.");
            return;
        }

        setLoading(true);
        onCaptchVerify();

        const appVerifier = window.recaptchaVerifier;

        try {
            const confirmation = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
            setConfirmationResult(confirmation);
            setIsOtpSent(true);
            setLoading(false);
        } catch (error) {
            console.error("OTP Error:", error);
            setError(error.message);
            setLoading(false);
            // DO NOT clear verifier here; allows retry with same instance
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!otp || otp.length < 6) {
            setError("Please enter valid OTP.");
            setLoading(false);
            return;
        }

        try {
            const result = await confirmationResult.confirm(otp);
            checkAndRedirect(result.user);
        } catch (error) {
            console.error("OTP Verify Error:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setError('');
        signInWithPopup(auth, googleProvider)
            .then((result) => {
                checkAndRedirect(result.user);
            }).catch((err) => {
                setError(err.message);
            });
    }

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        if (!val.startsWith('+91')) {
            val = '+91 ' + val.replace(/^\+91\s?/, '');
        }
        setPhoneNumber(val);
    };

    // --- Profile Handlers ---

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!firstName.trim() || !lastName.trim()) {
            setError("First Name and Last Name are required.");
            return;
        }

        setLoading(true);

        try {
            let photoURL = profilePreview || ''; // Default to preview (could be Google URL)

            // Upload Image if new one selected
            if (profileImage) {
                const storageRef = ref(storage, `profile_pictures/${currentUser.uid}`);
                await uploadBytes(storageRef, profileImage);
                photoURL = await getDownloadURL(storageRef);
            } else if (!photoURL) {
                // No photo set, check if Google photo exists, else default is empty (handled by UI)
                photoURL = currentUser.photoURL || '';
            }

            // Save to Firestore
            await setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                phoneNumber: currentUser.phoneNumber || '',
                photoURL: photoURL,
                createdAt: new Date(),
                isProfileComplete: true
            });

            console.log("Profile Saved Successfully!");

            // Force reload of user state in parent or just close
            // Since we updated Firestore, App.js listener might catch it if we triggered a user update,
            // but for now, just closing is enough as the user is already logged in.
            // A page refresh might be needed to show the new name immediately if the listener doesn't fire on doc change.
            // But usually, modifying the doc won't trigger auth state change.
            // We can rely on a reload or just let the user in.
            window.location.reload(); // Simple way to ensure App.js fetches new profile

        } catch (err) {
            console.error("Profile Save Error:", err);
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <ModalWrapper onClose={onClose}>
            <div className="p-8 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {authStep === 'login' ? 'Welcome to Curebird' : 'Complete Profile'}
                    </h1>
                    <p className="text-slate-400 text-sm">
                        {authStep === 'login' ? 'Your intelligent health companion.' : 'Tell us a bit about yourself.'}
                    </p>
                </div>

                {authStep === 'login' ? (
                    // --- STEP 1: LOGIN ---
                    <>
                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                            Continue with Google
                        </button>

                        <div className="flex items-center my-6">
                            <div className="flex-grow border-t border-slate-700"></div>
                            <span className="flex-shrink mx-4 text-slate-500 text-xs font-medium uppercase tracking-wider">Or Login using Phone</span>
                            <div className="flex-grow border-t border-slate-700"></div>
                        </div>

                        <div className="space-y-4">
                            <div id="recaptcha-container"></div>

                            {!isOtpSent ? (
                                <form onSubmit={handleSendOtp} className="space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-400 ml-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={handlePhoneChange}
                                                placeholder="+91 99999 99999"
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/20 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                                            <>Get OTP <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                    <p className="text-[10px] text-slate-500 text-center">
                                        Standard message rates may apply.
                                    </p>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-3">
                                    <div className="text-center mb-2">
                                        <p className="text-slate-400 text-sm">OTP sent to <span className="text-white font-mono">{phoneNumber}</span></p>
                                        <button type="button" onClick={() => setIsOtpSent(false)} className="text-amber-500 text-xs hover:underline mt-1">Change Number</button>
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify & Login"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </>
                ) : (
                    // --- STEP 2: COMPLETE PROFILE ---
                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                        {/* Avatar Uploader */}
                        <div className="flex justify-center">
                            <div
                                className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer group hover:border-amber-500 transition-colors overflow-hidden"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {profilePreview ? (
                                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 ml-1">First Name <span className="text-amber-500">*</span></label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 ml-1">Last Name <span className="text-amber-500">*</span></label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 ml-1">Email <span className="text-slate-500">(Optional)</span></label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 mt-4"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : "Complete Signup"}
                        </button>
                    </form>
                )}

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-200 text-sm"
                        >
                            <ShieldAlert size={18} className="shrink-0 text-red-500" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ModalWrapper>
    );
};

export default AuthModals;

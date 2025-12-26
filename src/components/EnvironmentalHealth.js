import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, CloudFog, AlertTriangle, MapPin, Cigarette, Info } from 'lucide-react';

// Scientific conversion: approx 22ug/m3 of PM2.5 == 1 Cigarette
const CIGARETTE_FACTOR = 22;

const CITIES_DATA = [
    { name: 'New Delhi', aqi: 450, pm25: 290, description: 'Hazardous' },
    { name: 'Lucknow', aqi: 340, pm25: 210, description: 'Hazardous' },
    { name: 'Patna', aqi: 320, pm25: 180, description: 'Very Poor' },
    { name: 'Kolkata', aqi: 240, pm25: 150, description: 'Poor' },
    { name: 'Mumbai', aqi: 160, pm25: 75, description: 'Unhealthy' },
    { name: 'Jaipur', aqi: 210, pm25: 120, description: 'Poor' },
    { name: 'Ahmedabad', aqi: 190, pm25: 105, description: 'Unhealthy' },
    { name: 'Bhopal', aqi: 180, pm25: 95, description: 'Unhealthy' },
    { name: 'Chandigarh', aqi: 170, pm25: 85, description: 'Unhealthy' },
    { name: 'Guwahati', aqi: 160, pm25: 80, description: 'Unhealthy' },
    { name: 'Hyderabad', aqi: 130, pm25: 65, description: 'Unhealthy' },
    { name: 'Bhubaneswar', aqi: 140, pm25: 70, description: 'Unhealthy' },
    { name: 'Chennai', aqi: 110, pm25: 55, description: 'Moderate' },
    { name: 'Dehradun', aqi: 130, pm25: 68, description: 'Unhealthy' },
    { name: 'Raipur', aqi: 150, pm25: 82, description: 'Unhealthy' },
    { name: 'Ranchi', aqi: 155, pm25: 85, description: 'Unhealthy' },
    { name: 'Bangalore', aqi: 45, pm25: 18, description: 'Good' },
    { name: 'Thiruvananthapuram', aqi: 50, pm25: 20, description: 'Good' },
    { name: 'Srinagar', aqi: 90, pm25: 45, description: 'Moderate' },
    { name: 'Shimla', aqi: 60, pm25: 35, description: 'Satisfactory' },
    { name: 'Panaji', aqi: 55, pm25: 30, description: 'Satisfactory' },
    { name: 'Gangtok', aqi: 35, pm25: 15, description: 'Good' },
    { name: 'Shillong', aqi: 40, pm25: 18, description: 'Good' },
    { name: 'Aizawl', aqi: 25, pm25: 10, description: 'Good' },
    { name: 'Imphal', aqi: 50, pm25: 25, description: 'Good' },
    { name: 'Kohima', aqi: 65, pm25: 32, description: 'Satisfactory' },
    { name: 'Itanagar', aqi: 55, pm25: 28, description: 'Satisfactory' },
    { name: 'Agartala', aqi: 110, pm25: 58, description: 'Moderate' },
];

const EnvironmentalHealth = () => {
    const [selectedCity, setSelectedCity] = useState(CITIES_DATA[0]);

    // Calculation: cigarettes per day
    const cigarettes = (selectedCity.pm25 / CIGARETTE_FACTOR).toFixed(1);
    const cigaretteCount = Math.round(selectedCity.pm25 / CIGARETTE_FACTOR);

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-slate-500/20 p-2.5 rounded-xl border border-slate-500/30 shadow-lg shadow-slate-500/10">
                    <Wind size={24} className="text-slate-200" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Environmental Health & AQI</h2>
                    <p className="text-slate-400 text-sm">Quantifying the biological cost of air pollution.</p>
                </div>
            </div>

            {/* CONCEPT 1: THE SMOKER'S EQUIVALENT */}
            <div className="glass-card p-8 rounded-3xl border border-white/5 mb-8 relative overflow-hidden">

                {/* Dynamic Smoke Background Overlay */}
                <motion.div
                    animate={{ opacity: Math.min(selectedCity.aqi / 600, 0.8) }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 pointer-events-none z-0"
                    style={{ filter: 'blur(40px)' }}
                />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Cigarette size={20} className="text-orange-400" />
                                "The Smoker's Equivalent"
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-lg">
                                AQI numbers are abstract. We translate pollution into a metric everyone understands: <strong>Cigarettes smoked per day.</strong>
                            </p>
                        </div>

                        {/* City Selector */}
                        {/* City Selector */}
                        <div className="w-full lg:w-96 bg-slate-900/50 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Location</h4>
                            <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                {CITIES_DATA.map((city) => (
                                    <button
                                        key={city.name}
                                        onClick={() => setSelectedCity(city)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left truncate flex items-center gap-2 ${selectedCity.name === city.name
                                                ? 'bg-slate-700 text-white shadow-lg border border-white/20'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${city.aqi > 300 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : city.aqi > 200 ? 'bg-orange-500' : city.aqi > 100 ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Visualization Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Left: The Metric */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="mb-6">
                                <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold block mb-2">Current Air Quality</span>
                                <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                                    <span className="text-6xl font-black text-white">{selectedCity.aqi}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${selectedCity.aqi > 300 ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                        selectedCity.aqi > 100 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                            'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                        }`}>
                                        {selectedCity.description}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-sm w-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle size={20} className="text-orange-500" />
                                    <span className="text-slate-200 font-medium">Biological Impact Today</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/5 p-3 rounded-full">
                                        <Cigarette size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-xs">Breathing this air is roughly equal to:</p>
                                        <p className="text-3xl font-bold text-white mt-1">
                                            <span className="text-orange-400">{cigarettes}</span> Cigarettes
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: The Visualizer */}
                        <div className="bg-slate-800/30 p-8 rounded-3xl border border-white/5 min-h-[250px] flex flex-col justify-center relative">
                            <p className="absolute top-4 left-6 text-xs text-slate-500 font-mono">VISUALIZATION</p>

                            <div className="flex flex-wrap gap-2 justify-center content-center py-6">
                                <AnimatePresence mode="popLayout">
                                    {Array.from({ length: cigaretteCount }).map((_, i) => (
                                        <motion.div
                                            key={`${selectedCity.name}-${i}`}
                                            initial={{ opacity: 0, scale: 0, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0 }}
                                            transition={{ delay: i * 0.05, type: 'spring' }}
                                            className="relative group"
                                        >
                                            {/* Cigarette Icon Representation */}
                                            <div className="w-2 h-16 bg-gradient-to-b from-orange-300 via-white to-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] transform rotate-12 group-hover:rotate-0 transition-transform origin-bottom" title="~1 Cigarette"></div>

                                            {/* Smoke particle effect per cig */}
                                            <div className="absolute -top-4 -left-2 w-6 h-6 bg-gray-400/20 rounded-full blur-md animate-pulse"></div>
                                        </motion.div>
                                    ))}
                                    {cigaretteCount === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-emerald-400 font-medium flex flex-col items-center gap-2"
                                        >
                                            <Wind size={40} />
                                            <span>Start Breathing Freely!</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {cigaretteCount > 0 && (
                                <p className="text-center text-xs text-slate-500 mt-4">
                                    Each bar represents ~1 cigarette worth of PM2.5 inhaled over 24 hours.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer / Source */}
            <div className="text-center">
                <p className="text-slate-500 text-xs flex items-center justify-center gap-1">
                    <Info size={12} />
                    Methodology: Based on Berkeley Earth's rule of thumb (22 µg/m³ PM2.5 ≈ 1 Cigarette). This is an approximation for public awareness.
                </p>
            </div>
        </div>
    );
};

export default EnvironmentalHealth;

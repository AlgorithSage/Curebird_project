import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, CloudFog, AlertTriangle, MapPin, Cigarette, Info, Search, RefreshCw, Signal, Zap } from 'lucide-react';

// Scientific conversion: approx 22ug/m3 of PM2.5 == 1 Cigarette
const CIGARETTE_FACTOR = 22;

const getAQIDescription = (aqi) => {
    if (aqi > 300) return 'Hazardous';
    if (aqi > 200) return 'Very Poor';
    if (aqi > 150) return 'Unhealthy';
    if (aqi > 100) return 'Poor';
    if (aqi > 50) return 'Moderate';
    return 'Good';
};

const CITIES_DATA = [
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090, aqi: 450, pm25: 290, description: 'Hazardous' },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462, aqi: 340, pm25: 210, description: 'Hazardous' },
    { name: 'Patna', lat: 25.5941, lng: 85.1376, aqi: 320, pm25: 180, description: 'Very Poor' },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, aqi: 240, pm25: 150, description: 'Poor' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, aqi: 160, pm25: 75, description: 'Unhealthy' },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873, aqi: 210, pm25: 120, description: 'Poor' },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, aqi: 190, pm25: 105, description: 'Unhealthy' },
    { name: 'Bhopal', lat: 23.2599, lng: 77.4126, aqi: 180, pm25: 95, description: 'Unhealthy' },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, aqi: 170, pm25: 85, description: 'Unhealthy' },
    { name: 'Guwahati', lat: 26.1445, lng: 91.7362, aqi: 160, pm25: 80, description: 'Unhealthy' },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, aqi: 130, pm25: 65, description: 'Unhealthy' },
    { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, aqi: 140, pm25: 70, description: 'Unhealthy' },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, aqi: 110, pm25: 55, description: 'Moderate' },
    { name: 'Dehradun', lat: 30.3165, lng: 78.0322, aqi: 130, pm25: 68, description: 'Unhealthy' },
    { name: 'Raipur', lat: 21.2514, lng: 81.6296, aqi: 150, pm25: 82, description: 'Unhealthy' },
    { name: 'Ranchi', lat: 23.3441, lng: 85.3096, aqi: 155, pm25: 85, description: 'Unhealthy' },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, aqi: 45, pm25: 18, description: 'Good' },
    { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, aqi: 50, pm25: 20, description: 'Good' },
    { name: 'Srinagar', lat: 34.0837, lng: 74.7973, aqi: 90, pm25: 45, description: 'Moderate' },
    { name: 'Shimla', lat: 31.1048, lng: 77.1734, aqi: 60, pm25: 35, description: 'Satisfactory' },
    { name: 'Panaji', lat: 15.4909, lng: 73.8278, aqi: 55, pm25: 30, description: 'Satisfactory' },
    { name: 'Gangtok', lat: 27.3389, lng: 88.6065, aqi: 35, pm25: 15, description: 'Good' },
    { name: 'Shillong', lat: 25.5788, lng: 91.8933, aqi: 40, pm25: 18, description: 'Good' },
    { name: 'Aizawl', lat: 23.7307, lng: 92.7173, aqi: 25, pm25: 10, description: 'Good' },
    { name: 'Imphal', lat: 24.8170, lng: 93.9368, aqi: 50, pm25: 25, description: 'Good' },
    { name: 'Kohima', lat: 25.6751, lng: 94.1086, aqi: 65, pm25: 32, description: 'Satisfactory' },
    { name: 'Itanagar', lat: 27.0844, lng: 93.6053, aqi: 55, pm25: 28, description: 'Satisfactory' },
    { name: 'Agartala', lat: 23.8315, lng: 91.2868, aqi: 110, pm25: 58, description: 'Moderate' },
];

const EnvironmentalHealth = () => {
    const [selectedCity, setSelectedCity] = useState(CITIES_DATA[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [liveData, setLiveData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLive, setIsLive] = useState(false);

    // Filter cities based on search
    const filteredCities = CITIES_DATA.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchAQI = async (city) => {
        // Use WAQI API Token
        const apiKey = process.env.REACT_APP_WAQI_API_TOKEN;

        if (!apiKey) {
            console.warn("WAQI API Key not found.");
            setIsLive(false);
            setLiveData(null);
            return;
        }

        setIsLoading(true);
        try {
            // WAQI API Endpoint
            const response = await fetch(`https://api.waqi.info/feed/geo:${city.lat};${city.lng}/?token=${apiKey}`);

            if (!response.ok) {
                throw new Error('Failed to fetch AQI data');
            }

            const data = await response.json();

            if (data.status !== 'ok') {
                throw new Error('API returned error status');
            }

            const result = data.data;
            let aqi = result.aqi;
            let pm25 = 0;

            // Extract PM2.5 if available
            if (result.iaqi && result.iaqi.pm25) {
                pm25 = result.iaqi.pm25.v;
            }

            // Fallback Logic
            if (aqi && !isNaN(aqi)) {
                if (!pm25 || isNaN(pm25)) {
                    // Estimate if missing
                    pm25 = aqi * 0.75;
                }

                const description = getAQIDescription(aqi);

                setLiveData({
                    aqi: Math.round(aqi),
                    pm25: pm25,
                    description: description
                });
                setIsLive(true);
            } else {
                setIsLive(false);
                setLiveData(null);
            }

        } catch (error) {
            console.error("Error fetching AQI:", error);
            setIsLive(false);
            setLiveData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when city changes
    useEffect(() => {
        fetchAQI(selectedCity);
    }, [selectedCity]);

    // Use live data if available, otherwise static
    const currentAQI = liveData ? liveData.aqi : selectedCity.aqi;
    const currentPM25 = liveData ? liveData.pm25 : selectedCity.pm25;
    const currentDesc = liveData ? liveData.description : selectedCity.description;

    // Calculation: cigarettes per day
    const cigarettes = (currentPM25 / CIGARETTE_FACTOR).toFixed(1);
    const cigaretteCount = Math.round(currentPM25 / CIGARETTE_FACTOR);

    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-4 pl-4">
                <div className="bg-slate-500/20 p-2 rounded-lg border border-slate-500/30">
                    <CloudFog size={20} className="text-slate-200" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Environmental Health & AQI</h2>
                </div>
            </div>

            {/* CONCEPT 1: THE SMOKER'S EQUIVALENT */}
            <div className="glass-card p-8 lg:p-12 rounded-[2.5rem] border border-white/5 mb-8 relative overflow-hidden min-h-[600px]">

                {/* Dynamic Smoke Background Overlay */}
                <motion.div
                    animate={{ opacity: Math.min(currentAQI / 600, 0.8) }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 pointer-events-none z-0"
                    style={{ filter: 'blur(40px)' }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 h-full">

                    {/* LEFT COLUMN: Narrative & Metrics (Full Height) */}
                    <div className="flex flex-col justify-center h-full gap-20">
                        {/* Header Section */}
                        <div>
                            <h3 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3 mb-6 tracking-tight">
                                <Cigarette size={40} className="text-orange-400" />
                                "The Smoker's Equivalent"
                            </h3>
                            <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                                AQI numbers are abstract. We translate pollution into a metric everyone understands: <strong className="text-white font-semibold">Cigarettes smoked per day.</strong>
                            </p>
                        </div>

                        {/* Metrics Section */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <span className="text-slate-400 font-bold tracking-[0.2em] text-sm mb-4 block uppercase opacity-80">Current Air Quality</span>
                                <div className="flex items-end gap-6">
                                    <span className="text-8xl md:text-[8rem] font-black text-white leading-[0.85] tracking-tighter drop-shadow-2xl">
                                        {currentAQI}
                                    </span>
                                    <span className={`px-5 py-2 mb-4 rounded-full text-sm font-bold uppercase tracking-wider border-2 shadow-lg ${currentAQI > 300 ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20' :
                                            currentAQI > 200 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 shadow-orange-500/20' :
                                                currentAQI > 100 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-yellow-500/20' :
                                                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20'
                                        }`}>
                                        {currentDesc}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-black/40 p-10 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all duration-700"></div>

                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="bg-orange-500/20 p-2.5 rounded-xl">
                                        <AlertTriangle size={24} className="text-orange-500" />
                                    </div>
                                    <span className="text-slate-200 font-bold text-lg tracking-wide">Biological Impact Today</span>
                                </div>
                                <div className="flex items-end gap-6 relative z-10">
                                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                        <Cigarette size={48} className="text-white opacity-90" />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium mb-1 tracking-wide uppercase opacity-70">Breathing this air is roughly equal to:</p>
                                        <p className="text-5xl md:text-7xl font-black text-white leading-none mt-2">
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500">{cigarettes}</span> <span className="text-3xl md:text-4xl text-slate-400 font-bold tracking-tight">Cigarettes</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* RIGHT COLUMN: Selector & Visualization (Full Height) */}
                    <div className="flex flex-col gap-6 h-full">

                        {/* City Selector */}
                        <div className="w-full bg-slate-900/50 p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Location</h4>
                                    {/* Integrated Status Indicator */}
                                    {isLoading ? (
                                        <RefreshCw size={10} className="text-orange-400 animate-spin" />
                                    ) : isLive ? (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[0.6rem] font-bold text-emerald-400 tracking-wide uppercase">Live</span>
                                        </div>
                                    ) : (
                                        <span className="text-[0.6rem] text-slate-600 font-medium tracking-wide uppercase border border-slate-700 px-1.5 rounded bg-slate-800/50">Est.</span>
                                    )}
                                </div>

                                <div className="relative group">
                                    <Search size={16} className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-orange-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search city..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-800/80 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 w-40 focus:w-64 transition-all placeholder:text-slate-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar content-start">
                                {filteredCities.map((city) => (
                                    <button
                                        key={city.name}
                                        onClick={() => setSelectedCity(city)}
                                        className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all text-left truncate flex items-center gap-3 ${selectedCity.name === city.name
                                            ? 'bg-slate-700 text-white shadow-lg border border-white/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                            }`}
                                    >
                                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${city.aqi > 300 ? 'bg-red-500 shadow-red-500/50' : city.aqi > 200 ? 'bg-orange-500 shadow-orange-500/50' : city.aqi > 100 ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                                        {city.name}
                                    </button>
                                ))}
                                {filteredCities.length === 0 && (
                                    <div className="col-span-2 flex flex-col items-center justify-center py-8 text-slate-500 gap-3">
                                        <Search size={28} className="opacity-20" />
                                        <span className="text-sm font-medium">No city found</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visualizer */}
                        <div className="bg-slate-800/30 p-8 rounded-[2rem] border border-white/5 flex-grow min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                            <p className="absolute top-6 left-8 text-xs text-slate-500 font-mono z-20 tracking-widest opacity-50">VISUALIZATION</p>

                            {/* Background Atmosphere - Global Smog Density */}
                            <motion.div
                                animate={{ opacity: Math.min(currentAQI / 500, 0.8) }}
                                transition={{ duration: 1 }}
                                className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-800/30 to-transparent pointer-events-none z-0"
                            ></motion.div>

                            <div className="flex flex-wrap gap-4 justify-center content-center py-6 px-4 relative z-10 perspective-[1000px] w-full h-full items-center">
                                <AnimatePresence mode="popLayout">
                                    {Array.from({ length: cigaretteCount }).map((_, i) => (
                                        <motion.div
                                            key={`${selectedCity.name}-${i}`}
                                            initial={{ opacity: 0, scale: 0, y: 100, rotate: Math.random() * 10 - 5 }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                y: 0,
                                                rotate: 0,
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 260,
                                                    damping: 20,
                                                    delay: i * 0.05
                                                }
                                            }}
                                            exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                                            className="relative group flex flex-col items-center"
                                        >
                                            {/* ADVANCED SMOKE PHYSICS */}
                                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-12 h-24 pointer-events-none overflow-visible opacity-80 mix-blend-screen">
                                                {/* Smoke Stream 1: Fast & Narrow */}
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-slate-400 rounded-full blur-[2px] animate-[smoke-rise_2s_linear_infinite]" style={{ animationDelay: `${Math.random()}s` }}></div>
                                                {/* Smoke Stream 2: Slow & Wide */}
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-500 rounded-full blur-md animate-[smoke-curl_3s_ease-out_infinite]" style={{ animationDelay: `${Math.random() + 0.5}s` }}></div>
                                                {/* Smoke Stream 3: Dissipating Haze */}
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-600/30 rounded-full blur-xl animate-[smoke-fade_4s_linear_infinite]" style={{ animationDelay: `${Math.random() + 1}s` }}></div>
                                            </div>

                                            {/* ULTRA-REALISTIC CIGARETTE */}
                                            <div className="w-3.5 h-24 flex flex-col items-center relative shadow-2xl drop-shadow-2xl transform transition-transform group-hover:-translate-y-3 duration-300">

                                                {/* 1. The Cherry (Burning Ember with Glow) */}
                                                <div className="w-full h-2 rounded-t-sm relative z-30 overflow-visible">
                                                    <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-t from-red-600 via-orange-500 to-transparent animate-pulse rounded-full blur-[1px]"></div>
                                                    <div className="absolute inset-0 bg-[#331111] overflow-hidden rounded-t-sm">
                                                        <div className="w-full h-full bg-orange-500 animate-[ember-flicker_0.1s_infinite] opacity-80"></div>
                                                    </div>
                                                    {/* Glow Halo */}
                                                    <div className="absolute -top-1 -left-1 -right-1 h-4 bg-orange-500/40 blur-md rounded-full animate-pulse"></div>
                                                </div>

                                                {/* 2. Ash Line */}
                                                <div className="w-full h-4 bg-gradient-to-b from-[#2a2a2a] to-[#cccccc] relative z-20 border-x border-black/10">
                                                    <div className="absolute top-1 left-0 w-full h-[1px] bg-white/20"></div>
                                                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/20"></div>
                                                </div>

                                                {/* 3. Paper Body (Matte White with texture) */}
                                                <div className="w-full h-12 bg-gradient-to-r from-[#e5e5e5] via-[#ffffff] to-[#d6d6d6] border-x border-black/5 relative z-10 z-10">
                                                    <div className="w-full h-[1px] bg-black/5 absolute top-3"></div>
                                                    <div className="w-full h-[1px] bg-black/5 absolute top-6"></div>
                                                    <div className="w-full h-[1px] bg-black/5 absolute top-9"></div>
                                                </div>

                                                {/* 4. Gold Ring */}
                                                <div className="w-full h-0.5 bg-yellow-600/90 z-10"></div>

                                                {/* 5. Filter (Cork Texture) */}
                                                <div className="w-full h-6 bg-[#ce8f4b] rounded-b-sm relative border-x border-black/10 overflow-hidden z-10">
                                                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cork-board.png')] bg-[length:10px_10px]"></div>
                                                    {/* Fallback texture if image fails */}
                                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5c3a12 1px, transparent 1px)', backgroundSize: '2px 2px' }}></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {cigaretteCount === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-emerald-400 font-medium flex flex-col items-center gap-2"
                                        >
                                            <div className="p-4 bg-emerald-500/10 rounded-full animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                <Wind size={40} />
                                            </div>
                                            <span className="text-lg font-light tracking-wide">Pure Air. Breathe Deep.</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {cigaretteCount > 0 && (
                                <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-500 z-20 pointer-events-none">
                                    Each object represents ~1 cigarette worth of toxic particulate matter.
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

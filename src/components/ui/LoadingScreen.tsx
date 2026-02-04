import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
    onLoadComplete?: () => void;
    minDisplayTime?: number; // Minimum time to show loading screen in ms
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    onLoadComplete,
    minDisplayTime = 2500
}) => {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + Math.random() * 15;
                return next >= 100 ? 100 : next;
            });
        }, 200);

        // Minimum display time
        const timer = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => onLoadComplete?.(), 500);
            }, 300);
        }, minDisplayTime);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [minDisplayTime, onLoadComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-[#050510] flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            {/* Animated Solar System Logo */}
            <div className="relative w-64 h-64 mb-8">
                {/* Sun */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 shadow-[0_0_60px_20px_rgba(251,191,36,0.4)] animate-pulse" />

                {/* Orbit 1 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/10 rounded-full animate-[spin_3s_linear_infinite]">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_3px_rgba(96,165,250,0.5)]" />
                </div>

                {/* Orbit 2 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border border-white/10 rounded-full animate-[spin_5s_linear_infinite_reverse]">
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 shadow-[0_0_10px_3px_rgba(248,113,113,0.5)]" />
                </div>

                {/* Orbit 3 */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 border border-white/10 rounded-full animate-[spin_8s_linear_infinite]">
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-300 shadow-[0_0_10px_3px_rgba(252,211,77,0.5)]">
                        {/* Saturn-like ring */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-amber-200/50 rounded-full rotate-12" />
                    </div>
                </div>

                {/* Shooting stars */}
                <div className="absolute top-4 right-8 w-1 h-1 bg-white rounded-full animate-ping" />
                <div className="absolute bottom-12 left-4 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-16 left-12 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Stellar Sandbox
                </span>
            </h1>
            <p className="text-gray-400 text-sm mb-8">Solar System Simulator</p>

            {/* Progress Bar */}
            <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-gray-500 text-xs mt-3">
                {progress < 100 ? 'Loading universe...' : 'Ready!'}
            </p>

            {/* Stars background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            opacity: Math.random() * 0.7 + 0.3
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

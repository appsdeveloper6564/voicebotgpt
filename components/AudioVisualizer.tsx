import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    isActive: boolean;
    isDark: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isActive, isDark }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        let bars = Array(20).fill(10);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            if (isActive) {
                 bars = bars.map(() => Math.random() * 40 + 10);
            } else {
                 bars = bars.map(h => Math.max(5, h * 0.9));
            }

            // Color based on theme
            ctx.fillStyle = isDark ? '#ffffff' : '#4b5563'; // White in dark mode, Gray-600 in light
            if (isActive) {
                 ctx.fillStyle = isDark ? '#ffffff' : '#7c3aed'; // White or Purple
            }

            ctx.beginPath();
            
            bars.forEach((height, i) => {
                const angle = (i / bars.length) * Math.PI * 2;
                const x = centerX + Math.cos(angle) * (30 + height);
                const y = centerY + Math.sin(angle) * (30 + height);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            
            ctx.closePath();
            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = isActive ? '#a855f7' : (isDark ? '#ef4444' : '#f97316'); 
            ctx.fillStyle = isActive 
                ? (isDark ? 'rgba(168, 85, 247, 0.8)' : 'rgba(124, 58, 237, 0.8)') 
                : (isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(249, 115, 22, 0.3)');
            ctx.fill();

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationId);
    }, [isActive, isDark]);

    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-500 ${
                isActive 
                    ? (isDark ? 'bg-purple-600/30' : 'bg-purple-400/40') 
                    : (isDark ? 'bg-orange-600/10' : 'bg-orange-400/20')
            }`}></div>
            <canvas ref={canvasRef} width={200} height={200} className="z-10" />
            <div className="absolute z-20">
                {isActive ? (
                    <svg className={`w-12 h-12 animate-pulse ${isDark ? 'text-white' : 'text-purple-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                ) : (
                    <svg className={`w-12 h-12 ${isDark ? 'text-white/50' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
            </div>
        </div>
    );
};

export default AudioVisualizer;
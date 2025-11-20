import React from 'react';
import { LINKS } from '../constants';

interface SidebarProps {
    isDark: boolean;
    toggleTheme: () => void;
    subscriberCount: number;
    subscriberGoal: number;
    onSubscribe: () => void;
    currentVoice: string;
    setVoice: (voice: string) => void;
    voiceSpeed: number;
    setVoiceSpeed: (speed: number) => void;
    voicePitch: number;
    setVoicePitch: (pitch: number) => void;
}

const AdsterraSidebarWidget = () => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    React.useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentWindow?.document;
        if (!doc) return;
        
        if (doc.body.innerHTML.length > 0) return;

        const s = `
            <html>
            <head><style>body { margin: 0; padding: 0; display: flex; justify-content: center; overflow: hidden; background: transparent; }</style></head>
            <body>
            <script type="text/javascript">
                atOptions = {
                    'key' : '499eb2d383f1f44a26b582b7bed93649',
                    'format' : 'iframe',
                    'height' : 300,
                    'width' : 160,
                    'params' : {}
                };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/499eb2d383f1f44a26b582b7bed93649/invoke.js"></script>
            </body>
            </html>
        `;
        doc.open();
        doc.write(s);
        doc.close();
    }, []);

    return (
        <div className="my-6 flex justify-center bg-gray-50 dark:bg-white/5 rounded-xl p-2 border border-gray-100 dark:border-white/5">
            <iframe ref={iframeRef} width="160" height="300" scrolling="no" frameBorder="0" title="Advertisement" />
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ 
    isDark, 
    toggleTheme, 
    subscriberCount, 
    subscriberGoal, 
    onSubscribe,
    currentVoice,
    setVoice,
    voiceSpeed,
    setVoiceSpeed,
    voicePitch,
    setVoicePitch
}) => {
    const progressPercentage = Math.min(100, Math.max(0, (subscriberCount / subscriberGoal) * 100));
    const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
        return num.toString();
    };

    const FX_PRESETS = [
        { name: 'Normal', speed: 1.0, pitch: 0 },
        { name: 'Deep', speed: 1.0, pitch: -400 },
        { name: 'High', speed: 1.0, pitch: 350 },
        { name: 'Fast', speed: 1.25, pitch: 0 },
        { name: 'Slow', speed: 0.85, pitch: -200 },
    ];

    const applyPreset = (preset: typeof FX_PRESETS[0]) => {
        setVoiceSpeed(preset.speed);
        setVoicePitch(preset.pitch);
    };

    const isPresetActive = (preset: typeof FX_PRESETS[0]) => {
        return voiceSpeed === preset.speed && voicePitch === preset.pitch;
    };

    return (
        <div className="hidden lg:flex flex-col w-80 h-full bg-white dark:bg-[#09090b] border-r border-gray-100 dark:border-white/5 p-6 transition-colors duration-300 z-30 shadow-2xl shadow-black/5">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            VoiceBot
                        </h1>
                        <div className="flex items-center gap-1">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                             <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">System Online</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400"
                    title="Switch Theme"
                >
                    {isDark ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
            </div>

            {/* AI Voice Changer Module */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-3 ml-1">
                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">AI Voice Changer</h3>
                </div>
                
                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl space-y-4 border border-gray-100 dark:border-white/5">
                    {/* Voice Identity */}
                    <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase mb-2 block">Identity</label>
                        <div className="grid grid-cols-5 gap-1.5">
                            {voices.map((voice) => (
                                <button
                                    key={voice}
                                    onClick={() => setVoice(voice)}
                                    className={`relative h-9 rounded-lg text-xs font-bold transition-all duration-300 flex items-center justify-center
                                        ${currentVoice === voice 
                                            ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/20 scale-105' 
                                            : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                        }`}
                                    title={voice}
                                >
                                    {voice[0]}
                                    {currentVoice === voice && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-black"></span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FX Presets */}
                    <div>
                        <label className="text-[10px] font-semibold text-gray-400 uppercase mb-2 block">FX Presets</label>
                        <div className="grid grid-cols-3 gap-1.5">
                             {FX_PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset)}
                                    className={`px-2 py-1.5 rounded-md text-[10px] font-bold transition-all border
                                        ${isPresetActive(preset)
                                            ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400'
                                            : 'bg-transparent border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {preset.name}
                                </button>
                             ))}
                        </div>
                    </div>

                    {/* Fine Tune Controls */}
                    <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-white/5">
                        {/* Speed Control */}
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-1">
                                <span>Speed</span>
                                <span>{voiceSpeed.toFixed(2)}x</span>
                            </div>
                            <input 
                                type="range" 
                                min="0.75" 
                                max="1.5" 
                                step="0.05" 
                                value={voiceSpeed} 
                                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>

                        {/* Pitch Control */}
                        <div>
                            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 font-semibold mb-1">
                                <span>Pitch</span>
                                <span>{voicePitch > 0 ? '+' : ''}{voicePitch} cents</span>
                            </div>
                            <input 
                                type="range" 
                                min="-600" 
                                max="600" 
                                step="50" 
                                value={voicePitch} 
                                onChange={(e) => setVoicePitch(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    </div>
                </div>
                
                <p className="text-center mt-3 text-[10px] text-gray-400">
                    Active: <span className="text-orange-500 font-bold">{currentVoice}</span> 
                    {voiceSpeed !== 1 || voicePitch !== 0 ? <span className="text-purple-500 ml-1 font-bold">+ FX</span> : ''}
                </p>
            </div>

            {/* Links Section */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {/* Socials */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Connect</h3>
                    <div className="space-y-2">
                        {LINKS.filter(l => l.category === 'social').map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noreferrer" 
                               className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all group">
                                <span className="text-xl mr-3 group-hover:scale-110 transition-transform opacity-80 group-hover:opacity-100">{link.icon}</span>
                                <div>
                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">{link.title}</div>
                                    {link.description && <div className="text-[10px] text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-400">{link.description}</div>}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Projects */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Explore</h3>
                    <div className="space-y-2">
                        {LINKS.filter(l => l.category === 'project' || l.category === 'game').map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noreferrer" 
                               className="flex items-center p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group">
                                <span className="text-xl mr-3 group-hover:scale-110 transition-transform opacity-80 group-hover:opacity-100">{link.icon}</span>
                                <div>
                                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">{link.title}</div>
                                    {link.description && <div className="text-[10px] text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-400">{link.description}</div>}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Blogs */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">Read</h3>
                    <div className="grid grid-cols-1 gap-2">
                         {LINKS.filter(l => l.category === 'blog').map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noreferrer" 
                               className="flex items-center px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                <span className="mr-2 text-base opacity-70">{link.icon}</span> {link.title}
                            </a>
                        ))}
                    </div>
                </div>
                
                {/* Adsterra Vertical Ad */}
                <AdsterraSidebarWidget />
            </div>

            {/* Bottom Goal Card */}
            <div className="mt-auto pt-6">
                <div className="relative overflow-hidden p-5 rounded-2xl bg-gray-900 dark:bg-black border border-gray-800 dark:border-white/10 shadow-2xl group">
                    {/* Background Glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-all"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl group-hover:bg-orange-600/30 transition-all"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Goal</p>
                                <p className="text-lg font-bold text-white">{formatNumber(subscriberGoal)} <span className="text-sm font-normal text-gray-500">Subs</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                                    {Math.round(progressPercentage)}%
                                </p>
                            </div>
                        </div>
                        
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden mb-4">
                            <div 
                                className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all duration-700 ease-out" 
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <button 
                            onClick={onSubscribe} 
                            className="w-full py-2.5 rounded-xl bg-white text-black hover:bg-gray-100 font-bold text-xs uppercase tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                        >
                            Subscribe Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
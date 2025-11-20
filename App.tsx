import React, { useState, useEffect, useRef } from 'react';
import { GeminiLiveService } from './services/geminiLive';
import { ConnectionState, Message } from './types';
import AudioVisualizer from './components/AudioVisualizer';
import Sidebar from './components/Sidebar';
import { LINKS } from './constants';

const App: React.FC = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [isProMode, setIsProMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentVoice, setCurrentVoice] = useState<string>('Kore');
  const [voiceNotification, setVoiceNotification] = useState<string | null>(null);
  
  // Voice Changer State
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voicePitch, setVoicePitch] = useState(0);
  
  // Dynamic Goal Logic
  const [subscriberCount, setSubscriberCount] = useState(950);
  
  // Calculate Goal: Starts at 1000. If reached, multiplies by 10.
  const subscriberGoal = (() => {
      if (subscriberCount < 1000) return 1000;
      let goal = 1000;
      while (subscriberCount >= goal) {
          goal *= 10;
      }
      return goal;
  })();

  const progressPercentage = Math.min(100, Math.max(0, (subscriberCount / subscriberGoal) * 100));

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'K';
    return num.toString();
  };

  const handleSubscribeClick = () => {
      window.open("https://youtube.com/@mafiatechpro?si=CtHV8-5g16ZJWYj_", "_blank");
      // Simulation
      setSubscriberCount(prev => prev + 50);
  };
  
  const serviceRef = useRef<GeminiLiveService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use process.env.API_KEY directly. Vite's define plugin will replace this with the string literal at build time.
  const rawApiKey = process.env.API_KEY;
  const apiKey = rawApiKey ? rawApiKey.trim() : undefined;
  
  const isDark = theme === 'dark';

  // Group Links for Mobile
  const socialLinks = LINKS.filter(l => l.category === 'social');
  const otherLinks = LINKS.filter(l => l.category !== 'social');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Update Voice Effects
  useEffect(() => {
      if (serviceRef.current) {
          serviceRef.current.setPlaybackConfig(voiceSpeed, voicePitch);
      }
  }, [voiceSpeed, voicePitch]);

  const handleConnect = async () => {
    if (!apiKey) {
      setError("Missing API Key. Go to Netlify > Site settings > Environment variables and add 'API_KEY'.");
      return;
    }
    setError(null);
    
    const service = new GeminiLiveService(
      apiKey,
      (text, isUser) => {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === (isUser ? 'user' : 'model')) {
             return [...prev.slice(0, -1), { ...lastMsg, text: text }];
          } else {
             return [...prev, { role: isUser ? 'user' : 'model', text, timestamp: new Date() }];
          }
        });
      },
      (status) => {
        setConnectionState(status as ConnectionState);
        if (status === ConnectionState.ERROR) {
             // Keep the generic error state, specific messages are logged to console
             setTimeout(() => setConnectionState(ConnectionState.DISCONNECTED), 3000);
        }
      }
    );

    serviceRef.current = service;
    service.setPlaybackConfig(voiceSpeed, voicePitch); // Set initial config
    await service.connect(isProMode, currentVoice);
  };

  const handleDisconnect = async () => {
    if (serviceRef.current) {
      await serviceRef.current.disconnect();
      serviceRef.current = null;
    }
  };

  const toggleProMode = () => {
    if (connectionState === ConnectionState.CONNECTED) {
        handleDisconnect();
        setIsProMode(!isProMode);
    } else {
        setIsProMode(!isProMode);
    }
  };

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const cycleVoiceMobile = () => {
    const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
    const currentIndex = voices.indexOf(currentVoice);
    const nextIndex = (currentIndex + 1) % voices.length;
    const nextVoice = voices[nextIndex];
    setCurrentVoice(nextVoice);
    
    // Show notification
    setVoiceNotification(nextVoice);
    setTimeout(() => setVoiceNotification(null), 2000);

    // If connected, reconnect to apply voice
    if (connectionState === ConnectionState.CONNECTED) {
      handleDisconnect().then(() => {
        setTimeout(() => {
           // In a real app, we'd probably auto-reconnect or prompt.
           // For now, user must press mic again.
        }, 500);
      });
    }
  };

  return (
    <div className={`h-full w-full flex overflow-hidden font-sans transition-colors duration-500 ${isDark ? 'dark' : 'light'}`}>
      {/* High Tech Background */}
      <div className="fixed inset-0 z-[-1] bg-[#f8f9fa] dark:bg-[#050505] transition-colors duration-500">
          <div className="absolute inset-0 bg-grid opacity-100"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      <Sidebar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        subscriberCount={subscriberCount}
        subscriberGoal={subscriberGoal}
        onSubscribe={handleSubscribeClick}
        currentVoice={currentVoice}
        setVoice={setCurrentVoice}
        voiceSpeed={voiceSpeed}
        setVoiceSpeed={setVoiceSpeed}
        voicePitch={voicePitch}
        setVoicePitch={setVoicePitch}
      />
      
      <main className="flex-1 flex flex-col relative h-full">
        {/* Mobile Header */}
        <header className="p-4 flex justify-between items-center lg:hidden z-20 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
           <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-md">
                   <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               </div>
               <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">VoiceBot</span>
           </div>
           <div className="flex items-center gap-3">
               <button
                   onClick={cycleVoiceMobile}
                   className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 active:scale-90 transition-transform"
               >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
               </button>
               <button 
                    onClick={toggleTheme}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
               >
                    {isDark ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
               </button>
               <div className={`w-2 h-2 rounded-full ${
                   connectionState === ConnectionState.CONNECTED ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 
                   connectionState === ConnectionState.ERROR ? 'bg-red-500' : 'bg-gray-400'
               }`}></div>
           </div>
        </header>

        {/* Notification Banner */}
        {showBanner && (
             <div className="absolute top-20 lg:top-6 left-1/2 transform -translate-x-1/2 z-50 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center gap-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-full pl-4 pr-2 py-1.5 shadow-2xl shadow-black/20">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            Goal: {formatNumber(subscriberGoal)} Subs
                        </span>
                    </div>
                    <button 
                        onClick={handleSubscribeClick}
                        className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full transition-colors"
                    >
                        Subscribe
                    </button>
                    <button 
                        onClick={() => setShowBanner(false)}
                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
             </div>
        )}

        {/* Voice Change Notification Toast */}
        {voiceNotification && (
            <div className="absolute top-32 lg:top-20 left-1/2 transform -translate-x-1/2 z-50 animate-[fadeIn_0.3s_ease-out]">
                <div className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full shadow-xl flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <span className="text-xs font-bold uppercase tracking-wider">Voice: {voiceNotification}</span>
                </div>
            </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
           
           {/* Messages Container */}
           <div className="absolute inset-x-0 top-0 bottom-60 md:bottom-48 overflow-y-auto p-6 space-y-6 z-0 scroll-smooth" ref={scrollRef}>
              {messages.length === 0 && connectionState === ConnectionState.DISCONNECTED && (
                  <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-20">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.3)] animate-float">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight">VoiceBot</h2>
                      <p className="max-w-md text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                          Advanced ecosystem assistant powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 font-semibold">Gemini 2.5 Live</span>.
                          Ready to assist with code, productivity, and more.
                      </p>
                  </div>
              )}
              {messages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[65%] px-6 py-4 shadow-sm ${
                          msg.role === 'user' 
                          ? 'bg-[#222] dark:bg-white text-white dark:text-black rounded-[2rem] rounded-tr-sm' 
                          : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-[2rem] rounded-tl-sm shadow-sm'
                      }`}>
                          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                  </div>
              ))}
           </div>

           {/* Bottom Dock */}
           <div className="absolute bottom-0 inset-x-0 h-60 md:h-48 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-black dark:via-black/95 z-10 pointer-events-none">
                
                <div className="w-full h-full relative pointer-events-auto flex flex-col justify-end pb-8 lg:pb-10">
                    
                    {/* Mobile: Goal Widget */}
                    <div className="lg:hidden flex justify-center mb-6 px-6">
                        <div className="w-full max-w-[300px] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-xl shadow-black/10">
                            <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-lg shadow-red-600/20">
                                {Math.round(progressPercentage)}%
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold mb-1">
                                    <span>Goal Progress</span>
                                    <span>{formatNumber(subscriberCount)} / {formatNumber(subscriberGoal)}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-orange-500 to-red-600 h-full rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile: Corner Links */}
                    <div className="lg:hidden absolute bottom-8 left-6 flex flex-col-reverse gap-3">
                        {socialLinks.slice(0, 3).map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noreferrer" 
                               className="w-10 h-10 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-lg">
                                <span className="text-sm">{link.icon}</span>
                            </a>
                        ))}
                    </div>
                    <div className="lg:hidden absolute bottom-8 right-6 flex flex-col-reverse gap-3">
                        {otherLinks.slice(0, 3).map((link, i) => (
                             <a key={i} href={link.url} target="_blank" rel="noreferrer" 
                               className="w-10 h-10 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-lg">
                                <span className="text-sm">{link.icon}</span>
                            </a>
                        ))}
                    </div>

                    {/* Main Controller */}
                    <div className="flex items-center justify-center gap-8 md:gap-12 px-4">
                        {/* Pro Mode */}
                        <button 
                            onClick={toggleProMode}
                            className={`flex flex-col items-center gap-2 transition-all ${isProMode ? 'text-amber-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                        >
                            <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isProMode ? 'bg-amber-500/20 border-amber-500' : 'bg-gray-200 dark:bg-white/5 border-transparent'} border`}>
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-current shadow-sm transform transition-transform duration-300 ${isProMode ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <span className="text-[10px] font-bold tracking-widest uppercase">Pro Mode</span>
                        </button>

                        {/* Mic Button */}
                        <div className="relative group">
                            <button 
                                onClick={connectionState === ConnectionState.CONNECTED ? handleDisconnect : handleConnect}
                                disabled={connectionState === ConnectionState.CONNECTING}
                                className={`relative z-10 w-20 h-20 rounded-3xl rotate-3 flex items-center justify-center transition-all duration-300 transform hover:rotate-0 hover:scale-105 focus:outline-none shadow-2xl
                                    ${connectionState === ConnectionState.CONNECTED 
                                        ? 'bg-gradient-to-br from-red-500 to-purple-600 shadow-purple-500/30 text-white' 
                                        : 'bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 text-gray-400 hover:text-orange-500 dark:hover:text-orange-400'
                                    }`}
                            >
                                <div className="transform -rotate-3 group-hover:rotate-0 transition-transform">
                                     <AudioVisualizer isActive={connectionState === ConnectionState.CONNECTED} isDark={isDark} />
                                </div>
                            </button>
                        </div>

                        {/* Status */}
                        <div className="w-12 flex flex-col items-center gap-2 opacity-60">
                            <div className={`w-3 h-3 rounded-full ${
                                connectionState === ConnectionState.CONNECTED ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 
                                connectionState === ConnectionState.CONNECTING ? 'bg-amber-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-700'
                            }`}></div>
                            <span className="text-[10px] font-bold tracking-widest uppercase">{connectionState === 'CONNECTED' ? 'ON' : 'OFF'}</span>
                        </div>
                    </div>
                </div>
           </div>

        </div>
        
        {error && (
            <div className="absolute top-24 left-6 right-6 md:w-auto md:left-1/2 md:transform md:-translate-x-1/2 bg-red-500/10 border border-red-500/50 backdrop-blur-xl text-red-600 dark:text-red-400 px-6 py-3 rounded-2xl shadow-2xl z-50 text-sm text-center font-medium animate-pulse">
                {error}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
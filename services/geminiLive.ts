import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../types";
import { float32ToPCM16, base64ToArrayBuffer, arrayBufferToBase64 } from "../utils/audioUtils";

export class GeminiLiveService {
    private ai: GoogleGenAI;
    private session: any = null;
    private inputAudioContext: AudioContext | null = null;
    private outputAudioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private processor: ScriptProcessorNode | null = null;
    private nextStartTime = 0;
    private onMessageCallback: (text: string, isUser: boolean) => void;
    private onStatusChange: (status: string) => void;
    
    // Voice Changer Config
    private playbackRate = 1.0;
    private pitchDetune = 0;

    constructor(
        apiKey: string, 
        onMessage: (text: string, isUser: boolean) => void,
        onStatus: (status: string) => void
    ) {
        this.ai = new GoogleGenAI({ apiKey });
        this.onMessageCallback = onMessage;
        this.onStatusChange = onStatus;
    }

    setPlaybackConfig(rate: number, pitch: number) {
        this.playbackRate = rate;
        this.pitchDetune = pitch;
    }

    async connect(isProMode: boolean, voiceName: string = 'Kore') {
        try {
            this.onStatusChange("CONNECTING");
            
            // Setup Audio Contexts
            this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            // Get Microphone Access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const modelId = 'gemini-2.5-flash-native-audio-preview-09-2025';
            const config = {
                responseModalities: [Modality.AUDIO],
                systemInstruction: isProMode ? SYSTEM_INSTRUCTION + "\nPRO MODE ENABLED." : SYSTEM_INSTRUCTION,
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            };

            // Connect to Live API
            const sessionPromise = this.ai.live.connect({
                model: modelId,
                config,
                callbacks: {
                    onopen: () => {
                        this.onStatusChange("CONNECTED");
                        this.startAudioInput(sessionPromise);
                    },
                    onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
                    onclose: () => this.onStatusChange("DISCONNECTED"),
                    onerror: (err) => {
                        console.error("Gemini API Error:", err);
                        this.onStatusChange("ERROR");
                    }
                }
            });

            this.session = await sessionPromise;

        } catch (error) {
            console.error("Connection failed:", error);
            this.onStatusChange("ERROR");
        }
    }

    private startAudioInput(sessionPromise: Promise<any>) {
        if (!this.inputAudioContext || !this.mediaStream) return;

        const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
        this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert to PCM 16-bit Little Endian
            const pcm16 = float32ToPCM16(inputData);
            const base64 = arrayBufferToBase64(pcm16);

            sessionPromise.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: "audio/pcm;rate=16000",
                        data: base64
                    }
                });
            }).catch(e => console.error("Failed to send audio:", e));
        };

        source.connect(this.processor);
        this.processor.connect(this.inputAudioContext.destination);
    }

    private async handleMessage(message: LiveServerMessage) {
        // Handle Transcriptions
        if (message.serverContent?.inputTranscription?.text) {
            this.onMessageCallback(message.serverContent.inputTranscription.text, true);
        }
        if (message.serverContent?.outputTranscription?.text) {
             this.onMessageCallback(message.serverContent.outputTranscription.text, false);
        }
        
        if (message.serverContent?.turnComplete) {
           // Turn completed
        }

        // Handle Audio Output
        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData && this.outputAudioContext) {
            try {
                const buffer = base64ToArrayBuffer(audioData);
                const audioBuffer = await this.decodeAudioData(buffer, 24000);
                this.playAudio(audioBuffer);
            } catch (e) {
                console.error("Error decoding audio", e);
            }
        }
    }

    private async decodeAudioData(data: ArrayBuffer, sampleRate: number): Promise<AudioBuffer> {
        if (!this.outputAudioContext) throw new Error("No output context");
        
        // Simple PCM 16 decode
        const data16 = new Int16Array(data);
        const float32 = new Float32Array(data16.length);
        for (let i = 0; i < data16.length; i++) {
            float32[i] = data16[i] / 32768.0;
        }

        const audioBuffer = this.outputAudioContext.createBuffer(1, float32.length, sampleRate);
        audioBuffer.getChannelData(0).set(float32);
        return audioBuffer;
    }

    private playAudio(buffer: AudioBuffer) {
        if (!this.outputAudioContext) return;

        const currentTime = this.outputAudioContext.currentTime;
        if (this.nextStartTime < currentTime) {
            this.nextStartTime = currentTime;
        }

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = buffer;
        
        // Apply Voice Changer Effects with safety clamping
        const safeRate = Math.max(0.1, Math.min(4.0, this.playbackRate));
        source.playbackRate.value = safeRate;
        source.detune.value = this.pitchDetune;

        source.connect(this.outputAudioContext.destination);
        source.start(this.nextStartTime);
        
        // Calculate effective duration based on speed/pitch changes
        const effectiveRate = safeRate * Math.pow(2, this.pitchDetune / 1200);
        
        this.nextStartTime += buffer.duration / effectiveRate;
    }

    async disconnect() {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.inputAudioContext) {
            await this.inputAudioContext.close();
            this.inputAudioContext = null;
        }
        if (this.outputAudioContext) {
            await this.outputAudioContext.close();
            this.outputAudioContext = null;
        }
        this.onStatusChange("DISCONNECTED");
    }
}
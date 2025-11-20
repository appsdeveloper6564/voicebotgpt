export const float32ToPCM16 = (float32: Float32Array): ArrayBuffer => {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16.buffer;
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export const decodeAudioData = async (
    audioData: ArrayBuffer,
    sampleRate: number
): Promise<AudioBuffer> => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate,
    });
    // For raw PCM, we need to manually put it into a buffer
    // Assuming 16-bit PCM Little Endian
    const data16 = new Int16Array(audioData);
    const float32 = new Float32Array(data16.length);
    for(let i=0; i<data16.length; i++) {
        float32[i] = data16[i] / 32768.0;
    }
    
    const audioBuffer = audioCtx.createBuffer(1, float32.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32);
    
    audioCtx.close();
    return audioBuffer;
};


import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mic2, 
  Play, 
  Pause, 
  Download, 
  Loader2, 
  Volume2, 
  Sparkles,
  ChevronRight,
  ArrowRight,
  Music,
  Waves
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

const voices = [
  { id: 'Kore', name: 'فهـد', style: 'حماسي / إعلاني', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fahad' },
  { id: 'Zephyr', name: 'سـارة', style: 'ناعم / هادئ', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: 'Puck', name: 'نـورة', style: 'ودي / مشرق', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noura' },
  { id: 'Charon', name: 'فيصـل', style: 'فخم / رسمي', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Faisal' },
  { id: 'Fenrir', name: 'مشـاري', style: 'قوي / واثق', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mishari' },
];

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceoverStudio: React.FC = () => {
  const { t, lang, profile } = useApp();
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [base64Audio, setBase64Audio] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const generateAudio = async () => {
    if (!script) return;
    setIsGenerating(true);
    setAudioBuffer(null);
    setBase64Audio(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: script }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
          systemInstruction: `You are generating a voiceover for ${profile.storeName}. This brand is professional and uses a corporate identity of ${profile.primaryColor}. Adjust the tone to be consistent with this brand image.`
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        setBase64Audio(audioData);
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const decodedBuffer = await decodeAudioData(
          decode(audioData),
          audioContextRef.current,
          24000,
          1
        );
        setAudioBuffer(decodedBuffer);
      }
    } catch (error) {
      console.error(error);
      alert('Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
    } else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
    if (!base64Audio) return;
    const blob = new Blob([decode(base64Audio)], { type: 'audio/pcm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const voiceNameDisplay = voices.find(v => v.id === selectedVoice)?.name;
    a.download = `تعليق-صوتي-${voiceNameDisplay}.pcm`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/40 mb-2">
           <Mic2 size={14} /> AI Voice Engine
        </div>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">{t.voiceoverTitle}</h2>
        <p className="text-slate-500 dark:text-gray-400 font-bold max-w-2xl mx-auto text-lg">{t.voiceoverSubTitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] border-2 dark:border-gray-700 shadow-xl space-y-6">
              <h3 className="text-xl font-black flex items-center gap-2">
                 <Volume2 className="text-indigo-600" size={20} />
                 {t.selectVoice}
              </h3>
              <div className="space-y-3">
                 {voices.map((voice) => (
                   <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${selectedVoice === voice.id ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-700 hover:border-indigo-200'}`}
                   >
                     <img src={voice.avatar} className="w-12 h-12 rounded-xl bg-white/10 p-1" alt={voice.name} />
                     <div className="text-right">
                        <p className="font-black text-sm">{voice.name}</p>
                        <p className={`text-[10px] font-bold ${selectedVoice === voice.id ? 'text-indigo-400' : 'text-slate-400'}`}>{voice.style}</p>
                     </div>
                   </button>
                 ))}
              </div>
           </div>

           {/* Brand Context Indicator */}
           <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl space-y-4 relative overflow-hidden group border border-white/10">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: profile.primaryColor }}></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">{profile.storeName} ID</span>
              </div>
              <h4 className="text-xl font-black">{lang === 'ar' ? 'تعليق متوافق مع البراند' : 'Brand-Synced Voiceover'}</h4>
              <p className="text-sm font-bold text-white/60 leading-relaxed">
                 {lang === 'ar' ? 'يتم توجيه الذكاء الاصطناعي لتبني نبرة صوت تعبر عن ألوان وقيم براندك المختارة.' : 'AI is instructed to adopt a tone that reflects your chosen brand colors and values.'}
              </p>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white dark:bg-gray-800 p-10 rounded-[4rem] border-2 dark:border-gray-700 shadow-xl space-y-8">
              <div className="space-y-4">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Music size={14} /> {t.writeScript}
                 </label>
                 <textarea 
                   value={script}
                   onChange={e => setScript(e.target.value)}
                   placeholder={lang === 'ar' ? 'اكتب ما تريد أن يقوله المعلق الصوتي هنا...' : 'Write what you want the voiceover to say here...'}
                   className="w-full h-64 bg-slate-50 dark:bg-gray-900 border-0 rounded-[2.5rem] px-8 py-8 text-xl font-black focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
                 />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                 <button 
                  onClick={generateAudio}
                  disabled={isGenerating || !script}
                  className="flex-1 h-20 gradient-bg text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 disabled:opacity-50 hover:scale-[1.01] active:scale-95 transition-all shadow-xl"
                 >
                    {isGenerating ? <Loader2 className="animate-spin" size={28} /> : <Mic2 size={28} className="fill-white" />}
                    {isGenerating ? t.generating : t.generateVoice}
                 </button>

                 {audioBuffer && (
                   <button 
                    onClick={togglePlay}
                    className="h-20 w-20 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shrink-0"
                   >
                     {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                   </button>
                 )}
              </div>
           </div>

           {audioBuffer && (
             <div className="bg-white dark:bg-gray-800 p-10 rounded-[3.5rem] border-2 dark:border-gray-700 shadow-xl space-y-8 animate-in slide-in-from-bottom-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center">
                         <Waves size={24} />
                      </div>
                      <div>
                         <h4 className="font-black text-lg">{lang === 'ar' ? 'الموجة الصوتية المولدة' : 'Generated Waveform'}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">24.0 kHz • Mono • 32-bit Float</p>
                      </div>
                   </div>
                   <button 
                    onClick={downloadAudio}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-gray-700 rounded-2xl font-black text-sm hover:bg-indigo-600 hover:text-white transition-all"
                   >
                      <Download size={18} />
                      {t.downloadVoice}
                   </button>
                </div>

                <div className="h-24 w-full flex items-center justify-center gap-1">
                   {Array.from({ length: 40 }).map((_, i) => (
                     <div 
                       key={i} 
                       className={`w-1.5 bg-indigo-600/20 rounded-full transition-all duration-300 ${isPlaying ? 'animate-bounce-slow' : 'h-4'}`}
                       style={{ 
                         height: isPlaying ? `${Math.random() * 80 + 20}%` : '15%',
                         animationDelay: `${i * 0.05}s`
                       }}
                     ></div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VoiceoverStudio;

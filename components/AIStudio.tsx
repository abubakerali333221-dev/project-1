
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Image as ImageIcon, Video, Type, Download, Share2, Loader2, ArrowLeft, Home, Mic2, Play, Pause, Waves, Volume2, Edit3, Key, AlertTriangle } from 'lucide-react';
import { generateMarketingCopy, generateMarketingImage, generateMarketingVideo } from '../services/gemini';
import { GoogleGenAI, Modality } from "@google/genai";

interface AIStudioProps {
  initialEventId?: string;
  onResetPreselection?: () => void;
}

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

const AIStudio: React.FC<AIStudioProps> = ({ initialEventId, onResetPreselection }) => {
  const { t, lang, profile, events, addContent, setActiveTab } = useApp();
  const [activeTabLocal, setActiveTabLocal] = useState<'image' | 'video' | 'copy' | 'voiceover'>('image');
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(initialEventId || events[0]?.id);
  const [customEventText, setCustomEventText] = useState('');
  const [tone, setTone] = useState('tonePersuasive');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [result, setResult] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false); // البداية تكون false لمنع الاتصال التلقائي
  
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [base64Audio, setBase64Audio] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (initialEventId) {
      setSelectedEvent(initialEventId);
    }
  }, [initialEventId]);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Key selection error", e);
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setAudioBuffer(null);
    setBase64Audio(null);
    setIsPlaying(false);

    try {
      const eventObj = events.find(e => e.id === selectedEvent);
      const eventTitle = customEventText.trim() !== '' ? customEventText : (eventObj ? eventObj.title[lang] : '');

      if (activeTabLocal === 'copy') {
        const text = await generateMarketingCopy({
          storeName: profile.storeName || t.placeholderStore,
          businessType: profile.businessType,
          event: eventTitle,
          tone: t[tone as keyof typeof t] || tone,
          lang,
          primaryColor: profile.primaryColor,
          secondaryColor: profile.secondaryColor1
        });
        setResult(text || 'Error');
        addContent({ id: Date.now().toString(), type: 'copy', text: text || '', createdAt: new Date().toISOString() });
      } else if (activeTabLocal === 'image') {
        const prompt = t.promptIdea
          .replace('{event}', eventTitle)
          .replace('{store}', profile.storeName || t.placeholderStore)
          .replace('{type}', profile.businessType);
        
        const url = await generateMarketingImage({
          prompt,
          primaryColor: profile.primaryColor,
          secondaryColor1: profile.secondaryColor1,
          secondaryColor2: profile.secondaryColor2
        });
        
        setResult(url);
        addContent({ id: Date.now().toString(), type: 'image', url: url || '', createdAt: new Date().toISOString() });
      } else if (activeTabLocal === 'video') {
        const prompt = t.videoPrompt
          .replace('{event}', eventTitle)
          .replace('{store}', profile.storeName || t.placeholderStore);
        
        const url = await generateMarketingVideo({
          prompt,
          primaryColor: profile.primaryColor,
          secondaryColor: profile.secondaryColor1
        });
        
        setResult(url);
        addContent({ id: Date.now().toString(), type: 'video', url: url || '', createdAt: new Date().toISOString() });
      } else if (activeTabLocal === 'voiceover') {
        const script = `أهلاً بكم في ${profile.storeName || t.placeholderStore}. بمناسبة ${eventTitle}، نقدم لكم أقوى العروض الحصرية وبجودة تليق بكم. لا تفوتوا الفرصة!`;
        
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
            systemInstruction: `You are the voice of ${profile.storeName}. This brand uses a visual identity of ${profile.primaryColor}. Deliver the script with a tone that matches this professional identity.`
          },
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
          setBase64Audio(audioData);
          setResult('AUDIO_READY');
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const decodedBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
          setAudioBuffer(decodedBuffer);
          const voiceNameDisplay = voices.find(v => v.id === selectedVoice)?.name;
          addContent({ id: Date.now().toString(), type: 'copy', text: `تعليق صوتي: ${voiceNameDisplay} لمناسبة ${eventTitle}`, createdAt: new Date().toISOString() });
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes("Requested entity was not found")) {
         handleSelectKey();
      } else {
         alert('Generation failed. Please ensure your API key is active.');
      }
    } finally {
      setLoading(false);
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
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {!hasKey && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center">
                 <AlertTriangle size={24} />
              </div>
              <div className="text-start">
                 <p className="font-black text-rose-900 dark:text-rose-400">{lang === 'ar' ? 'مفتاح الـ API غير نشط' : 'API Key Inactive'}</p>
                 <p className="text-xs font-bold text-rose-600/70">{lang === 'ar' ? 'يرجى تفعيل المفتاح لتتمكن من استخدام ميزات الذكاء الاصطناعي.' : 'Please activate the key to enable AI features.'}</p>
              </div>
           </div>
           <button 
             onClick={handleSelectKey}
             className="px-8 py-3 bg-rose-500 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-rose-600 transition-all flex items-center gap-2"
           >
             <Key size={16} /> {lang === 'ar' ? 'تفعيل الآن' : 'Activate Now'}
           </button>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl text-slate-500 hover:text-indigo-600 font-bold transition-all border dark:border-gray-700 shadow-sm group"
        >
          <ArrowLeft size={18} className={`transition-transform group-hover:scale-110 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span>{lang === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}</span>
        </button>
        
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
           <Home size={12} />
           <span>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
           <span className="opacity-30">/</span>
           <span className="text-indigo-500">{t.aiStudio}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 flex flex-wrap gap-1 shadow-sm border dark:border-gray-700 rounded-3xl">
        {[
          { id: 'image', label: t.generateImage, icon: ImageIcon },
          { id: 'video', label: t.generateVideo, icon: Video },
          { id: 'copy', label: t.generateCopy, icon: Type },
          { id: 'voiceover', label: t.voiceover, icon: Mic2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { 
              setActiveTabLocal(tab.id as any); 
              setResult(null); 
              setAudioBuffer(null); 
            }}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold ${activeTabLocal === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-500'}`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border dark:border-gray-700 shadow-sm space-y-6 h-fit">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: profile.primaryColor }}></div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{lang === 'ar' ? 'متزامن مع الهوية' : 'Identity Synced'}</p>
                <p className="text-[9px] text-slate-400 font-bold">{lang === 'ar' ? 'سيتم استخدام ألوان براندك تلقائياً' : 'Brand colors used automatically'}</p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold block">{t.selectEvent}</label>
              <select 
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  if (onResetPreselection) onResetPreselection();
                }}
                className="w-full bg-slate-50 dark:bg-gray-700 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title[lang]}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <Edit3 size={14} /> {t.customOccasion}
              </label>
              <input 
                type="text"
                value={customEventText}
                onChange={(e) => setCustomEventText(e.target.value)}
                placeholder={lang === 'ar' ? 'مثال: افتتاح الفرع الجديد، عرض العيد الخاص...' : 'e.g. Grand opening, Special Eid sale...'}
                className="w-full bg-slate-50 dark:bg-gray-700 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          {activeTabLocal === 'copy' && (
            <div className="space-y-2">
              <label className="text-sm font-bold block">{t.tone}</label>
              <div className="grid gap-2">
                {['toneProfessional', 'toneFriendly', 'tonePersuasive'].map(tkey => (
                  <button
                    key={tkey}
                    onClick={() => setTone(tkey)}
                    className={`text-sm px-4 py-2 rounded-xl text-start transition-colors ${tone === tkey ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200' : 'bg-slate-50 dark:bg-gray-700 border border-transparent'}`}
                  >
                    {t[tkey as keyof typeof t]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTabLocal === 'voiceover' && (
            <div className="space-y-4">
              <label className="text-sm font-bold block">{t.selectVoice}</label>
              <div className="grid grid-cols-1 gap-2">
                {voices.map(voice => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedVoice === voice.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 dark:bg-gray-700 border-transparent hover:border-indigo-300'}`}
                  >
                    <img src={voice.avatar} className="w-10 h-10 rounded-lg bg-white/10" alt={voice.name} />
                    <div className="text-start">
                      <p className="font-black text-xs">{voice.name}</p>
                      <p className="text-[9px] opacity-70">{voice.style}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 gradient-bg text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 hover:scale-[1.02] transition-transform"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? t.generating : (lang === 'ar' ? 'بدء التحليل والإنشاء' : 'Start AI Generation')}
          </button>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl border dark:border-gray-700 shadow-sm flex flex-col items-center justify-center min-h-[450px]">
          {loading ? (
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={24} />
              </div>
              <p className="font-bold text-slate-500 animate-pulse">{t.generating}</p>
            </div>
          ) : result ? (
            <div className="w-full space-y-6">
              <div className="rounded-2xl overflow-hidden border dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
                {activeTabLocal === 'image' && <img src={result} className="w-full max-h-[500px] object-contain" alt="Result" />}
                {activeTabLocal === 'video' && <video src={result} controls className="w-full max-h-[500px]" />}
                {activeTabLocal === 'copy' && <div className="p-8 whitespace-pre-wrap text-lg leading-relaxed">{result}</div>}
                {activeTabLocal === 'voiceover' && audioBuffer && (
                  <div className="p-12 space-y-8 flex flex-col items-center">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={togglePlay}
                        className="w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                      >
                        {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
                      </button>
                      <div className="space-y-1">
                        <h4 className="font-black text-xl">{lang === 'ar' ? 'الملف الصوتي جاهز' : 'Audio Ready'}</h4>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{voices.find(v => v.id === selectedVoice)?.name} • 24kHz</p>
                      </div>
                    </div>
                    
                    <div className="h-20 w-full flex items-center justify-center gap-1.5 px-4">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 bg-indigo-600 rounded-full transition-all duration-300 ${isPlaying ? 'opacity-100' : 'opacity-20 h-3'}`}
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
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    if (activeTabLocal === 'voiceover') downloadAudio();
                    else window.open(result!, '_blank');
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                  <Download size={20} />
                  {t.download}
                </button>
                <button className="px-6 py-3 border border-slate-200 dark:border-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-gray-700">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 max-w-xs">
              <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Sparkles size={32} />
              </div>
              <p className="text-slate-500 dark:text-gray-400 font-medium">
                {initialEventId 
                  ? (lang === 'ar' ? `تم اختيار المناسبة بنجاح، اختر نوع المحتوى ثم اضغط على زر "بدء الإنشاء".` : `Event selected! Choose content type and click "Start Generation".`)
                  : (lang === 'ar' ? 'ابدأ الآن واختر ما ترغب في إنشائه للمناسبة القادمة!' : 'Start now and select what you want to create for the next occasion!')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStudio;


import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  Globe, 
  Zap, 
  BarChart, 
  ShieldAlert, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Smartphone,
  Layout,
  Cpu,
  TrendingUp,
  Search as SearchIcon,
  // Fix: Added missing ArrowRight icon import
  ArrowRight
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const ProgressBar: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center px-1">
      <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-black ${color.replace('bg-', 'text-')}`}>{value}%</span>
    </div>
    <div className="h-3 w-full bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
      <div 
        className={`h-full ${color} transition-all duration-1000 ease-out shadow-lg`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const MiniGauge: React.FC<{ value: number; label: string; icon: any }> = ({ value, label, icon: Icon }) => (
  <div className="bg-slate-50 dark:bg-gray-900/50 p-6 rounded-3xl border dark:border-gray-700 flex flex-col items-center gap-3 group hover:border-indigo-500 transition-all">
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200 dark:text-gray-800" />
        <circle 
          cx="40" 
          cy="40" 
          r="35" 
          stroke="currentColor" 
          strokeWidth="6" 
          fill="transparent" 
          strokeDasharray={220} 
          strokeDashoffset={220 - (value / 100) * 220} 
          className="text-indigo-600 transition-all duration-1000" 
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={20} className="text-indigo-600" />
      </div>
    </div>
    <div className="text-center">
      <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-black">{value}%</p>
    </div>
  </div>
);

const StoreAudit: React.FC = () => {
  const { t, lang } = useApp();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  const performAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsAnalyzing(true);
    setReport(null);

    try {
      // Fix: Initializing GoogleGenAI client instance with named parameter apiKey.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Perform a technical SEO and performance audit for: ${url}. 
      You must return a JSON object with strictly these keys:
      - performance: { load_speed: number, mobile_resp: number, code_health: number }
      - seo: { meta_tags: number, indexing: number, backlinks: number }
      - ux: { navigation: number, content_quality: number }
      - recommendations: array of { title: string, impact: number, category: string }
      Scores are 0-100. Recommendations should be in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

      // Fix: Using ai.models.generateContent to query GenAI with model and prompt.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              performance: {
                type: Type.OBJECT,
                properties: {
                  load_speed: { type: Type.NUMBER },
                  mobile_resp: { type: Type.NUMBER },
                  code_health: { type: Type.NUMBER }
                }
              },
              seo: {
                type: Type.OBJECT,
                properties: {
                  meta_tags: { type: Type.NUMBER },
                  indexing: { type: Type.NUMBER },
                  backlinks: { type: Type.NUMBER }
                }
              },
              ux: {
                type: Type.OBJECT,
                properties: {
                  navigation: { type: Type.NUMBER },
                  content_quality: { type: Type.NUMBER }
                }
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    impact: { type: Type.NUMBER },
                    category: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      // Fix: Accessing the .text property on GenerateContentResponse to get the string output.
      const data = JSON.parse(response.text);
      setReport(data);
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please ensure the URL is valid.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/40 mb-2">
           <Activity size={14} /> AI Technical Scan
        </div>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">{t.auditTitle}</h2>
        <p className="text-slate-500 dark:text-gray-400 font-bold max-w-2xl mx-auto text-lg">{t.auditSubTitle}</p>
      </div>

      {/* URL Input */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-[3rem] shadow-2xl border-4 border-indigo-500/10 group focus-within:border-indigo-500/30 transition-all">
        <form onSubmit={performAudit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Globe className="absolute left-8 top-1/2 -translate-y-1/2 text-indigo-600" size={28} />
            <input 
              type="url" 
              required
              placeholder="https://yourstore.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full h-20 bg-slate-50 dark:bg-gray-900 border-0 rounded-[2.5rem] px-20 text-xl font-black focus:ring-0 placeholder:text-slate-300"
            />
          </div>
          <button 
            type="submit"
            disabled={isAnalyzing}
            className="h-20 px-14 gradient-bg text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={28} /> : <Zap size={28} className="fill-white" />}
            {isAnalyzing ? t.analyzing : t.analyzeNow}
          </button>
        </form>
      </div>

      {/* Analyzing View */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-800 p-20 rounded-[4rem] border-2 dark:border-gray-700 shadow-2xl flex flex-col items-center justify-center space-y-8 animate-pulse">
          <div className="relative">
             <div className="w-32 h-32 border-[12px] border-indigo-50 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Activity className="text-indigo-600" size={48} />
             </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black">{t.analyzing}</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em]">{lang === 'ar' ? 'جاري استخراج البيانات البصرية والتقنية...' : 'Extracting visual & technical data...'}</p>
          </div>
        </div>
      )}

      {/* Visual Report View */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-12 duration-1000">
          
          {/* Main Performance Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[3.5rem] border-2 dark:border-gray-700 shadow-xl space-y-12">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <BarChart size={32} />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black">{t.performance}</h3>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Technical Performance Grid</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <span className="text-5xl font-black text-indigo-600">
                       {Math.round((report.performance.load_speed + report.performance.mobile_resp + report.performance.code_health) / 3)}%
                     </span>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MiniGauge value={report.performance.load_speed} label={lang === 'ar' ? 'سرعة التحميل' : 'LOAD SPEED'} icon={Zap} />
                  <MiniGauge value={report.performance.mobile_resp} label={lang === 'ar' ? 'تجاوب الجوال' : 'MOBILE RESP'} icon={Smartphone} />
                  <MiniGauge value={report.performance.code_health} label={lang === 'ar' ? 'صحة الكود' : 'CODE HEALTH'} icon={Cpu} />
               </div>

               <div className="space-y-8 pt-6 border-t dark:border-gray-700">
                  <h4 className="text-lg font-black flex items-center gap-3">
                     <TrendingUp className="text-indigo-600" />
                     {lang === 'ar' ? 'تحليل عميق للسيو والزيارات' : 'Deep SEO & Traffic Analysis'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                     <ProgressBar value={report.seo.meta_tags} label={lang === 'ar' ? 'تحسين الوسوم (Meta Tags)' : 'Meta Tags Optimization'} color="bg-indigo-600" />
                     <ProgressBar value={report.seo.indexing} label={lang === 'ar' ? 'سرعة الأرشفة' : 'Indexing Efficiency'} color="bg-purple-600" />
                     <ProgressBar value={report.ux.navigation} label={lang === 'ar' ? 'سهولة التصفح' : 'UX Navigation'} color="bg-emerald-500" />
                     <ProgressBar value={report.ux.content_quality} label={lang === 'ar' ? 'جودة المحتوى' : 'Content Quality'} color="bg-amber-500" />
                  </div>
               </div>
            </div>

            {/* AI Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {report.recommendations.map((rec: any, idx: number) => (
                 <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 dark:border-gray-700 shadow-lg group hover:-translate-y-2 transition-all">
                    <div className="flex items-center justify-between mb-6">
                       <div className="px-3 py-1 bg-slate-100 dark:bg-gray-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {rec.category}
                       </div>
                       <div className={`w-3 h-3 rounded-full ${rec.impact > 80 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    </div>
                    <h4 className="text-xl font-black mb-4 leading-tight">{rec.title}</h4>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                          <span>{lang === 'ar' ? 'الأثر المتوقع' : 'Estimated Impact'}</span>
                          <span>{rec.impact}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600" style={{ width: `${rec.impact}%` }}></div>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Side Issues Column */}
          <div className="space-y-8">
             <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex items-center gap-4">
                   <ShieldAlert className="text-rose-500" size={32} />
                   <h3 className="text-2xl font-black">{t.issuesFound}</h3>
                </div>

                <div className="space-y-4">
                   {[
                     { score: report.seo.meta_tags, label: lang === 'ar' ? 'أخطاء السيو' : 'SEO Errors', color: 'rose' },
                     { score: report.performance.load_speed, label: lang === 'ar' ? 'بطء الاستجابة' : 'Response Delay', color: 'amber' },
                     { score: report.ux.navigation, label: lang === 'ar' ? 'تجربة المستخدم' : 'UX Friction', color: 'indigo' }
                   ].map((issue, idx) => (
                     <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between">
                        <div>
                           <p className="text-xs font-black uppercase tracking-widest text-white/50 mb-1">{issue.label}</p>
                           <p className="text-lg font-black">{100 - issue.score}% Conflict</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full bg-${issue.color}-500 shadow-[0_0_15px_rgba(255,255,255,0.2)]`}></div>
                     </div>
                   ))}
                </div>

                <div className="pt-8 border-t border-white/10 space-y-4">
                   <div className="flex items-center gap-3 text-indigo-400 font-black">
                      <AlertCircle size={24} />
                      <span className="text-lg">{lang === 'ar' ? 'خلاصة التحليل' : 'Executive Summary'}</span>
                   </div>
                   <p className="text-sm font-bold text-white/60 leading-relaxed">
                      {lang === 'ar' 
                        ? `بناءً على الرسوم البيانية، متجرك يحتاج تدخل فوري في جانب ${report.performance.load_speed < 70 ? 'السرعة' : 'السيو'}. التعديلات المقترحة قد ترفع الزيارات بنسبة ٣٥٪.` 
                        : `Based on charts, your store needs immediate action on ${report.performance.load_speed < 70 ? 'Speed' : 'SEO'}. The suggested fixes could boost traffic by 35%.`}
                   </p>
                   <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 group">
                      {lang === 'ar' ? 'تحميل التقرير البصري' : 'Download Visual Report'}
                      <ArrowRight size={18} className={`transition-transform group-hover:translate-x-1 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                   </button>
                </div>
             </div>

             <div className="bg-indigo-600 text-white p-8 rounded-[3rem] shadow-xl text-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                   <CheckCircle size={32} />
                </div>
                <h4 className="text-xl font-black">{lang === 'ar' ? 'جاهز للتطوير؟' : 'Ready to Grow?'}</h4>
                <p className="text-sm font-bold text-indigo-100 opacity-80 leading-relaxed">
                   {lang === 'ar' ? 'استخدم ستوديو الذكاء الاصطناعي لإنشاء محتوى يعالج هذه المشاكل فوراً.' : 'Use AI Studio to create content that addresses these issues instantly.'}
                </p>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default StoreAudit;

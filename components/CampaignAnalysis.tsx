
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  DollarSign, 
  MousePointer2, 
  PieChart, 
  Upload, 
  Activity, 
  CheckCircle, 
  Loader2, 
  Instagram, 
  Facebook, 
  MessageSquare,
  ArrowRight,
  TrendingDown,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileCode,
  X
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const MetricGauge: React.FC<{ value: number; label: string; icon: any; unit?: string; description?: string }> = ({ value, label, icon: Icon, unit = "", description = "" }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 dark:border-gray-700 shadow-xl space-y-4 hover:border-indigo-500 transition-all group">
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className="text-3xl font-black">{value}{unit}</p>
      </div>
    </div>
    <div className="h-2 w-full bg-slate-50 dark:bg-gray-900 rounded-full overflow-hidden">
      <div 
        className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000"
        style={{ width: `${Math.min(value * 10, 100)}%` }}
      ></div>
    </div>
    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const CampaignAnalysis: React.FC = () => {
  const { t, lang } = useApp();
  const [platform, setPlatform] = useState('Instagram');
  const [dataInput, setDataInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataInput && !selectedFile) return;

    setIsAnalyzing(true);
    setReport(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let contents: any = { parts: [] };
      let promptText = `Analyze this marketing campaign for ${platform}. 
      Return a JSON object with:
      - metrics: { roas: number, ctr: number, cpc: number, spend: number, conversions: number }
      - insights: array of { text: string, type: 'positive' | 'negative' }
      - next_steps: array of string suggestions.
      Translate text and descriptions to ${lang === 'ar' ? 'Arabic' : 'English'}. 
      ROAS as multiplier (e.g. 4.5), Spend and CPC as numbers.`;

      if (dataInput) {
        promptText += ` \n Manual Data: ${dataInput}`;
      }

      contents.parts.push({ text: promptText });

      if (selectedFile) {
        const base64Data = await fileToBase64(selectedFile);
        contents.parts.push({
          inlineData: {
            data: base64Data,
            mimeType: selectedFile.type || 'application/octet-stream'
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // استخدام Pro للمهام المعقدة ومعالجة الملفات
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              metrics: {
                type: Type.OBJECT,
                properties: {
                  roas: { type: Type.NUMBER },
                  ctr: { type: Type.NUMBER },
                  cpc: { type: Type.NUMBER },
                  spend: { type: Type.NUMBER },
                  conversions: { type: Type.NUMBER }
                }
              },
              insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    type: { type: Type.STRING }
                  }
                }
              },
              next_steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      setReport(JSON.parse(response.text));
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please check your data/file and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const platforms = [
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'TikTok', icon: MessageSquare, color: 'text-black dark:text-white' },
    { name: 'Snapchat', icon: PieChart, color: 'text-yellow-500' },
    { name: 'Google Ads', icon: Target, color: 'text-indigo-600' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/40 mb-2">
           <BarChart3 size={14} /> AI Performance Hub
        </div>
        <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">{t.analysisTitle}</h2>
        <p className="text-slate-500 dark:text-gray-400 font-bold max-w-2xl mx-auto text-lg">{t.analysisSubTitle}</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 p-10 rounded-[3.5rem] border-2 dark:border-gray-700 shadow-xl space-y-10">
        
        {/* Platform Selection */}
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2">
             <Target size={14} /> {t.selectPlatform}
          </label>
          <div className="flex flex-wrap gap-3">
            {platforms.map(p => (
              <button
                key={p.name}
                onClick={() => setPlatform(p.name)}
                className={`px-6 py-4 rounded-2xl font-black text-xs transition-all flex items-center gap-2 border-2 ${platform === p.name ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' : 'bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-700 text-slate-500'}`}
              >
                <p.icon size={18} className={platform === p.name ? 'text-white' : p.color} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* File Upload Zone */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2">
               <Upload size={14} /> {t.uploadReport}
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative h-56 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all
                ${selectedFile ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600 bg-slate-50 dark:bg-gray-900'}
              `}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg"
              />
              
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg text-indigo-600">
                    {selectedFile.type.includes('image') ? <ImageIcon size={32} /> : 
                     selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') ? <FileSpreadsheet size={32} /> : 
                     <FileText size={32} />}
                  </div>
                  <p className="text-sm font-black text-indigo-600 truncate max-w-[200px]">{selectedFile.name}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md text-rose-500 hover:scale-110 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-md text-slate-400 group-hover:text-indigo-500 transition-colors">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-600 dark:text-gray-300">{lang === 'ar' ? 'اضغط أو اسحب الملف هنا' : 'Click or drag file here'}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{t.supportedFormats}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2">
               <FileCode size={14} /> {t.manualEntry}
            </label>
            <textarea 
              value={dataInput}
              onChange={e => setDataInput(e.target.value)}
              placeholder={lang === 'ar' ? 'انسخ بيانات الحملة هنا... (مثال: صرفت 1000 ريال وجبت 50 مبيعة بمجموع 5000 ريال)' : 'Paste campaign data here... (e.g. Spent $1000, 50 sales, total $5000)'}
              className="w-full h-56 bg-slate-50 dark:bg-gray-900 border-0 rounded-[2.5rem] px-8 py-6 text-sm font-bold focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner"
            />
          </div>
        </div>

        <button 
          onClick={handleAnalysis}
          disabled={isAnalyzing || (!dataInput && !selectedFile)}
          className="w-full h-20 gradient-bg text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 disabled:opacity-50 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-indigo-200 dark:shadow-none"
        >
          {isAnalyzing ? <Loader2 className="animate-spin" size={28} /> : <Activity size={28} className="fill-white" />}
          {isAnalyzing ? t.generating : t.startAnalysis}
        </button>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-gray-800 p-20 rounded-[4rem] border-2 dark:border-gray-700 shadow-2xl flex flex-col items-center justify-center space-y-8 animate-pulse">
          <div className="relative">
             <div className="w-32 h-32 border-[12px] border-indigo-50 dark:border-gray-700 border-t-indigo-600 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="text-indigo-600" size={48} />
             </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-black">{lang === 'ar' ? 'جاري تحليل المستندات والبيانات...' : 'Analyzing Documents & Data...'}</h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em]">{lang === 'ar' ? 'الذكاء الاصطناعي يستخرج الرؤى الآن' : 'AI is extracting insights now'}</p>
          </div>
        </div>
      )}

      {/* Report View */}
      {report && (
        <div className="space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricGauge value={report.metrics.roas} label={t.roas} unit="x" icon={TrendingUp} description={lang === 'ar' ? 'معدل العائد المباشر' : 'Direct return multiplier'} />
              <MetricGauge value={report.metrics.ctr} label={t.ctr} unit="%" icon={MousePointer2} description={lang === 'ar' ? 'جاذبية الإعلان للجمهور' : 'Ad appeal to audience'} />
              <MetricGauge value={report.metrics.spend} label={t.adSpend} icon={DollarSign} description={lang === 'ar' ? 'إجمالي الميزانية المصروفة' : 'Total budget spent'} />
              <MetricGauge value={report.metrics.conversions} label={t.conversions} icon={CheckCircle} description={lang === 'ar' ? 'عدد العمليات الناجحة' : 'Successful conversions'} />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-10 rounded-[3.5rem] border-2 dark:border-gray-700 shadow-xl space-y-8">
                 <h4 className="text-2xl font-black flex items-center gap-3">
                    <Activity className="text-indigo-600" />
                    {lang === 'ar' ? 'التحليلات الذكية (AI Insights)' : 'AI Insights'}
                 </h4>
                 
                 <div className="space-y-4">
                    {report.insights.map((insight: any, idx: number) => (
                      <div key={idx} className={`p-6 rounded-3xl border flex items-start gap-4 ${insight.type === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800'}`}>
                         {insight.type === 'positive' ? <TrendingUp className="text-emerald-600 mt-1" /> : <TrendingDown className="text-rose-600 mt-1" />}
                         <div>
                            <p className={`font-black text-sm mb-1 ${insight.type === 'positive' ? 'text-emerald-700' : 'text-rose-700'}`}>
                               {insight.type === 'positive' ? (lang === 'ar' ? 'نقطة قوة' : 'Strength') : (lang === 'ar' ? 'تحدي' : 'Challenge')}
                            </p>
                            <p className="font-bold text-slate-600 dark:text-gray-300">{insight.text}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                 <h4 className="text-2xl font-black flex items-center gap-3">
                    <Target className="text-indigo-400" />
                    {lang === 'ar' ? 'توصيات المرحلة القادمة' : 'Next Steps'}
                 </h4>
                 
                 <div className="space-y-4">
                    {report.next_steps.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 group">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black group-hover:bg-indigo-600 transition-colors">
                            {idx + 1}
                         </div>
                         <p className="font-bold text-sm text-white/80">{step}</p>
                      </div>
                    ))}
                 </div>

                 <div className="pt-8 border-t border-white/10">
                    <button className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 group">
                       {lang === 'ar' ? 'تصميم محتوى حملة جديدة' : 'Design New Campaign Content'}
                       <ArrowRight size={18} className={`transition-transform group-hover:translate-x-1 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CampaignAnalysis;

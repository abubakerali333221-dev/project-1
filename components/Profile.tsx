
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Check, Palette, Upload, Image as ImageIcon, X, Pipette, Hash, Sparkles, Layout, Monitor } from 'lucide-react';
import { BUSINESS_TYPES, SOCIAL_PLATFORMS } from '../constants';
import { convertToBase64, savePortfolioImage } from '../services/firebase';

const CURATED_PALETTES = [
  // National / Traditional
  { primary: '#006C35', s1: '#DAA520', s2: '#F9FAFB', name: 'الوطني التقليدي', category: 'traditional' },
  { primary: '#0A4D3C', s1: '#BFAF80', s2: '#FFFFFF', name: 'رقي الدرعية', category: 'traditional' },
  // Modern / Tech
  { primary: '#6366F1', s1: '#A855F7', s2: '#F43F5E', name: 'المستقبل الذكي', category: 'modern' },
  { primary: '#0F172A', s1: '#3B82F6', s2: '#10B981', name: 'تقني احترافي', category: 'modern' },
  { primary: '#2563EB', s1: '#7C3AED', s2: '#DB2777', name: 'نيون عصري', category: 'modern' },
  // Luxury / Fashion
  { primary: '#1C1917', s1: '#D4AF37', s2: '#78716C', name: 'فخامة سوداء', category: 'luxury' },
  { primary: '#4C1D95', s1: '#F472B6', s2: '#EDE9FE', name: 'أزياء راقية', category: 'luxury' },
  { primary: '#991B1B', s1: '#FCD34D', s2: '#7F1D1D', name: 'ملكي كلاسيك', category: 'luxury' },
  // Natural / Friendly
  { primary: '#166534', s1: '#84CC16', s2: '#F7FEE7', name: 'طبيعة نضرة', category: 'friendly' },
  { primary: '#EA580C', s1: '#FACC15', s2: '#FFF7ED', name: 'حيوي ومشرق', category: 'friendly' },
  { primary: '#0891B2', s1: '#22D3EE', s2: '#ECFEFF', name: 'هواء البحر', category: 'friendly' },
  { primary: '#5B21B6', s1: '#D8B4FE', s2: '#FAF5FF', name: 'إبداع أرجواني', category: 'friendly' }
];

const ColorCard: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  lang: string;
}> = ({ label, value, onChange, lang }) => (
  <div className="flex-1 min-w-[200px] group">
    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-slate-100 dark:border-gray-800 p-5 space-y-4 transition-all hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 relative overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: value }}></div>
      </div>
      
      <div className="space-y-3 relative z-10">
        <div className="relative">
          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-gray-800 border-0 rounded-xl px-10 py-3 text-sm font-black focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
            placeholder="#000000"
          />
        </div>
        
        <div className="relative h-12">
          <input 
            type="color" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="absolute inset-0 bg-slate-50 dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 flex items-center justify-center gap-2 pointer-events-none group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
            <Pipette size={18} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
              {lang === 'ar' ? 'اختر اللون' : 'Pick Color'}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
         <div className="w-full h-full rounded-full" style={{ backgroundColor: value }}></div>
      </div>
    </div>
  </div>
);

const Profile: React.FC = () => {
  const { t, profile, updateProfile, lang } = useApp();
  const [success, setSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoLoading(true);
    try {
      const base64 = await convertToBase64(file);
      updateProfile({ logo: base64 });
    } catch (error) {
      console.error("Logo upload failed:", error);
      alert(lang === 'ar' ? 'فشل معالجة الشعار' : 'Logo processing failed');
    } finally {
      setIsLogoLoading(false);
    }
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await convertToBase64(file);
      await savePortfolioImage(base64);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Portfolio upload failed:", error);
      alert(lang === 'ar' ? 'فشل رفع الصورة للملف التعريفي' : 'Portfolio image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const applyPalette = (palette: typeof CURATED_PALETTES[0]) => {
    updateProfile({
      primaryColor: palette.primary,
      secondaryColor1: palette.s1,
      secondaryColor2: palette.s2
    });
  };

  const filteredPalettes = activeFilter === 'all' 
    ? CURATED_PALETTES 
    : CURATED_PALETTES.filter(p => p.category === activeFilter);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-40">
      
      {/* Identity Preview Header */}
      <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] border-2 dark:border-gray-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="h-56 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${profile.primaryColor} 0%, ${profile.secondaryColor1} 50%, ${profile.secondaryColor2} 100%)` }}>
           <div className="absolute inset-0 opacity-20 pointer-events-none pattern-dots"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
           
           {/* Visual Preview Elements */}
           <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                 Live Preview
              </div>
           </div>
        </div>

        <div className="px-10 pb-12">
          <div className="relative -mt-20 mb-10 inline-block">
            <div className="relative w-40 h-40 rounded-[3rem] border-8 border-white dark:border-gray-800 bg-white overflow-hidden shadow-2xl flex items-center justify-center group">
              {isLogoLoading ? (
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <img 
                    src={profile.logo || `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.storeName}`} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                    alt="Logo"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                     <Upload className="text-white" size={32} />
                  </div>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Store Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">{t.storeName}</label>
                <input 
                  type="text"
                  value={profile.storeName}
                  onChange={(e) => updateProfile({ storeName: e.target.value })}
                  placeholder={t.placeholderStore}
                  className="w-full h-16 bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 focus:ring-0 font-black text-lg transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">{t.businessType}</label>
                <div className="relative group">
                  <select 
                    value={profile.businessType}
                    onChange={(e) => updateProfile({ businessType: e.target.value })}
                    className="w-full h-16 bg-slate-50 dark:bg-gray-900 border-2 border-transparent focus:border-indigo-500/20 rounded-2xl px-6 focus:ring-0 font-black text-lg appearance-none cursor-pointer"
                  >
                    {BUSINESS_TYPES.map(type => (
                      <option key={type} value={type}>{t[type as keyof typeof t] || type}</option>
                    ))}
                  </select>
                  <Palette className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            {/* Logo Management */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2">
                 <ImageIcon size={14} /> {lang === 'ar' ? 'إدارة صورة الشعار' : 'Logo Management'}
              </label>
              <label className="block w-full cursor-pointer group">
                <div className="flex items-center gap-6 px-8 py-8 bg-slate-50 dark:bg-gray-900 border-4 border-dashed border-slate-100 dark:border-gray-800 rounded-[2.5rem] hover:border-indigo-500 hover:bg-indigo-50/10 transition-all">
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-[1.5rem] flex items-center justify-center shadow-xl text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Upload size={28} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-black text-slate-700 dark:text-gray-200">
                      {lang === 'ar' ? 'ارفاق صورة الشعار' : 'Upload Logo'}
                    </p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">High Resolution SVG or PNG</p>
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                />
              </label>
            </div>

            {/* BRAND COLOR LAB - THE MAJOR UPDATE */}
            <div className="space-y-8 pt-10 border-t-2 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="space-y-1">
                    <h3 className="text-3xl font-black flex items-center gap-3">
                      <Sparkles className="text-indigo-600" />
                      {t.identityLab}
                    </h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">
                      {t.unlimitedColors}
                    </p>
                 </div>
                 <div className="flex gap-2">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                       <Monitor size={20} />
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                       <Layout size={20} />
                    </div>
                 </div>
              </div>

              {/* Direct Color Picking */}
              <div className="flex flex-wrap gap-6">
                 <ColorCard label={t.colorPrimary} value={profile.primaryColor} onChange={(v) => updateProfile({primaryColor: v})} lang={lang} />
                 <ColorCard label={t.colorSecondary1} value={profile.secondaryColor1} onChange={(v) => updateProfile({secondaryColor1: v})} lang={lang} />
                 <ColorCard label={t.colorSecondary2} value={profile.secondaryColor2} onChange={(v) => updateProfile({secondaryColor2: v})} lang={lang} />
              </div>

              {/* Curated Infinite Palettes */}
              <div className="space-y-6 pt-6">
                 <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">{lang === 'ar' ? 'مجموعات لونية مقترحة' : 'Curated Palettes'}</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                       {['all', 'traditional', 'modern', 'luxury', 'friendly'].map(filter => (
                         <button
                           key={filter}
                           type="button"
                           onClick={() => setActiveFilter(filter)}
                           className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 dark:bg-gray-800 text-slate-400 hover:bg-slate-100'}`}
                         >
                           {filter}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredPalettes.map((pal, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyPalette(pal)}
                        className="group flex flex-col p-4 bg-white dark:bg-gray-900 border-2 border-slate-50 dark:border-gray-800 rounded-3xl hover:border-indigo-500 transition-all hover:-translate-y-1 hover:shadow-xl animate-in fade-in zoom-in duration-300"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                         <div className="flex h-12 rounded-xl overflow-hidden mb-3 border border-slate-100 dark:border-gray-800">
                            <div className="flex-1" style={{ backgroundColor: pal.primary }}></div>
                            <div className="flex-1" style={{ backgroundColor: pal.s1 }}></div>
                            <div className="flex-1" style={{ backgroundColor: pal.s2 }}></div>
                         </div>
                         <div className="text-start">
                            <p className="text-[11px] font-black text-slate-600 dark:text-gray-300 truncate">{pal.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{pal.category}</p>
                         </div>
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            {/* Social & Save */}
            <div className="space-y-8 pt-10 border-t-2 dark:border-gray-700">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">{t.platforms}</label>
                <div className="flex flex-wrap gap-3">
                  {SOCIAL_PLATFORMS.map(platform => {
                    const isSelected = profile.platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => {
                          const newPlatforms = isSelected 
                            ? profile.platforms.filter(p => p !== platform)
                            : [...profile.platforms, platform];
                          updateProfile({ platforms: newPlatforms });
                        }}
                        className={`px-8 py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105' 
                            : 'bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700 text-slate-500 hover:border-indigo-300'
                        }`}
                      >
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-24 gradient-bg text-white rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none"
              >
                {success ? <Check size={32} /> : <Save size={32} />}
                {success ? (lang === 'ar' ? 'تم الحفظ بنجاح' : 'Saved Successfully') : t.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white dark:bg-gray-800 rounded-[4rem] border-2 dark:border-gray-700 shadow-2xl p-12 space-y-10">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h3 className="text-3xl font-black flex items-center gap-3">
                <ImageIcon className="text-indigo-600" />
                {lang === 'ar' ? 'معرض الصور المرجعية' : 'Visual Reference Gallery'}
              </h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'دليلك البصري للذكاء الاصطناعي' : 'Your Visual AI Reference'}</p>
           </div>
        </div>

        <div className="space-y-8">
          <p className="text-lg font-bold text-slate-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            {lang === 'ar' 
              ? 'ارفع صوراً تعبر عن هويتك أو منتجاتك ليستخدمها الذكاء الاصطناعي كمرجع أساسي عند إنشاء تصاميمك القادمة.' 
              : 'Upload images that reflect your identity or products for the AI to use as a primary reference when generating your next designs.'}
          </p>

          <div className="relative group">
            <input 
              type="file" 
              accept="image/*"
              onChange={handlePortfolioUpload}
              className="hidden" 
              id="portfolio-upload"
              disabled={isUploading}
            />
            <label 
              htmlFor="portfolio-upload"
              className={`
                flex flex-col items-center justify-center w-full h-72 border-4 border-dashed rounded-[3.5rem] cursor-pointer 
                transition-all duration-500 relative overflow-hidden
                ${isUploading ? 'bg-slate-50 dark:bg-gray-900 border-indigo-200' : 'bg-slate-50/50 dark:bg-gray-900/50 border-slate-100 dark:border-gray-700 hover:border-indigo-400 hover:bg-white dark:hover:bg-gray-800 shadow-inner'}
              `}
            >
              <div className="flex flex-col items-center justify-center p-10 text-center">
                {isUploading ? (
                  <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                ) : (
                  <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-[2rem] flex items-center justify-center shadow-2xl text-slate-400 mb-8 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
                    <Upload size={40} />
                  </div>
                )}
                <p className="text-2xl font-black text-slate-700 dark:text-gray-200">
                  {isUploading ? (lang === 'ar' ? 'جاري التحويل...' : 'Processing...') : (lang === 'ar' ? 'اضغط لاختيار صورة' : 'Select Visual Reference')}
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-3">
                   Unlimited uploads supported
                </p>
              </div>
            </label>
          </div>

          {uploadSuccess && (
            <div className="flex items-center gap-5 p-8 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem] animate-in zoom-in duration-500">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl">
                <Check size={24} />
              </div>
              <div>
                <p className="text-xl font-black text-emerald-800 dark:text-emerald-400">
                  {lang === 'ar' ? 'تمت الإضافة للمكتبة بنجاح!' : 'Added to reference library!'}
                </p>
                <p className="text-xs text-emerald-600/70 font-bold uppercase tracking-widest mt-1">
                   Ready for AI Generation Task
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .pattern-dots {
          background-image: radial-gradient(circle, white 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Profile;

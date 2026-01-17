
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Calendar, 
  Target, 
  BarChart3, 
  ChevronRight, 
  ChevronLeft,
  Moon, 
  Sun, 
  ArrowRight,
  Zap,
  Layout,
  X,
  Store,
  Mail,
  Phone,
  Layers,
  Palette,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mic2,
  Star,
  Globe
} from 'lucide-react';

const XIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/>
  </svg>
);

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.74-3.94-1.69-.01 2.44-.02 4.88-.03 7.32-.01 2.14-.52 4.39-2.03 5.96-1.57 1.62-4.03 2.15-6.13 1.67-2.48-.51-4.48-2.8-4.63-5.35-.11-2.01.74-4.14 2.33-5.39 1.34-.99 3.05-1.34 4.67-.99.01 1.4.01 2.79.01 4.19-1.28-.41-2.77-.06-3.66.97-.89 1.03-.76 2.62.24 3.55 1.05.95 2.73.81 3.6-.32.32-.42.48-.94.47-1.46V0z"/>
  </svg>
);

const FeatureCard: React.FC<{ 
  title: string; 
  desc: string; 
  icon: any; 
  color: string;
  badge?: string;
}> = ({ title, desc, icon: Icon, color, badge }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] border-2 border-slate-100 dark:border-gray-700 hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden text-start">
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${color} text-white group-hover:scale-110 transition-transform`}>
      <Icon size={32} />
    </div>
    {badge && (
      <span className="absolute top-8 right-8 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/40">
        {badge}
      </span>
    )}
    <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white leading-[1.8]">{title}</h3>
    <p className="text-slate-500 dark:text-gray-400 font-bold leading-[1.8]">{desc}</p>
  </div>
);

const PricingCard: React.FC<{ 
  plan: string; 
  price: string; 
  features: string[]; 
  isPopular?: boolean; 
  lang: string;
  t: any;
}> = ({ plan, price, features, isPopular, lang, t }) => (
  <div className={`
    p-10 rounded-[3rem] border-2 transition-all relative group h-full flex flex-col text-start
    ${isPopular ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-105 z-10' : 'bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700 hover:border-indigo-300'}
  `}>
    {isPopular && (
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-500 rounded-full text-xs font-black uppercase tracking-widest">
         Most Popular
      </div>
    )}
    <div className="mb-8">
      <h4 className="text-xl font-black mb-4 uppercase tracking-widest opacity-80 leading-[1.6]">{plan}</h4>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-black">{price}</span>
        <span className="text-lg font-bold opacity-60 leading-[1.6]">{t.sar} / {t.monthly}</span>
      </div>
    </div>
    <div className="space-y-4 flex-1">
      {features.map((f, i) => (
        <div key={i} className="flex items-start gap-3">
          <CheckCircle2 size={20} className={isPopular ? 'text-indigo-400' : 'text-indigo-600'} />
          <span className="text-sm font-bold opacity-80 leading-[1.8]">{f}</span>
        </div>
      ))}
    </div>
    <button className={`
      w-full py-5 rounded-2xl font-black text-lg transition-all mt-10
      ${isPopular ? 'bg-indigo-500 text-white hover:bg-indigo-400' : 'bg-slate-50 dark:bg-gray-900 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-gray-700 hover:bg-slate-100'}
    `}>
      {t.getStarted}
    </button>
  </div>
);

const LandingPage: React.FC = () => {
  const { t, lang, setLang, isDarkMode, setIsDarkMode, setIsLoggedIn, updateProfile, platformSettings, loginAsDemo, profile } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isTrialSuccessOpen, setTrialSuccessOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'register'>('login');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ storeName: '', email: '', phone: '', businessType: 'retail', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (loginData.email === 'admin' && loginData.password === '37193719') {
      setIsLoggedIn(true);
      return;
    }
    if (loginData.email === profile.email && loginData.password === profile.password) {
      setIsLoggedIn(true);
      return;
    }
    if (loginData.email === 'demo@remin.com' && loginData.password === 'demo123') {
      loginAsDemo();
      return;
    }
    setLoginError(lang === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      storeName: regData.storeName,
      email: regData.email,
      phone: regData.phone,
      businessType: regData.businessType,
      password: regData.password,
      trialStartedAt: new Date().toISOString(),
      subscriptionStatus: 'trial'
    });
    setModalOpen(false);
    setTrialSuccessOpen(true);
  };

  const openModal = (mode: 'login' | 'register') => {
    setLoginError(null);
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-slate-50 text-slate-900'} selection:bg-indigo-500 selection:text-white`}>
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">S</div>
            <div className="text-start">
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                Smart Reminder
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Smart Assistant</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 font-black text-sm uppercase tracking-widest text-slate-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">{t.features}</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">{t.pricing}</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-all font-black text-xs text-indigo-600 dark:text-indigo-400"
            >
              {lang === 'ar' ? 'ENGLISH' : 'العربية'}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-slate-400"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => openModal('login')}
              className="hidden sm:block px-8 py-3 font-black text-sm text-indigo-600 bg-white dark:bg-gray-800 border-2 border-indigo-600/20 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            >
              {t.login}
            </button>
            <button 
              onClick={() => openModal('register')}
              className="px-8 py-3 font-black text-sm text-white gradient-bg rounded-2xl shadow-lg hover:scale-105 transition-all"
            >
              {t.getStarted}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-64 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-800/40">
             <Star size={14} className="fill-current" /> AI-Powered Marketing Hub
          </div>
          
          <div className="space-y-14">
            <h1 className="flex flex-col items-center text-6xl md:text-8xl font-black tracking-tight leading-[1.8] max-w-5xl mx-auto">
              <span className="block mb-6">مساعدك الذكي</span>
              <div className="h-0.5 w-40 md:w-80 bg-slate-200 dark:bg-slate-700 my-16 md:my-20 rounded-full"></div>
              <span className="block pt-4">للتسويق في المواسم</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-gray-400 max-w-3xl leading-[1.8] font-bold mx-auto pt-16">
              {t.heroSubTitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 pt-16">
            <button onClick={() => openModal('register')} className="px-14 py-7 gradient-bg text-white rounded-3xl font-black text-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-5">
              {t.getStarted} <ArrowRight size={28} className={lang === 'ar' ? 'rotate-180' : ''} />
            </button>
            <button onClick={loginAsDemo} className="px-14 py-7 bg-white dark:bg-gray-800 border-2 rounded-3xl font-black text-2xl hover:bg-slate-50 dark:hover:bg-gray-700 transition-all shadow-lg">
              {t.smartDevelopments}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-48 px-6 relative bg-white dark:bg-gray-950/50">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b dark:border-gray-800 pb-20">
            <div className="space-y-6 max-w-2xl text-start">
               <h2 className="text-6xl font-black tracking-tight leading-[1.6]">{t.features}</h2>
               <p className="text-xl text-slate-500 dark:text-gray-400 font-bold leading-[2]">{lang === 'ar' ? 'اكتشف كيف يغير Smart Reminder طريقة إدارتك لمواسمك التسويقية من خلال أدوات ذكاء اصطناعي عالمية المستوى.' : 'Discover how Smart Reminder changes the way you manage your marketing seasons with world-class AI tools.'}</p>
            </div>
            <div className="flex gap-6">
               <div className="p-8 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border dark:border-gray-700 flex flex-col items-center">
                  <span className="block text-5xl font-black text-indigo-600">6+</span>
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-[1.6]">{lang === 'ar' ? 'أدوات ذكية' : 'Smart Tools'}</span>
               </div>
               <div className="p-8 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border dark:border-gray-700 flex flex-col items-center">
                  <span className="block text-5xl font-black text-purple-600">24/7</span>
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-[1.6]">{lang === 'ar' ? 'متابعة دائمة' : 'Always Tracking'}</span>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard 
              title={t.feature1Title} 
              desc={t.feature1Desc} 
              icon={Calendar} 
              color="bg-indigo-600" 
              badge="Pro"
            />
            <FeatureCard 
              title={t.feature2Title} 
              desc={t.feature2Desc} 
              icon={Sparkles} 
              color="bg-purple-600" 
              badge="AI"
            />
            <FeatureCard 
              title={t.feature3Title} 
              desc={t.feature3Desc} 
              icon={Palette} 
              color="bg-rose-500" 
            />
            <FeatureCard 
              title={t.feature4Title} 
              desc={t.feature4Desc} 
              icon={BarChart3} 
              color="bg-emerald-500" 
            />
            <FeatureCard 
              title={t.feature5Title} 
              desc={t.feature5Desc} 
              icon={Mic2} 
              color="bg-amber-500" 
              badge="New"
            />
            <FeatureCard 
              title={t.feature6Title} 
              desc={t.feature6Desc} 
              icon={Rocket} 
              color="bg-blue-600" 
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: t.activeMerchants, val: '5,000+', icon: Store },
            { label: t.aiDesigns, val: '1.2M+', icon: Layers },
            { label: t.seasonsTracked, val: '150+', icon: Globe },
            { label: t.hoursSaved, val: '80,000+', icon: Clock },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <stat.icon size={32} className="text-indigo-400" />
              </div>
              <h4 className="text-5xl font-black leading-[1.4]">{stat.val}</h4>
              <p className="text-xs font-black uppercase tracking-widest text-white/50 leading-[2]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-48 px-6">
        <div className="max-w-7xl mx-auto space-y-28">
          <div className="text-center space-y-8">
            <h2 className="text-6xl font-black tracking-tight leading-[1.6]">{t.pricing}</h2>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-[1.8]">{lang === 'ar' ? 'باقات مرنة صممت لتناسب طموحك، بالريال السعودي.' : 'Flexible plans designed for your ambition, in Saudi Riyals.'}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <PricingCard 
              plan={t.planBasic} 
              price="99" 
              features={lang === 'ar' ? ["١٠ تصاميم شهرياً", "تذكيرات أساسية", "دعم فني عبر البريد"] : ["10 Designs/mo", "Basic Reminders", "Email Support"]}
              lang={lang} t={t}
            />
            <PricingCard 
              plan={t.planPro} 
              price="299" 
              features={lang === 'ar' ? ["تصاميم غير محدودة", "فيديوهات AI", "تحليل الحملات الإعلانية", "أتمتة ذكية"] : ["Unlimited Designs", "AI Videos", "Campaign Analysis", "Smart Automation"]}
              isPopular lang={lang} t={t}
            />
            <PricingCard 
              plan={t.planEnterprise} 
              price="999" 
              features={lang === 'ar' ? ["حسابات متعددة", "دعم فني مخصص ٢٤/٧", "تدريب خاص للفريق", "سيرفرات فائقة السرعة"] : ["Multi-accounts", "24/7 Priority Support", "Team Training", "High-speed Servers"]}
              lang={lang} t={t}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2 space-y-12 text-start">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center text-white font-black text-2xl">S</div>
              <span className="text-3xl font-black leading-[1.4]">Smart Reminder</span>
            </div>
            <p className="text-xl text-slate-500 font-bold max-w-md leading-[1.8]">
              {t.heroSubTitle}
            </p>
            <div className="flex gap-10">
               <Instagram className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" />
               <TikTokIcon className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" />
               <XIcon className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" />
               <Youtube className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer" />
            </div>
          </div>
          <div className="space-y-10 text-start">
             <h4 className="font-black uppercase tracking-widest text-slate-900 dark:text-white mb-8 leading-[1.6]">{lang === 'ar' ? 'المنصة' : 'Platform'}</h4>
             <ul className="space-y-8 text-slate-500 font-bold">
               <li><a href="#features" className="hover:text-indigo-600 transition-colors leading-[1.8]">{t.features}</a></li>
               <li><a href="#pricing" className="hover:text-indigo-600 transition-colors leading-[1.8]">{t.pricing}</a></li>
               <li><a href="#" className="hover:text-indigo-600 transition-colors leading-[1.8]">{t.about}</a></li>
             </ul>
          </div>
          <div className="space-y-10 text-start">
             <h4 className="font-black uppercase tracking-widest text-slate-900 dark:text-white mb-8 leading-[1.6]">{lang === 'ar' ? 'التواصل' : 'Contact'}</h4>
             <ul className="space-y-8 text-slate-500 font-bold">
               <li className="flex items-center gap-5 leading-[1.8]"><Mail size={20} /> support@remin.ai</li>
               <li className="flex items-center gap-5 leading-[1.8]"><Phone size={20} /> +966 500 000 000</li>
               <li className="flex items-center gap-5 leading-[1.8]"><Globe size={20} /> Riyadh, Saudi Arabia</li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-16 border-t dark:border-gray-700 text-center text-slate-400 font-bold text-base leading-[2.2]">
           &copy; 2025 Smart Reminder | {t.allRightsReserved}
        </div>
      </footer>

      {/* Modals - REPAIRED FOR OVERLAP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
           <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-[3.5rem] border-2 dark:border-gray-700 shadow-2xl overflow-hidden">
              <div className="bg-slate-950 p-12 text-white relative text-start">
                 <button onClick={() => setModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
                 <h2 className="text-4xl font-black leading-[1.6]">{modalMode === 'login' ? t.welcomeBack : t.joinUs}</h2>
                 <p className="text-slate-400 font-bold mt-6 leading-[1.8]">{modalMode === 'login' ? (lang === 'ar' ? 'سعداء برؤيتك مرة أخرى' : 'Happy to see you again') : (lang === 'ar' ? 'ابدأ رحلة النجاح معنا اليوم' : 'Start your success journey today')}</p>
              </div>

              <form onSubmit={modalMode === 'login' ? handleLogin : handleRegister} className="p-12 space-y-10">
                 {loginError && <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3 text-start leading-[1.8]"><AlertCircle size={18}/> {loginError}</div>}
                 
                 {modalMode === 'register' && (
                   <div className="space-y-8 text-start">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2 leading-[1.6]">{t.storeName}</label>
                        <input required type="text" value={regData.storeName} onChange={e => setRegData({...regData, storeName: e.target.value})} className="w-full h-16 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-indigo-500 text-lg" placeholder="My Store" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2 leading-[1.6]">{t.phone}</label>
                        <input required type="tel" value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} className="w-full h-16 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-indigo-500 text-lg" placeholder="+966" />
                      </div>
                   </div>
                 )}

                 <div className="space-y-4 text-start">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2 leading-[1.6]">{t.email}</label>
                    <input required type="email" value={modalMode === 'login' ? loginData.email : regData.email} onChange={e => modalMode === 'login' ? setLoginData({...loginData, email: e.target.value}) : setRegData({...regData, email: e.target.value})} className="w-full h-16 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-indigo-500 text-lg" placeholder="user@email.com" />
                 </div>

                 <div className="space-y-4 text-start">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2 leading-[1.6]">{t.password}</label>
                    <input required type="password" value={modalMode === 'login' ? loginData.password : regData.password} onChange={e => modalMode === 'login' ? setLoginData({...loginData, password: e.target.value}) : setRegData({...regData, password: e.target.value})} className="w-full h-16 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold focus:ring-2 focus:ring-indigo-500 text-lg" placeholder="••••••••" />
                 </div>

                 <button type="submit" className="w-full h-20 gradient-bg text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] transition-all">
                    {modalMode === 'login' ? t.login : t.createMyAccount}
                 </button>

                 <p className="text-center text-sm font-bold text-slate-500 leading-[2]">
                    {modalMode === 'login' ? t.noAccount : t.alreadyHaveAccount}{' '}
                    <button type="button" onClick={() => setModalMode(modalMode === 'login' ? 'register' : 'login')} className="text-indigo-600 hover:underline">
                       {modalMode === 'login' ? t.register : t.login}
                    </button>
                 </p>
              </form>
           </div>
        </div>
      )}

      {isTrialSuccessOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
           <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[4rem] p-20 text-center space-y-12 shadow-2xl border-4 border-indigo-500/20">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner border border-indigo-100 dark:border-indigo-800">
                 <Rocket size={56} />
              </div>
              <div className="space-y-8">
                 <h2 className="text-5xl font-black tracking-tight leading-[1.6]">{t.trialTitle}</h2>
                 <p className="text-xl text-slate-500 font-bold leading-[1.8]">{t.trialMessage}</p>
              </div>
              <button onClick={() => setIsLoggedIn(true)} className="w-full py-8 gradient-bg text-white rounded-[2.5rem] font-black text-2xl shadow-xl hover:scale-[1.05] transition-all">
                 {t.trialAction}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

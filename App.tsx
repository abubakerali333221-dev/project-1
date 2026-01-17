
import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AIStudio from './components/AIStudio';
import Profile from './components/Profile';
import FounderDashboard from './components/FounderDashboard';
import SmartCalendar from './components/SmartCalendar';
import LandingPage from './components/LandingPage';
import StoreAudit from './components/StoreAudit';
import CampaignAnalysis from './components/CampaignAnalysis';
import VoiceoverStudio from './components/VoiceoverStudio';
import { useApp } from './context/AppContext';
import { Sparkles, Zap, CreditCard, ArrowLeft, Star, Lock, AlertTriangle, Home, Layout as LayoutIcon, Activity, BarChart3, X } from 'lucide-react';

const FrozenOverlay: React.FC = () => {
  const { t, lang, setIsLoggedIn, setActiveTab } = useApp();

  const handleUpgrade = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-700">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-2xl border-4 border-rose-500/20 p-12 text-center space-y-10">
        <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-rose-100 dark:border-rose-800">
          <Lock size={48} />
        </div>
        <div className="space-y-4">
           <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-[2]">{t.frozenTitle}</h2>
           <p className="text-lg text-slate-500 dark:text-gray-400 font-bold leading-[2]">{t.frozenMessage}</p>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={handleUpgrade} className="w-full py-6 gradient-bg text-white rounded-[2rem] font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
            <CreditCard size={24} /> {t.upgradeNow}
          </button>
          <button onClick={() => window.open('mailto:support@remin.com')} className="w-full py-5 bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200 rounded-[2rem] font-black text-lg border-2 border-slate-100 dark:border-gray-600 hover:bg-slate-100 transition-all flex items-center justify-center gap-3">
            <AlertTriangle size={20} className="text-amber-500" /> {t.contactSupport}
          </button>
        </div>
      </div>
    </div>
  );
};

const Main: React.FC = () => {
  const { lang, isLoading, isLoggedIn, activeTab, setActiveTab, preselectedEventId, setPreselectedEventId, setIsLoggedIn, isFrozen } = useApp();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleCalendarToStudio = (eventId: string) => {
    setPreselectedEventId(eventId);
    setActiveTab('studio');
  };

  const returnToLanding = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToSubscriptions = () => {
    setShowSubscriptionModal(false);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) pricingSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const triggerLockModal = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSubscriptionModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-[2]">{lang === 'ar' ? 'جاري تحميل البيانات...' : 'Loading Data...'}</h2>
      </div>
    );
  }

  if (!isLoggedIn) return <LandingPage />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'studio': return <AIStudio initialEventId={preselectedEventId || undefined} onResetPreselection={() => setPreselectedEventId(null)} />;
      case 'voiceover': return <VoiceoverStudio />;
      case 'profile': return <Profile />;
      case 'calendar': return <SmartCalendar onNavigateToStudio={handleCalendarToStudio} />;
      case 'founder': return <FounderDashboard />;
      case 'audit': return <StoreAudit />;
      case 'analysis': return <CampaignAnalysis />;
      case 'demo_preview':
        return (
          <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 md:px-8 pt-4">
             {/* Header Banner - Tightened */}
             <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border-2 border-slate-100 dark:border-gray-700 p-8 md:p-14 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                   <div className="flex flex-col items-center gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl transform rotate-2">
                           <Zap size={44} className="fill-white" />
                        </div>
                      </div>
                      <div className="px-5 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-100 dark:border-indigo-800/40">
                         {lang === 'ar' ? 'عرض تجريبي حي' : 'Live Demo Preview'}
                      </div>
                   </div>

                   <div className="max-w-4xl space-y-8">
                      <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.6] tracking-tight">
                        {lang === 'ar' ? 'التقويم الذكي لشهر فبراير ٢٠٢٦' : 'Smart Calendar: February 2026'}
                      </h2>
                      <p className="text-lg md:text-xl text-slate-500 dark:text-gray-400 font-bold leading-[1.8] max-w-2xl mx-auto">
                        {lang === 'ar' ? 'استعرض كيف يقوم النظام بجدولة وتذكيرك بكافة المناسبات التسويقية الهامة لهذا الشهر.' : 'See how the system schedules and reminds you of all important marketing events for this month.'}
                      </p>
                   </div>

                   <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full pt-2">
                      <button onClick={returnToLanding} className="w-full sm:w-auto px-10 py-5 bg-slate-50 dark:bg-gray-700/50 text-slate-700 dark:text-gray-200 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border-2 border-slate-100 dark:border-gray-600 shadow-sm group">
                        <ArrowLeft size={24} className={`transition-transform group-hover:-translate-x-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                        {lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                      </button>
                      <button onClick={goToSubscriptions} className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 border-2 border-indigo-500">
                        <CreditCard size={24} />
                        {lang === 'ar' ? 'باقات الاشتراك' : 'Subscription Plans'}
                      </button>
                   </div>
                </div>
             </div>
             
             {/* 1. Full Calendar Section - TIGHTENED */}
             <div className="space-y-6">
                <div className="flex items-center gap-4 px-4 text-start">
                   <div className="w-3 h-10 bg-purple-600 rounded-full shadow-[0_0_20px_rgba(147,51,234,0.4)]"></div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {lang === 'ar' ? 'التقويم التسويقي الكامل' : 'Full Marketing Calendar'}
                     </h2>
                     <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
                       {lang === 'ar' ? 'فبراير ٢٠٢٦' : 'February 2026'}
                     </p>
                   </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-[3rem] shadow-xl border-2 dark:border-gray-700">
                  <SmartCalendar onNavigateToStudio={handleCalendarToStudio} />
                </div>
             </div>

             {/* 2. AI Studio Peek (Locked) */}
             <div className="space-y-6 relative">
                <div className="flex items-center gap-4 px-4 text-start">
                   <div className="w-3 h-10 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]"></div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {lang === 'ar' ? 'ستوديو الذكاء الاصطناعي' : 'AI Creative Studio'}
                     </h2>
                   </div>
                </div>
                <div className="relative group">
                   <div className="absolute inset-0 z-20 cursor-pointer" onClick={triggerLockModal}></div>
                   <div className="pointer-events-none filter blur-[5px] grayscale opacity-60">
                     <AIStudio />
                   </div>
                   <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border-2 border-indigo-500/20 flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                            <Lock size={32} />
                         </div>
                         <p className="font-black text-slate-800 dark:text-white">{lang === 'ar' ? 'ميزة مفعلة للمشتركين' : 'Subscribers only feature'}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* 3. Store Audit Peek (Locked) */}
             <div className="space-y-6 relative">
                <div className="flex items-center gap-4 px-4 text-start">
                   <div className="w-3 h-10 bg-rose-600 rounded-full shadow-[0_0_20px_rgba(225,29,72,0.4)]"></div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {lang === 'ar' ? 'اختبار وتحليل المتجر' : 'Store Technical Audit'}
                     </h2>
                   </div>
                </div>
                <div className="relative group">
                   <div className="absolute inset-0 z-20 cursor-pointer" onClick={triggerLockModal}></div>
                   <div className="pointer-events-none filter blur-[5px] opacity-60">
                     <StoreAudit />
                   </div>
                   <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border-2 border-rose-500/20 flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-rose-600 text-white rounded-2xl flex items-center justify-center">
                            <Lock size={32} />
                         </div>
                         <p className="font-black text-slate-800 dark:text-white">{lang === 'ar' ? 'ميزة مفعلة للمشتركين' : 'Subscribers only feature'}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* 4. Campaign Analysis Peek (Locked) */}
             <div className="space-y-6 relative">
                <div className="flex items-center gap-4 px-4 text-start">
                   <div className="w-3 h-10 bg-emerald-600 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]"></div>
                   <div>
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {lang === 'ar' ? 'تحليل أداء الحملات' : 'Campaign ROI Analysis'}
                     </h2>
                   </div>
                </div>
                <div className="relative group">
                   <div className="absolute inset-0 z-20 cursor-pointer" onClick={triggerLockModal}></div>
                   <div className="pointer-events-none filter blur-[5px] opacity-60">
                     <CampaignAnalysis />
                   </div>
                   <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border-2 border-emerald-500/20 flex flex-col items-center gap-4">
                         <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                            <Lock size={32} />
                         </div>
                         <p className="font-black text-slate-800 dark:text-white">{lang === 'ar' ? 'ميزة مفعلة للمشتركين' : 'Subscribers only feature'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        );
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="relative h-full">
        {renderContent()}
        {isFrozen && activeTab !== 'founder' && <FrozenOverlay />}
        
        {/* Subscription Required Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-[3rem] p-10 text-center space-y-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border-2 border-indigo-500/10 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                   <Lock size={40} />
                </div>
                
                <div className="space-y-4">
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                     {lang === 'ar' ? 'يجب أن تكون مشتركاً' : 'Subscription Required'}
                   </h2>
                   <p className="text-lg text-slate-500 dark:text-gray-400 font-bold leading-relaxed">
                     {lang === 'ar' 
                       ? 'يجب أن تكون مشتركاً في إحدى الخطط للاستفادة من هذه الميزة.' 
                       : 'Subscription is required to access this feature.'}
                   </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                   <button 
                     onClick={goToSubscriptions}
                     className="w-full py-6 gradient-bg text-white rounded-2xl font-black text-xl shadow-xl hover:scale-[1.02] transition-all"
                   >
                     {lang === 'ar' ? 'استكشف الخطط' : 'Explore Plans'}
                   </button>
                   <button 
                     onClick={() => setShowSubscriptionModal(false)}
                     className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                   >
                     {lang === 'ar' ? 'إغلاق النافذة' : 'Close Window'}
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;

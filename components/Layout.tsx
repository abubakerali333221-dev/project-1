
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Settings, 
  LogOut, 
  Menu, 
  Sun, 
  Moon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Activity,
  BarChart3,
  Key
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

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { t, lang, setLang, isDarkMode, setIsDarkMode, profile, setIsLoggedIn, platformSettings } = useApp();
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const [hasKey, setHasKey] = useState(false);

  // إزالة useEffect التي كانت تتحقق من المفتاح تلقائياً لتجنب خطأ "refused to connect"

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        console.error("Key selection failed", e);
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'calendar', label: t.calendar, icon: CalendarIcon },
    { id: 'studio', label: t.aiStudio, icon: Sparkles },
    { id: 'audit', label: t.storeAudit, icon: Activity },
    { id: 'analysis', label: t.campaignAnalysis, icon: BarChart3 },
    { id: 'profile', label: t.profile, icon: Settings },
  ];

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const socialIcons = [
    { key: 'instagram', icon: Instagram, color: 'hover:text-pink-500' },
    { key: 'x', icon: XIcon, color: 'hover:text-slate-900 dark:hover:text-white' },
    { key: 'tiktok', icon: TikTokIcon, color: 'hover:text-black dark:hover:text-white' },
    { key: 'youtube', icon: Youtube, color: 'hover:text-red-600' },
    { key: 'facebook', icon: Facebook, color: 'hover:text-blue-600' },
    { key: 'linkedin', icon: Linkedin, color: 'hover:text-blue-700' },
  ];

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} 
        w-72 z-50 transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full' : '-translate-x-full')} 
        lg:translate-x-0 bg-white dark:bg-gray-800 border-x dark:border-gray-700
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {t.appName}
              </h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Smart Assistant</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            <div className="text-xs font-bold text-slate-400 px-4 py-2 uppercase tracking-widest mb-2">
              {lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
            </div>
            
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all
                  ${activeTab === item.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' 
                    : 'hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-500'}
                `}
              >
                <item.icon size={18} className="shrink-0" />
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-4 py-4 space-y-4">
            <button
              onClick={() => {
                setActiveTab('founder');
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all border-2
                ${activeTab === 'founder' 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                  : 'bg-slate-50 dark:bg-gray-700/50 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-white'}
              `}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className={activeTab === 'founder' ? 'text-amber-400' : 'text-slate-400'} />
                <span className="font-bold text-sm whitespace-nowrap">{t.founderDashboard}</span>
              </div>
              {lang === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            <div className="p-3 bg-slate-50 dark:bg-gray-700 rounded-xl flex items-center gap-3">
              <img 
                src={profile.logo || `https://picsum.photos/seed/${profile.storeName || 'store'}/100`} 
                className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-600" 
                alt="Logo"
              />
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{profile.storeName || t.placeholderStore}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{profile.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold capitalize hidden md:block">{t[activeTab as keyof typeof t] || activeTab}</h2>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={handleSelectKey}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${hasKey ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 border border-rose-200'}`}
            >
              <Key size={14} />
              {hasKey ? (lang === 'ar' ? 'المفتاح نشط' : 'API Key Active') : (lang === 'ar' ? 'تفعيل المفتاح' : 'Activate API')}
            </button>

            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-bold text-sm text-indigo-600 dark:text-indigo-400"
            >
              {lang === 'ar' ? 'EN' : 'العربية'}
            </button>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <div className="flex-1">
              {children}
            </div>
            <footer className="mt-12 py-8 border-t dark:border-gray-800 flex flex-col items-center justify-center gap-4">
               <div className="flex items-center justify-center gap-6">
                  {socialIcons.map(social => {
                    const link = platformSettings.socialLinks[social.key as keyof typeof platformSettings.socialLinks];
                    if (!link) return null;
                    return (
                      <a 
                        key={social.key}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-slate-400 transition-all ${social.color}`}
                      >
                        <social.icon size={20} />
                      </a>
                    );
                  })}
               </div>
               <div className="text-center text-[10px] font-bold text-slate-400 whitespace-nowrap leading-none">
                  SMART REMINDER &copy; 2025 | {t.allRightsReserved}
               </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

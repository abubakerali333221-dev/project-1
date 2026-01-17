
import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Calendar as CalendarIcon, Layout as LayoutIcon, Video, Type, ChevronLeft, ChevronRight, Target, Zap, MousePointer2 } from 'lucide-react';
import { MarketingEvent } from '../types';

export const PriorityIndicator: React.FC<{ priority: 'high' | 'medium' | 'low'; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  const { lang } = useApp();
  
  const getMarkerPosition = () => {
    switch (priority) {
      case 'low': return '0%';
      case 'medium': return '50%';
      case 'high': return '100%';
      default: return '50%';
    }
  };

  const getMarkerColor = () => {
    switch (priority) {
      case 'low': return 'border-b-emerald-500';
      case 'medium': return 'border-b-amber-500';
      case 'high': return 'border-b-rose-500';
      default: return 'border-b-indigo-500';
    }
  };

  const positionStyle = lang === 'ar' 
    ? { right: getMarkerPosition() } 
    : { left: getMarkerPosition() };

  return (
    <div className={`relative ${size === 'sm' ? 'w-24 h-1.5' : 'w-full h-2'} mt-3 mb-2`}>
      <div className="absolute inset-0 flex rounded-full overflow-hidden shadow-inner bg-slate-100 dark:bg-gray-700/50">
        <div className="flex-1 bg-emerald-500/80"></div>
        <div className="flex-1 bg-amber-500/80"></div>
        <div className="flex-1 bg-rose-500/80"></div>
      </div>
      
      <div 
        className="absolute top-full -translate-y-1/2 transition-all duration-1000 ease-out z-10"
        style={{ 
          ...positionStyle,
          transform: `translate(${lang === 'ar' ? '50%' : '-50%'}, -50%)` 
        }}
      >
        <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] ${getMarkerColor()} drop-shadow-md`}></div>
      </div>
    </div>
  );
};

const CompactFebGrid: React.FC = () => {
  const { lang, setActiveTab, setPreselectedEventId } = useApp();
  
  // Static real seasons for Feb
  const seasons = [
    { day: 1, priority: 'low', id: 'feb-1' },
    { day: 9, priority: 'low', id: 'feb-2' },
    { day: 12, priority: 'medium', id: 'feb-3' },
    { day: 14, priority: 'medium', id: 'feb-4' },
    { day: 18, priority: 'high', id: '2' },
    { day: 22, priority: 'high', id: '1' },
    { day: 26, priority: 'medium', id: 'feb-5' }
  ];

  const getSeason = (day: number) => seasons.find(s => s.day === day);

  const colors = {
    high: 'bg-rose-500 shadow-rose-200 dark:shadow-none',
    medium: 'bg-amber-500 shadow-amber-200 dark:shadow-none',
    low: 'bg-emerald-500 shadow-emerald-200 dark:shadow-none'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 dark:border-gray-700 shadow-xl overflow-hidden relative group">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h3 className="text-2xl font-black">{lang === 'ar' ? 'نظرة فبراير ٢٠٢٦' : 'Feb 2026 Snapshot'}</h3>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
             {lang === 'ar' ? 'التقويم الذكي' : 'Smart Calendar'}
           </p>
        </div>
        <button 
          onClick={() => setActiveTab('calendar')}
          className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:scale-110 transition-transform"
        >
          <CalendarIcon size={24} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => {
          const season = getSeason(day);
          return (
            <div 
              key={day}
              onClick={() => {
                if (season) {
                  setPreselectedEventId(season.id);
                  setActiveTab('studio');
                }
              }}
              className={`
                aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all cursor-pointer border-2
                ${season 
                  ? `${colors[season.priority as keyof typeof colors]} border-transparent text-white shadow-lg scale-105 hover:scale-110` 
                  : 'bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-700 text-slate-300 dark:text-gray-600 hover:bg-white dark:hover:bg-gray-700'}
              `}
            >
              <span className="text-xs md:text-sm font-black">{day}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase">{lang === 'ar' ? 'ذروة' : 'Peak'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase">{lang === 'ar' ? 'هام' : 'Major'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase">{lang === 'ar' ? 'عادي' : 'Normal'}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { t, events, lang, contents, profile, setActiveTab, setPreselectedEventId } = useApp();
  
  const allUpcomingEvents = [...events]
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextEvent = allUpcomingEvents[0];
  const daysToNext = nextEvent ? Math.ceil((new Date(nextEvent.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const featuredEvents = allUpcomingEvents.slice(0, 3);

  const stats = [
    { label: t.generateImage, value: contents.filter(c => c.type === 'image').length, icon: LayoutIcon, color: 'bg-blue-500' },
    { label: t.generateVideo, value: contents.filter(c => c.type === 'video').length, icon: Video, color: 'bg-purple-500' },
    { label: t.generateCopy, value: contents.filter(c => c.type === 'copy').length, icon: Type, color: 'bg-amber-500' },
  ];

  const handleExploitSeason = () => {
    if (nextEvent) {
      setPreselectedEventId(nextEvent.id);
    }
    setActiveTab('studio');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden gradient-bg rounded-[3rem] pt-6 pb-8 px-8 lg:pt-8 lg:pb-12 lg:px-12 text-white shadow-2xl border-b-8 border-black/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-8 pb-24 md:pb-16">
          <div className="space-y-4 pt-0">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              <span className="text-indigo-200 inline-block uppercase tracking-widest">SMART REMINDER</span> <br />
              <span className="opacity-95 text-white/90 text-2xl lg:text-3xl font-bold inline-block mt-2">
                {lang === 'ar' ? 'لوحة تحكم التاجر الذكية' : 'Smart Merchant Dashboard'}
              </span>
            </h1>
            <p className="text-indigo-100/80 text-lg font-medium max-w-md">
              {lang === 'ar' 
                ? 'استكشف مواسمك التسويقية من خلال التقويم الذكي' 
                : 'Explore your marketing seasons through the smart calendar'}
            </p>
          </div>
          
          <div className="flex gap-4 self-center md:self-start pt-2">
             <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-center min-w-[120px] shadow-lg">
                <span className="block text-4xl font-black mb-1">{allUpcomingEvents.length}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">{lang === 'ar' ? 'موسم قادم' : 'Upcoming Seasons'}</span>
             </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-6 lg:bottom-6 lg:left-10 z-20">
          <button 
            onClick={handleExploitSeason}
            className="inline-flex items-center gap-4 bg-white/25 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/30 text-lg md:text-xl font-black animate-bounce-slow shadow-2xl transition-transform hover:scale-105 active:scale-95"
          >
            <Sparkles size={28} className="text-amber-300" />
            <span>{lang === 'ar' ? 'ابدأ حملة الموسم' : 'Start Season Campaign'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Compact Tiles Grid */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black">{lang === 'ar' ? 'التقويم الذكي' : 'Smart Calendar'}</h3>
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                 <MousePointer2 size={14} />
                 {lang === 'ar' ? 'اضغط المربعات الملونة' : 'Click colored tiles'}
              </div>
           </div>
           <CompactFebGrid />
        </div>

        {/* Quick Actions & Stats (Swapped Order) */}
        <div className="space-y-6">
          {/* Smart Automation (Now on top) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-black">{t.smartAutomation}</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 dark:border-gray-700 shadow-xl space-y-6">
               <div className="flex items-center gap-4 border-b dark:border-gray-700 pb-4">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center">
                     <Zap size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-lg">{lang === 'ar' ? 'أتمتة ذكية' : 'Smart Automation'}</h4>
                     <p className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'النظام جاهز للعمل بالنيابة عنك' : 'System ready to work for you'}</p>
                  </div>
               </div>
               <p className="text-slate-500 dark:text-gray-400 font-bold leading-relaxed">
                 {lang === 'ar' ? 'يقوم Remin بمراقبة كافة المواسم المسجلة في التقويم الذكي وتنبيهك قبل الموعد بـ ٧ أيام لضمان أفضل إنتاجية.' : 'Remin monitors all registered seasons in the smart calendar and alerts you 7 days in advance for maximum productivity.'}
               </p>
               <button 
                 onClick={() => setActiveTab('calendar')}
                 className="w-full py-4 bg-slate-50 dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 rounded-2xl font-black border-2 border-slate-100 dark:border-gray-700 hover:bg-white transition-all flex items-center justify-center gap-3"
               >
                  {lang === 'ar' ? 'فتح الجدول الكامل' : 'Open Full Grid'}
                  <ChevronRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
               </button>
            </div>
          </div>

          {/* Smart Analytics (Now on bottom) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-black">{t.smartAnalytics}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveTab('studio')}
                  className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 dark:border-gray-700 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl text-white ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                    <span className="text-3xl font-black">{stat.value}</span>
                  </div>
                  <p className="text-slate-500 dark:text-gray-400 font-bold text-sm uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-8">
        <h3 className="text-xl font-black mb-6 px-2">{t.upcomingEvents}</h3>
        <div className="grid gap-4">
          {featuredEvents.map((event) => {
            const daysLeft = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div 
                key={event.id} 
                onClick={() => {
                  setPreselectedEventId(event.id);
                  setActiveTab('studio');
                }}
                className="bg-white dark:bg-gray-800 p-6 rounded-3xl border-2 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-indigo-200 cursor-pointer transition-all group gap-4 relative overflow-hidden"
              >
                <div className={`absolute ${lang === 'ar' ? 'right-0' : 'left-0'} top-0 bottom-0 w-1.5 ${event.priority === 'high' ? 'bg-rose-500' : event.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
                    <CalendarIcon size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-black text-lg">{event.title[lang]}</h4>
                    </div>
                    <p className="text-sm font-bold text-slate-500 dark:text-gray-400 mt-0.5">{event.description[lang]}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-sm">
                     <span className="block text-slate-400 font-black text-[10px] uppercase tracking-widest">{lang === 'ar' ? 'التاريخ' : 'Date'}</span>
                     <span className="font-black">{event.date}</span>
                  </div>
                  <div className="text-center bg-slate-50 dark:bg-gray-700/50 px-4 py-2 rounded-2xl min-w-[80px] border dark:border-gray-600">
                    <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-none">{daysLeft}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{t.daysRemaining}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

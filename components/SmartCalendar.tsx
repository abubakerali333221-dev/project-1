
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  Sparkles, 
  Target, 
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface MarketingStrategy {
  date: string; // YYYY-MM-DD
  title: { ar: string, en: string };
  idea: { ar: string, en: string };
  priority: 'high' | 'medium' | 'low';
}

const SmartCalendar: React.FC<{ onNavigateToStudio: (eventId: string) => void }> = ({ onNavigateToStudio }) => {
  const { lang } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const marketingStrategies: MarketingStrategy[] = [
    { date: "2026-02-01", title: { ar: "انطلاق حملات فبراير", en: "February Campaign Launch" }, idea: { ar: "بداية الموسم التجاري لشهر فبراير وتجهيز عروض المنتصف.", en: "Start of the February commercial season." }, priority: 'low' },
    { date: "2026-02-09", title: { ar: "يوم البيتزا العالمي", en: "World Pizza Day" }, idea: { ar: "مناسبة عالمية مشهورة لقطاع الأغذية والمطاعم لزيادة التفاعل والمبيعات.", en: "A famous global event for the F&B sector." }, priority: 'low' },
    { date: "2026-02-12", title: { ar: "تجهيزات ما قبل رمضان", en: "Pre-Ramadan Prep" }, idea: { ar: "بدء ذروة البحث عن مستلزمات رمضان والتمور والأواني المنزلية.", en: "Peak search period for Ramadan essentials." }, priority: 'medium' },
    { date: "2026-02-14", title: { ar: "يوم الحب العالمي", en: "Valentine's Day" }, idea: { ar: "من أقوى المواسم العالمية لقطاع العطور، الزهور، والمجوهرات والهدايا.", en: "Strongest global season for gifts." }, priority: 'medium' },
    { date: "2026-02-18", title: { ar: "بداية شهر رمضان المبارك", en: "Ramadan 2026 Starts" }, idea: { ar: "أضخم موسم استهلاكي وديني في المنطقة. ذروة المبيعات والروحانيات.", en: "Region's biggest consumer season." }, priority: 'high' },
    { date: "2026-02-22", title: { ar: "يوم التأسيس السعودي", en: "Saudi Founding Day" }, idea: { ar: "مناسبة وطنية كبرى وذروة تسويقية ضخمة تعتمد على الهوية التاريخية والعروض الحصرية.", en: "Major national occasion and marketing peak." }, priority: 'high' },
    { date: "2026-02-26", title: { ar: "تخفيضات نهاية فبراير", en: "End of Feb Clearances" }, idea: { ar: "موسم تصفية المخزون الشتوي والاستعداد لموسم العيد والربيع.", en: "Winter stock clearance season." }, priority: 'medium' },
    { date: "2026-03-20", title: { ar: "يوم الفطر السعيد", en: "Eid Al-Fitr 2026" }, idea: { ar: "ذروة شراء ملابس العيد، الحلويات، والهدايا.", en: "Peak for Eid clothes and gifts." }, priority: 'high' },
    { date: "2026-03-21", title: { ar: "يوم الأم", en: "Mother's Day" }, idea: { ar: "موسم الهدايا والتقدير، مثالي لقطاعات العطور، الذهب، والزهور.", en: "Gifts and appreciation season." }, priority: 'high' },
    { date: "2026-05-27", title: { ar: "يوم الأضحى المبارك", en: "Eid Al-Adha 2026" }, idea: { ar: "موسم السفر، الضيافة، والذبائح.", en: "Season for travel and hospitality." }, priority: 'high' },
    { date: "2026-09-23", title: { ar: "اليوم الوطني السعودي", en: "Saudi National Day" }, idea: { ar: "احتفالات وطنية ضخمة، عروض الـ 96 ريال.", en: "Massive national celebrations." }, priority: 'high' },
    { date: "2026-11-27", title: { ar: "الجمعة البيضاء", en: "White Friday" }, idea: { ar: "أقوى موسم مبيعات سنوي وتخفيضات كبرى.", en: "Strongest annual sales season." }, priority: 'high' },
    { date: "2026-12-31", title: { ar: "تصفيات نهاية العام", en: "Year-End Clearances" }, idea: { ar: "تصفية المخزون السنوي والاستعداد للعام الجديد.", en: "Annual stock clearance." }, priority: 'medium' }
  ];

  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentMonth, currentYear]);
  const monthName = useMemo(() => currentDate.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'long' }), [currentDate, lang]);

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentDate(nextDate);
    setSelectedDay(null);
  };

  const getDayContent = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return marketingStrategies.find(s => s.date === dateStr);
  };

  const priorityColors = {
    high: 'bg-rose-500 shadow-rose-200',
    medium: 'bg-amber-500 shadow-amber-200',
    low: 'bg-emerald-500 shadow-emerald-200'
  };

  const selectedStrategy = selectedDay ? getDayContent(selectedDay) : null;

  const handleProduce = () => {
    if (selectedStrategy) {
      const mapping: any = { "2026-02-22": "1", "2026-02-18": "2", "2026-03-21": "3", "2026-03-20": "4", "2026-05-27": "7", "2026-09-23": "9", "2026-11-27": "12" };
      onNavigateToStudio(mapping[selectedStrategy.date] || `strat-${selectedStrategy.date}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-500 text-start">
      
      {/* 1. Month Navigator - Compact */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
           <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
             <CalendarIcon size={20} />
           </div>
           <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{lang === 'ar' ? 'التقويم الذكي' : 'Smart Calendar'}</h2>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-800 px-4 py-2 rounded-xl border dark:border-gray-700 shadow-sm">
           <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all">
              <ArrowLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
           </button>
           <span className="text-sm font-black min-w-[120px] text-center">{monthName} {currentYear}</span>
           <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all">
              <ArrowRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
           </button>
        </div>
      </div>

      {/* 2. The Grid - Tightened Gap */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-4">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const strategy = getDayContent(day);
          const isSelected = selectedDay === day;
          return (
            <button key={day} onClick={() => setSelectedDay(day)} className={`relative aspect-square rounded-xl md:rounded-[2rem] border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105 z-10' : strategy ? `${priorityColors[strategy.priority]} border-transparent text-white shadow-md hover:scale-105` : 'bg-slate-50 dark:bg-gray-900 border-slate-100 dark:border-gray-700 text-slate-300 hover:bg-white'}`}>
              <span className={`text-lg sm:text-2xl font-black ${!strategy && !isSelected ? 'opacity-20' : 'opacity-100'}`}>{day}</span>
              {strategy && !isSelected && <Sparkles size={12} className="absolute top-2 right-2 text-white opacity-70" />}
            </button>
          );
        })}
      </div>

      {/* 3. Strategy Detail Area - ZERO SPACE WHEN HIDDEN */}
      <div className={`transition-all duration-500 ${selectedDay ? 'opacity-100 mt-2 mb-2' : 'h-0 opacity-0 overflow-hidden'}`}>
           {selectedStrategy && (
             <div className="bg-slate-50 dark:bg-gray-900 rounded-[2rem] p-6 border-2 border-dashed dark:border-gray-700 flex flex-col lg:flex-row items-center gap-6">
                <div className="flex-1 space-y-4">
                   <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${priorityColors[selectedStrategy.priority]}`}></div>
                      {/* Fixed: Replaced undefined 'day' with 'selectedDay' */}
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'ar' ? `يوم ${selectedDay} ${monthName}` : `${selectedDay} ${monthName}`}</span>
                   </div>
                   <h3 className="text-2xl md:text-3xl font-black leading-tight text-slate-900 dark:text-white">{selectedStrategy.title[lang]}</h3>
                   <p className="text-sm md:text-lg font-bold text-slate-500 dark:text-gray-400 leading-relaxed">{selectedStrategy.idea[lang]}</p>
                </div>
                <div className="w-full lg:w-64 shrink-0">
                   <button onClick={handleProduce} className="w-full py-5 gradient-bg text-white rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                     <Sparkles size={24} /> {lang === 'ar' ? 'إنتاج' : 'Produce'}
                   </button>
                </div>
             </div>
           )}
      </div>
    </div>
  );
};

export default SmartCalendar;

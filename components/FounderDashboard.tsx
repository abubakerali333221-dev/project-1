
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Calendar as CalendarIcon, ShieldCheck, AlertCircle, Edit2, 
  Trash2, Plus, X, Check, Loader2, BarChart3, Layers, Users, Settings, 
  Save, Shield, Crown, Download, PieChart, Activity, Wallet, Clock, 
  FileSpreadsheet, Briefcase, Zap, Tag, Percent, CreditCard, CheckCircle,
  UserX
} from 'lucide-react';
import { 
  getAllMerchantsFromFirestore, 
  saveProfileToFirestore, 
  deleteMerchantFromFirestore,
  savePlatformSettings,
  saveDiscountCodeToFirestore,
  getAllDiscountCodesFromFirestore,
  deleteDiscountCodeFromFirestore
} from '../services/firebase';
import { Merchant, MarketingEvent, PlatformSettings, DiscountCode } from '../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: any; color: string; trend?: string }> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
          {trend}
        </span>
      )}
    </div>
    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h4 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h4>
  </div>
);

const FounderDashboard: React.FC = () => {
  const { t, lang, events, addEvent, removeEvent, platformSettings, updatePlatformSettings } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'merchants' | 'seasons' | 'pricing' | 'discounts' | 'reports' | 'platform' | 'expired_trials'>('merchants');

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');

  const [editingEvent, setEditingEvent] = useState<MarketingEvent | null>(null);
  const [isAddingNewEvent, setIsAddingNewEvent] = useState(false);

  // Pricing State
  const [tempPrices, setTempPrices] = useState({
    basic: 99,
    pro: 299,
    enterprise: 999
  });

  // Discounts State
  const [coupons, setCoupons] = useState<DiscountCode[]>([]);
  const [newCoupon, setNewCoupon] = useState<Partial<DiscountCode>>({
    code: '',
    type: 'percentage',
    value: 10,
    isActive: true,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        setLoadingData(true);
        try {
          const mData = await getAllMerchantsFromFirestore();
          setMerchants(mData as Merchant[]);
          
          const cData = await getAllDiscountCodesFromFirestore();
          setCoupons(cData as DiscountCode[]);

          if (platformSettings.plans) {
             setTempPrices(platformSettings.plans);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingData(false);
        }
      };
      loadData();
    }
  }, [isAuthenticated, activeTab, platformSettings.plans]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '37193719') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const filteredMerchants = useMemo(() => {
    return merchants.filter(m => {
      const name = m.storeName || '';
      const email = m.email || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesField = selectedField === 'all' || m.businessType === selectedField;
      return matchesSearch && matchesField;
    });
  }, [searchTerm, selectedField, merchants]);

  // منطق فلترة التجار الذين انتهت فترة تجربتهم ولم يشتركوا
  const expiredMerchants = useMemo(() => {
    return merchants.filter(m => {
      if (m.subscriptionStatus === 'active') return false;
      
      // إذا كان مجمداً أو انتهت الـ 24 ساعة
      if (m.subscriptionStatus === 'frozen' || m.subscriptionStatus === 'expired') return true;

      if (m.subscriptionStatus === 'trial' && m.trialStartedAt) {
        const startTime = new Date(m.trialStartedAt).getTime();
        const now = new Date().getTime();
        const diffHours = (now - startTime) / (1000 * 60 * 60);
        return diffHours >= 24;
      }
      return false;
    });
  }, [merchants]);

  const toggleMerchantStatus = async (merchant: Merchant, status: Merchant['subscriptionStatus'], plan?: Merchant['planType']) => {
    const updated = { 
      ...merchant, 
      subscriptionStatus: status, 
      planType: plan || merchant.planType,
      subscriptionEndsAt: status === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };
    setLoadingData(true);
    try {
      await saveProfileToFirestore(merchant.id, updated);
      setMerchants(merchants.map(m => m.id === merchant.id ? updated : m));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdatePrices = async () => {
    setLoadingData(true);
    try {
      await updatePlatformSettings({ 
        ...platformSettings,
        plans: tempPrices 
      });
      alert(t.priceUpdated);
    } catch (err) {
      console.error(err);
      alert(lang === 'ar' ? 'فشل تحديث الأسعار' : 'Failed to update prices');
    } finally {
      setLoadingData(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    
    setLoadingData(true);
    const couponObj: DiscountCode = {
      id: 'c' + Date.now(),
      code: newCoupon.code.toUpperCase(),
      type: newCoupon.type as any,
      value: Number(newCoupon.value),
      isActive: true,
      expiryDate: newCoupon.expiryDate as string
    };

    try {
      await saveDiscountCodeToFirestore(couponObj);
      setCoupons([couponObj, ...coupons]);
      setNewCoupon({ code: '', type: 'percentage', value: 10, isActive: true, expiryDate: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    setLoadingData(true);
    try {
      await deleteDiscountCodeFromFirestore(id);
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const exportMerchantsCSV = () => {
    const headers = [t.storeName, t.email, t.phone, t.businessType, "Plan", t.status, t.createdAt, "Revenue (SAR)"];
    const rows = merchants.map(m => {
       const revenue = m.subscriptionStatus === 'active' ? (m.planType === 'pro' ? tempPrices.pro : m.planType === 'enterprise' ? tempPrices.enterprise : tempPrices.basic) : 0;
       return [
        m.storeName, m.email, m.phone, m.businessType, m.planType, m.subscriptionStatus, m.createdAt, revenue
       ]
    });
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscription_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // تصدير قائمة الذين انتهت تجربتهم فقط
  const exportExpiredCSV = () => {
    const headers = [t.storeName, t.email, t.phone, t.createdAt];
    const rows = expiredMerchants.map(m => [m.storeName, m.email, m.phone, m.createdAt]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expired_trials_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-md bg-white dark:bg-gray-800 rounded-[3rem] border-2 dark:border-gray-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-slate-950 p-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-black tracking-tight">{t.adminLogin}</h2>
            <p className="text-slate-400 text-sm mt-2 font-bold uppercase tracking-widest">{t.adminAccessRequired}</p>
          </div>
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            {error && <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-2"><AlertCircle size={18}/> {t.loginError}</div>}
            <div className="space-y-2 text-start">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t.username || 'Username'}</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="admin" required />
            </div>
            <div className="space-y-2 text-start">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t.password || 'Password'}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-14 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="••••••••" required />
            </div>
            <button type="submit" className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl transition-all">{t.login || 'Authenticate'}</button>
          </form>
        </div>
      </div>
    );
  }

  const globalStats = {
    revenue: merchants.filter(m => m.subscriptionStatus === 'active').reduce((acc, m) => {
        const price = m.planType === 'pro' ? tempPrices.pro : m.planType === 'enterprise' ? tempPrices.enterprise : tempPrices.basic;
        return acc + price;
    }, 0),
    active: merchants.filter(m => m.subscriptionStatus === 'active').length,
    trial: merchants.filter(m => m.subscriptionStatus === 'trial').length,
    growth: "+12%"
  };

  const menuTabs = [
    { id: 'merchants', icon: Users, label: t.merchants },
    { id: 'expired_trials', icon: UserX, label: t.expiredTrials },
    { id: 'seasons', icon: Layers, label: t.seasons },
    { id: 'pricing', icon: Wallet, label: t.managePricing },
    { id: 'discounts', icon: Tag, label: t.discountCodes },
    { id: 'reports', icon: BarChart3, label: t.reports },
    { id: 'platform', icon: Settings, label: t.config }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div className="space-y-2 text-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/40">
               <Shield size={12} /> {t.adminPanel}
            </div>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">{t.adminStats}</h2>
         </div>
         <div className="flex gap-2 p-1.5 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-x-auto no-scrollbar">
            {menuTabs.map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-gray-700'}`}
               >
                  <tab.icon size={16} />
                  {tab.label}
               </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard title={t.totalRevenue} value={`${globalStats.revenue} ${t.sar}`} icon={Wallet} color="bg-emerald-500" trend="+15%" />
         <StatCard title={t.activeSubs} value={globalStats.active} icon={Crown} color="bg-indigo-600" trend={globalStats.growth} />
         <StatCard title={t.trialUsers} value={globalStats.trial} icon={Zap} color="bg-amber-500" />
         <StatCard title={t.systemHealth} value="99.9%" icon={Activity} color="bg-slate-900" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] border-2 dark:border-gray-700 shadow-2xl overflow-hidden">
         {activeTab === 'merchants' && (
            <div className="p-8 space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-start">
                  <div>
                     <h3 className="text-2xl font-black">{t.merchantDirectory}</h3>
                     <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{lang === 'ar' ? 'نظام تتبع حالة التجار النشطين' : 'Active merchants tracking system'}</p>
                  </div>
                  <div className="flex gap-4">
                     <div className="relative">
                        <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} size={18} />
                        <input 
                           type="text" 
                           value={searchTerm}
                           onChange={e => setSearchTerm(e.target.value)}
                           className={`w-64 h-14 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl ${lang === 'ar' ? 'pr-12' : 'pl-12'} font-bold text-sm focus:ring-2 focus:ring-indigo-500`}
                           placeholder={t.searchStore}
                        />
                     </div>
                     <button onClick={exportMerchantsCSV} className="h-14 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-black transition-all">
                        <FileSpreadsheet size={18} /> {t.exportCSV}
                     </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-start">
                     <thead className="bg-slate-50 dark:bg-gray-900/50 border-y dark:border-gray-700">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <th className="px-6 py-5 text-start">{t.storeName}</th>
                           <th className="px-6 py-5 text-start">{lang === 'ar' ? 'باقة الاشتراك' : 'Subscription Plan'}</th>
                           <th className="px-6 py-5 text-start">{t.status}</th>
                           <th className="px-6 py-5 text-start">{t.usageLimit || 'Usage'}</th>
                           <th className="px-6 py-5 text-start">{t.actions}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y dark:divide-gray-700">
                        {filteredMerchants.map((m) => (
                           <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xl shadow-inner">
                                       {m.storeName?.charAt(0) || 'S'}
                                    </div>
                                    <div className="text-start">
                                       <p className="font-black text-slate-900 dark:text-white">{m.storeName}</p>
                                       <p className="text-xs font-bold text-slate-400">{m.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex flex-col gap-1 text-start">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${m.planType === 'enterprise' ? 'text-purple-600' : m.planType === 'pro' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                       {t[`plan${m.planType?.charAt(0).toUpperCase()}${m.planType?.slice(1)}` as keyof typeof t] || m.planType}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                       <Clock size={10} /> {m.subscriptionEndsAt ? `${t.endsAt} ${new Date(m.subscriptionEndsAt).toLocaleDateString()}` : (lang === 'ar' ? 'لا يوجد تاريخ انتهاء' : 'No Expiry')}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex gap-1.5">
                                    <button 
                                       onClick={() => toggleMerchantStatus(m, 'active', 'pro')}
                                       className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${m.subscriptionStatus === 'active' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-gray-900 text-slate-400 hover:text-indigo-600'}`}
                                    >
                                       {t.active}
                                    </button>
                                    <button 
                                       onClick={() => toggleMerchantStatus(m, 'frozen')}
                                       className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${m.subscriptionStatus === 'frozen' ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-gray-900 text-slate-400 hover:text-rose-500'}`}
                                    >
                                       {t.freeze}
                                    </button>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="w-32 space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                                       <span>{t.contentUsage}</span>
                                       <span>{m.totalGeneratedContent || 0}/100</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                       <div className="h-full bg-indigo-500" style={{ width: `${Math.min((m.totalGeneratedContent || 0), 100)}%` }}></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-2">
                                    <button className="p-2.5 bg-slate-50 dark:bg-gray-900 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Edit2 size={16} /></button>
                                    <button onClick={() => deleteMerchantFromFirestore(m.id)} className="p-2.5 bg-slate-50 dark:bg-gray-900 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'expired_trials' && (
            <div className="p-8 space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-start">
                  <div>
                     <h3 className="text-2xl font-black">{t.expiredTrials}</h3>
                     <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{lang === 'ar' ? 'قائمة المتاجر التي انتهت تجربتها ولم تشترك' : 'Merchants with expired trials and no subscription'}</p>
                  </div>
                  <button onClick={exportExpiredCSV} className="h-14 px-6 bg-rose-600 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-rose-700 transition-all shadow-lg">
                     <FileSpreadsheet size={18} /> {t.exportCSV}
                  </button>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-start">
                     <thead className="bg-slate-50 dark:bg-gray-900/50 border-y dark:border-gray-700">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <th className="px-6 py-5 text-start">{t.storeName}</th>
                           <th className="px-6 py-5 text-start">{t.phone}</th>
                           <th className="px-6 py-5 text-start">{t.email}</th>
                           <th className="px-6 py-5 text-start">{t.createdAt}</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y dark:divide-gray-700">
                        {expiredMerchants.map((m) => (
                           <tr key={m.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors">
                              <td className="px-6 py-5 font-black text-slate-900 dark:text-white">
                                 {m.storeName}
                              </td>
                              <td className="px-6 py-5 font-bold text-slate-600 dark:text-gray-300">
                                 {m.phone}
                              </td>
                              <td className="px-6 py-5 font-bold text-slate-600 dark:text-gray-300">
                                 {m.email}
                              </td>
                              <td className="px-6 py-5 font-bold text-slate-400">
                                 {m.createdAt}
                              </td>
                           </tr>
                        ))}
                        {expiredMerchants.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-20 text-center opacity-30">
                               <UserX size={48} className="mx-auto mb-4" />
                               <p className="font-black uppercase tracking-widest">{lang === 'ar' ? 'لا يوجد تجار حالياً' : 'No expired trials yet'}</p>
                            </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {activeTab === 'pricing' && (
            <div className="p-10 space-y-10 text-start">
               <div>
                  <h3 className="text-3xl font-black">{t.managePricing}</h3>
                  <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{t.plansPricing}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { key: 'basic', label: t.planBasic, icon: Zap, color: 'bg-slate-100 text-slate-600' },
                    { key: 'pro', label: t.planPro, icon: Crown, color: 'bg-indigo-50 text-indigo-600' },
                    { key: 'enterprise', icon: Shield, label: t.planEnterprise, color: 'bg-purple-50 text-purple-600' }
                  ].map((plan) => (
                    <div key={plan.key} className="bg-slate-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border-2 dark:border-gray-700 space-y-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.color}`}>
                             <plan.icon size={24} />
                          </div>
                          <h4 className="font-black text-xl">{plan.label}</h4>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'السعر الشهري (SAR)' : 'Monthly Price (SAR)'}</label>
                          <input 
                            type="number" 
                            value={tempPrices[plan.key as keyof typeof tempPrices]}
                            onChange={(e) => setTempPrices({...tempPrices, [plan.key]: Number(e.target.value)})}
                            className="w-full h-14 bg-white dark:bg-gray-800 border-2 border-slate-100 dark:border-gray-700 rounded-2xl px-6 font-black text-lg focus:ring-2 focus:ring-indigo-500" 
                          />
                       </div>
                    </div>
                  ))}
               </div>

               <button 
                onClick={handleUpdatePrices}
                disabled={loadingData}
                className="px-12 py-5 gradient-bg text-white rounded-[2rem] font-black text-lg shadow-xl flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-50"
               >
                  {loadingData ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                  {t.updatePrice}
               </button>
            </div>
         )}

         {activeTab === 'discounts' && (
            <div className="p-10 space-y-12 text-start">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                     <h3 className="text-3xl font-black">{t.discountCodes}</h3>
                     <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{t.activeCoupons}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 bg-slate-50 dark:bg-gray-900/50 p-8 rounded-[3rem] border-2 dark:border-gray-700 space-y-6 h-fit">
                     <h4 className="text-xl font-black flex items-center gap-2">
                        <Plus className="text-indigo-600" />
                        {t.newCoupon}
                     </h4>
                     <form onSubmit={handleAddCoupon} className="space-y-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.couponCode}</label>
                           <input 
                             type="text" 
                             value={newCoupon.code}
                             onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                             placeholder="EID2025" 
                             className="w-full h-14 bg-white dark:bg-gray-800 border-0 rounded-2xl px-6 font-black text-lg focus:ring-2 focus:ring-indigo-500 uppercase" 
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.discountType}</label>
                           <select 
                             value={newCoupon.type}
                             onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})}
                             className="w-full h-14 bg-white dark:bg-gray-800 border-0 rounded-2xl px-6 font-black text-sm focus:ring-2 focus:ring-indigo-500"
                           >
                              <option value="percentage">{t.percentage}</option>
                              <option value="fixed">{t.fixedAmount}</option>
                           </select>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.discountValue}</label>
                           <div className="relative">
                              <input 
                                type="number" 
                                value={newCoupon.value}
                                onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})}
                                className="w-full h-14 bg-white dark:bg-gray-800 border-0 rounded-2xl px-6 font-black text-lg focus:ring-2 focus:ring-indigo-500" 
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">
                                 {newCoupon.type === 'percentage' ? '%' : 'SAR'}
                              </div>
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.expiryDate}</label>
                           <input 
                             type="date" 
                             value={newCoupon.expiryDate}
                             onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                             className="w-full h-14 bg-white dark:bg-gray-800 border-0 rounded-2xl px-6 font-black text-sm focus:ring-2 focus:ring-indigo-500" 
                           />
                        </div>
                        <button type="submit" className="w-full h-16 gradient-bg text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2">
                           <CheckCircle size={20} /> {t.addCoupon}
                        </button>
                     </form>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coupons.map((coupon) => (
                           <div key={coupon.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border-2 dark:border-gray-700 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Tag size={20} />
                                 </div>
                                 <div>
                                    <p className="font-black text-lg tracking-tight uppercase">{coupon.code}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                       {coupon.value}{coupon.type === 'percentage' ? '%' : ' SAR'} {lang === 'ar' ? 'خصم' : 'OFF'}
                                    </p>
                                 </div>
                              </div>
                              <div className="text-end flex items-center gap-3">
                                 <div className="hidden md:block">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">{t.expiryDate}</p>
                                    <p className="text-xs font-black">{coupon.expiryDate}</p>
                                 </div>
                                 <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-2.5 bg-slate-50 dark:bg-gray-900 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        ))}
                        {coupons.length === 0 && (
                           <div className="col-span-full py-20 text-center opacity-30 border-2 border-dashed rounded-[3rem] dark:border-gray-700">
                              <Percent size={48} className="mx-auto mb-4" />
                              <p className="font-black uppercase tracking-widest">{lang === 'ar' ? 'لا يوجد أكواد نشطة' : 'No active coupons'}</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}
         
         {activeTab === 'reports' && (
            <div className="p-10 space-y-12">
               <div className="flex items-center justify-between text-start">
                  <div>
                     <h3 className="text-3xl font-black">{t.reportsHub}</h3>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{lang === 'ar' ? 'تحليل أداء المنصة وذكاء الأعمال' : 'Platform performance & BI analysis'}</p>
                  </div>
                  <button onClick={exportMerchantsCSV} className="px-8 py-4 gradient-bg text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl">
                     <Download size={20} /> {lang === 'ar' ? 'تصدير التقرير المالي (SAR)' : 'Export Master Finance Report'}
                  </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border dark:border-gray-700 space-y-8">
                     <h4 className="text-xl font-black flex items-center gap-3 text-start">
                        <PieChart className="text-indigo-600" />
                        {t.planDistribution}
                     </h4>
                     <div className="space-y-6">
                        {[
                           { label: t.planPro, count: globalStats.active, color: 'bg-indigo-600', percent: Math.round((globalStats.active / Math.max(merchants.length, 1)) * 100) },
                           { label: lang === 'ar' ? 'وضع التجربة' : 'Trial Mode', count: globalStats.trial, color: 'bg-amber-500', percent: Math.round((globalStats.trial / Math.max(merchants.length, 1)) * 100) },
                           { label: lang === 'ar' ? 'المجانية' : 'Basic Free', count: merchants.length - globalStats.active - globalStats.trial, color: 'bg-slate-400', percent: Math.round(((merchants.length - globalStats.active - globalStats.trial) / Math.max(merchants.length, 1)) * 100) }
                        ].map((plan, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between font-black text-xs text-slate-500 uppercase">
                                 <span>{plan.label}</span>
                                 <span>{plan.percent}% ({plan.count})</span>
                              </div>
                              <div className="h-3 w-full bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                                 <div className={`h-full ${plan.color} shadow-lg`} style={{ width: `${plan.percent}%` }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border dark:border-gray-700 space-y-8">
                     <h4 className="text-xl font-black flex items-center gap-3 text-start">
                        <Briefcase className="text-purple-600" />
                        {t.activityHeatmap}
                     </h4>
                     <div className="grid grid-cols-4 gap-4 h-48">
                        {Array.from({ length: 12 }).map((_, i) => (
                           <div key={i} className="flex flex-col justify-end gap-2">
                              <div 
                                 className="w-full bg-indigo-600/40 rounded-xl hover:bg-indigo-600 transition-all cursor-pointer" 
                                 style={{ height: `${Math.random() * 80 + 20}%` }}
                              ></div>
                              <span className="text-[8px] font-black text-slate-400 text-center uppercase">M{i+1}</span>
                           </div>
                        ))}
                     </div>
                     <p className="text-xs font-bold text-slate-400 text-center leading-relaxed">
                        {lang === 'ar' ? 'تظهر البيانات زيادة بنسبة ٤٥٪ في مهام الذكاء الاصطناعي خلال أسبوع يوم التأسيس.' : 'Data shows a 45% increase in AI tasks during Founding Day week.'}
                     </p>
                  </div>
               </div>
            </div>
         )}
         
         {activeTab === 'platform' && (
            <div className="p-10 space-y-10 max-w-2xl text-start">
               <div className="space-y-2">
                  <h3 className="text-3xl font-black">{t.platformSettings}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{lang === 'ar' ? 'الإعدادات العامة وإدارة الأنظمة' : 'Global configuration & system management'}</p>
               </div>
               
               <div className="bg-slate-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border dark:border-gray-700 space-y-8">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                        <div>
                           <p className="font-black text-sm">{t.trialDuration}</p>
                           <p className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'الفترة التجريبية القياسية للمشتركين الجدد' : 'Standard trial period for new users'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="number" defaultValue="24" className="w-16 h-10 bg-slate-50 dark:bg-gray-900 border-0 rounded-lg text-center font-black" />
                           <span className="text-xs font-bold text-slate-400">{t.hours}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                        <div>
                           <p className="font-black text-sm">{t.maintenanceMode}</p>
                           <p className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'تحويل كافة لوحات التجار لوضع القراءة فقط' : 'Put all merchant panels in read-only mode'}</p>
                        </div>
                        <button className="w-12 h-6 bg-slate-200 dark:bg-gray-700 rounded-full relative">
                           <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                        </button>
                     </div>
                  </div>

                  <button className="w-full h-16 gradient-bg text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-3">
                     <Save size={20} /> {t.saveSettings}
                  </button>
               </div>
            </div>
         )}
         
         {activeTab === 'seasons' && (
            <div className="p-10 space-y-8">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-start">
                  <div>
                     <h3 className="text-3xl font-black">{lang === 'ar' ? 'إدارة المواسم التسويقية' : 'Marketing Seasons Hub'}</h3>
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{lang === 'ar' ? 'مزامنة الأحداث العالمية مع كافة تقاويم التجار' : 'Sync global events with all merchant calendars'}</p>
                  </div>
                  <button 
                     onClick={() => {
                        setEditingEvent({ id: 'e' + Date.now(), title: { ar: '', en: '' }, date: new Date().toISOString().split('T')[0], type: 'commercial', priority: 'medium', description: { ar: '', en: '' } });
                        setIsAddingNewEvent(true);
                     }}
                     className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl"
                  >
                     <Plus size={20} /> {t.newSeason}
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((ev) => (
                     <div key={ev.id} className="bg-slate-50 dark:bg-gray-900/50 p-6 rounded-[2.5rem] border-2 dark:border-gray-700 space-y-4 group hover:border-indigo-500 transition-all text-start">
                        <div className="flex items-center justify-between">
                           <div className={`p-3 rounded-2xl ${ev.priority === 'high' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                              <CalendarIcon size={20} />
                           </div>
                           <div className="flex gap-1">
                              <button onClick={() => setEditingEvent(ev)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => removeEvent(ev.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                           </div>
                        </div>
                        <div>
                           <h4 className="font-black text-lg">{ev.title[lang]}</h4>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ev.date} • {ev.type}</p>
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                           {ev.description[lang]}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>

      {editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-2 dark:border-gray-700">
            <div className="p-8 border-b dark:border-gray-700 flex justify-between items-center bg-slate-50 dark:bg-gray-900/50">
              <h3 className="text-2xl font-black">{isAddingNewEvent ? t.newSeason : t.editSeason}</h3>
              <button onClick={() => { setEditingEvent(null); setIsAddingNewEvent(false); }} className="p-3 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addEvent(editingEvent); setEditingEvent(null); }} className="p-8 space-y-6 text-start">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t.titleAr}</label>
                  <input type="text" required value={editingEvent.title.ar} onChange={e => setEditingEvent({...editingEvent, title: {...editingEvent.title, ar: e.target.value}})} className="w-full h-14 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t.titleEn}</label>
                  <input type="text" required value={editingEvent.title.en} onChange={e => setEditingEvent({...editingEvent, title: {...editingEvent.title, en: e.target.value}})} className="w-full h-14 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t.date}</label>
                  <input type="date" required value={editingEvent.date} onChange={e => setEditingEvent({...editingEvent, date: e.target.value})} className="w-full h-14 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{t.priority}</label>
                  <select value={editingEvent.priority} onChange={e => setEditingEvent({...editingEvent, priority: e.target.value as any})} className="w-full h-14 bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl px-6 font-bold appearance-none">
                    <option value="low">{lang === 'ar' ? 'منخفضة' : 'Low'}</option>
                    <option value="medium">{lang === 'ar' ? 'متوسطة' : 'Medium'}</option>
                    <option value="high">{lang === 'ar' ? 'عالية' : 'High'}</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full h-16 gradient-bg text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl mt-4">
                 <Check size={24} /> {t.syncCloud}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderDashboard;

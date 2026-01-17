
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, MerchantProfile, MarketingEvent, GeneratedContent, PlatformSettings } from '../types';
import { translations } from '../translations';
import { MOCK_EVENTS } from '../constants';
import { 
  saveProfileToFirestore, 
  getProfileFromFirestore, 
  saveEventToFirestore, 
  getAllEventsFromFirestore, 
  deleteEventFromFirestore,
  saveContentToFirestore,
  getMerchantContentsFromFirestore,
  getPlatformSettings,
  savePlatformSettings as saveSettingsToFirebase
} from '../services/firebase';

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  profile: MerchantProfile;
  updateProfile: (p: Partial<MerchantProfile>) => void;
  t: typeof translations.ar;
  events: MarketingEvent[];
  setEvents: (events: MarketingEvent[]) => void;
  addEvent: (event: MarketingEvent) => void;
  removeEvent: (eventId: string) => void;
  contents: GeneratedContent[];
  addContent: (c: GeneratedContent) => void;
  isLoading: boolean;
  // Navigation State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  preselectedEventId: string | null;
  setPreselectedEventId: (id: string | null) => void;
  // Platform Settings
  platformSettings: PlatformSettings;
  updatePlatformSettings: (s: PlatformSettings) => Promise<void>;
  // Trial Logic
  isFrozen: boolean;
  // Demo Mode Helper
  loginAsDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const MERCHANT_ID = "main_merchant_store";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ar');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [contents, setContents] = useState<GeneratedContent[]>([]);
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [preselectedEventId, setPreselectedEventId] = useState<string | null>(null);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({ 
    socialLinks: {
      instagram: 'https://instagram.com',
      x: 'https://x.com',
      tiktok: 'https://tiktok.com',
      youtube: 'https://youtube.com',
      linkedin: 'https://linkedin.com'
    } 
  });
  
  const [profile, setProfile] = useState<MerchantProfile>({
    storeName: 'Smart Reminder',
    businessType: 'retail',
    country: 'SA',
    phone: '',
    email: '',
    primaryColor: '#6366f1',
    secondaryColor1: '#a855f7',
    secondaryColor2: '#f43f5e',
    platforms: ['Instagram', 'Youtube'],
    subscriptionStatus: 'trial',
    trialStartedAt: new Date().toISOString()
  });

  const [isFrozen, setIsFrozen] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const dbProfile = await getProfileFromFirestore(MERCHANT_ID);
        if (dbProfile) setProfile(dbProfile as MerchantProfile);

        const dbEvents = await getAllEventsFromFirestore();
        if (dbEvents && dbEvents.length > 0) {
          setEvents(dbEvents as MarketingEvent[]);
        } else {
          setEvents(MOCK_EVENTS);
          for (const event of MOCK_EVENTS) {
            await saveEventToFirestore(event);
          }
        }

        const dbContents = await getMerchantContentsFromFirestore(MERCHANT_ID);
        if (dbContents) setContents(dbContents as GeneratedContent[]);

        const dbPlatformSettings = await getPlatformSettings();
        if (dbPlatformSettings && Object.keys(dbPlatformSettings.socialLinks || {}).length > 0) {
          setPlatformSettings(dbPlatformSettings as PlatformSettings);
        }

      } catch (error) {
        console.error("Error loading data from Firestore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Trial Expiration Logic
  useEffect(() => {
    if (isLoggedIn && profile.subscriptionStatus === 'trial' && profile.trialStartedAt) {
      const startTime = new Date(profile.trialStartedAt).getTime();
      const now = new Date().getTime();
      const diffHours = (now - startTime) / (1000 * 60 * 60);

      if (diffHours >= 24) {
        setIsFrozen(true);
      } else {
        setIsFrozen(false);
      }
    } else if (isLoggedIn && profile.subscriptionStatus === 'frozen') {
      setIsFrozen(true);
    } else {
      setIsFrozen(false);
    }
  }, [isLoggedIn, profile]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const updateProfile = async (p: Partial<MerchantProfile>) => {
    const newProfile = { ...profile, ...p };
    setProfile(newProfile);
    await saveProfileToFirestore(MERCHANT_ID, newProfile);
  };

  const addContent = async (c: GeneratedContent) => {
    setContents(prev => [c, ...prev]);
    await saveContentToFirestore(MERCHANT_ID, c);
  };

  const addEvent = async (event: MarketingEvent) => {
    setEvents(prev => [event, ...prev]);
    await saveEventToFirestore(event);
  };

  const removeEvent = async (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    await deleteEventFromFirestore(eventId);
  };

  const updatePlatformSettings = async (s: PlatformSettings) => {
    setPlatformSettings(s);
    await saveSettingsToFirebase(s);
  };

  const loginAsDemo = () => {
    setProfile({
      storeName: lang === 'ar' ? 'أزياء النخبة' : 'Elite Fashion',
      businessType: 'fashion',
      country: 'SA',
      phone: '+966500000000',
      email: 'demo@elitefashion.com',
      logo: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1964&auto=format&fit=crop',
      primaryColor: '#6366f1',
      secondaryColor1: '#a855f7',
      secondaryColor2: '#f43f5e',
      platforms: ['Instagram', 'Snapchat', 'TikTok'],
      subscriptionStatus: 'trial',
      trialStartedAt: new Date().toISOString()
    });
    
    // Add dummy content for a full-looking demo dashboard
    setContents([
      { id: 'd1', type: 'image', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop', createdAt: new Date().toISOString() },
      { id: 'd2', type: 'copy', text: 'اكتشفوا تشكيلة يوم التأسيس الجديدة لدى أزياء النخبة. عراقة الماضي بتصاميم الحاضر.', createdAt: new Date().toISOString() },
    ]);

    setActiveTab('demo_preview');
    setIsLoggedIn(true);
  };

  const t = translations[lang];

  return (
    <AppContext.Provider value={{ 
      lang, setLang, 
      isDarkMode, setIsDarkMode,
      isLoggedIn, setIsLoggedIn,
      profile, updateProfile, 
      t, 
      events,
      setEvents,
      addEvent,
      removeEvent,
      contents, addContent,
      isLoading,
      activeTab,
      setActiveTab,
      preselectedEventId,
      setPreselectedEventId,
      platformSettings,
      updatePlatformSettings,
      isFrozen,
      loginAsDemo
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};


import { MarketingEvent, Merchant } from './types';

export const MOCK_EVENTS: MarketingEvent[] = [
  {
    id: 'feb-1',
    title: { ar: 'بداية حملات شهر فبراير', en: 'February Campaigns Start' },
    date: '2026-02-01',
    type: 'commercial',
    priority: 'low',
    description: { ar: 'بداية التخطيط التسويقي لشهر فبراير المليء بالمناسبات.', en: 'Start of marketing planning for a busy February.' }
  },
  {
    id: 'feb-2',
    title: { ar: 'يوم البيتزا العالمي', en: 'World Pizza Day' },
    date: '2026-02-09',
    type: 'global',
    priority: 'low',
    description: { ar: 'فرصة رائعة للمطاعم لتقديم خصومات خاصة.', en: 'Great opportunity for restaurants to offer special discounts.' }
  },
  {
    id: 'feb-3',
    title: { ar: 'تجهيزات ما قبل رمضان', en: 'Pre-Ramadan Prep' },
    date: '2026-02-12',
    type: 'commercial',
    priority: 'medium',
    description: { ar: 'بدء التسوق للمستلزمات الرمضانية والتمور.', en: 'Starting shopping for Ramadan supplies and dates.' }
  },
  {
    id: 'feb-4',
    title: { ar: 'يوم الحب العالمي', en: 'Valentine\'s Day' },
    date: '2026-02-14',
    type: 'global',
    priority: 'medium',
    description: { ar: 'موسم ضخم للهدايا، العطور، والزهور.', en: 'Huge season for gifts, perfumes, and flowers.' }
  },
  {
    id: '2',
    title: { ar: 'موسم رمضان المبارك', en: 'Ramadan Season' },
    date: '2026-02-18', 
    type: 'religious',
    priority: 'high',
    description: { ar: 'أكبر موسم استهلاكي وتفاعلي في السنة، يتطلب حملات مكثفة وعروض رمضانية.', en: 'The biggest consumer and engagement season of the year.' }
  },
  {
    id: '1',
    title: { ar: 'يوم التأسيس السعودي', en: 'Saudi Founding Day' },
    date: '2026-02-22',
    type: 'national',
    priority: 'high',
    description: { ar: 'ذكرى تأسيس الدولة السعودية الأولى - ذروة تسويقية كبرى تبرز الهوية الوطنية.', en: 'Founding of the first Saudi state - Major marketing peak highlighting national identity.' }
  },
  {
    id: 'feb-5',
    title: { ar: 'تخفيضات نهاية فبراير', en: 'End of Feb Clearances' },
    date: '2026-02-26',
    type: 'commercial',
    priority: 'medium',
    description: { ar: 'تصفية المخزون قبل دخول المواسم الربيعية.', en: 'Inventory clearance before spring seasons.' }
  },
  {
    id: '3',
    title: { ar: 'يوم الأم العالمي', en: 'Mother\'s Day' },
    date: '2026-03-21',
    type: 'global',
    priority: 'medium',
    description: { ar: 'موسم الهدايا والتقدير، مثالي لقطاعات العطور، الذهب، والزهور.', en: 'Season of gifts and appreciation, ideal for perfumes, gold, and flowers.' }
  },
  {
    id: '4',
    title: { ar: 'يوم الفطر السعيد', en: 'Eid Al-Fitr Day' },
    date: '2026-03-20', 
    type: 'religious',
    priority: 'high',
    description: { ar: 'موسم الاحتفالات، الملابس الجديدة، والحلويات والهدايا.', en: 'Season for celebrations, new clothes, sweets and gifts.' }
  },
  {
    id: '7',
    title: { ar: 'يوم الأضحى المبارك', en: 'Eid Al-Adha Day' },
    date: '2026-05-27', 
    type: 'religious',
    priority: 'high',
    description: { ar: 'موسم السفر، الضيافة، والولائم الكبرى.', en: 'Travel, hospitality, and major banquets season.' }
  },
  {
    id: '9',
    title: { ar: 'اليوم الوطني السعودي', en: 'Saudi National Day' },
    date: '2026-09-23',
    type: 'national',
    priority: 'high',
    description: { ar: 'يوم الاحتفاء بالوطن، عروض "96" الشهيرة والفعاليات في كل مكان.', en: 'Celebrating the nation with famous "96" offers and widespread events.' }
  },
  {
    id: '12',
    title: { ar: 'يوم الجمعة البيضاء', en: 'White Friday' },
    date: '2026-11-27',
    type: 'commercial',
    priority: 'high',
    description: { ar: 'أقوى موسم مبيعات إلكترونية وتصفيات سنوية.', en: 'The strongest annual e-commerce sales and clearance season.' }
  }
];

export const BUSINESS_TYPES = [
  'retail', 'fashion', 'food', 'tech', 'beauty', 'services'
];

export const SOCIAL_PLATFORMS = [
  'Instagram', 'X', 'TikTok', 'Snapchat', 'Facebook', 'WhatsApp'
];

// Fix: Adding missing secondaryColor1 and secondaryColor2 to MOCK_MERCHANTS to satisfy Merchant type requirements
export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    storeName: 'أزياء النخبة',
    businessType: 'fashion',
    country: 'SA',
    phone: '+966501234567',
    email: 'info@elitefashion.com',
    primaryColor: '#8b5cf6',
    secondaryColor1: '#a855f7',
    secondaryColor2: '#f43f5e',
    platforms: ['Instagram', 'Snapchat'],
    createdAt: '2024-01-15',
    status: 'active'
  }
];

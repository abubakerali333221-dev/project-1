export type Language = 'ar' | 'en';

export interface SubscriptionPlan {
  id: string;
  name: { ar: string; en: string };
  price: number;
  features: { ar: string[]; en: string[] };
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  expiryDate: string;
}

export interface MerchantProfile {
  storeName: string;
  businessType: string;
  country: string;
  phone: string;
  email: string;
  password?: string;
  logo?: string;
  primaryColor: string;
  secondaryColor1: string;
  secondaryColor2: string;
  platforms: string[];
  trialStartedAt?: string;
  subscriptionStatus?: 'trial' | 'active' | 'frozen' | 'expired';
  planType?: 'basic' | 'pro' | 'enterprise';
  subscriptionEndsAt?: string;
  totalGeneratedContent?: number;
  lastLoginAt?: string;
}

export interface Merchant extends MerchantProfile {
  id: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface PlatformSettings {
  socialLinks: {
    instagram?: string;
    x?: string;
    tiktok?: string;
    youtube?: string;
    facebook?: string;
    linkedin?: string;
  };
  globalMaintenance?: boolean;
  trialDurationHours?: number;
  plans?: {
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export interface MarketingEvent {
  id: string;
  title: { ar: string; en: string };
  date: string;
  type: 'religious' | 'national' | 'commercial' | 'global' | 'custom';
  description: { ar: string; en: string };
  priority: 'high' | 'medium' | 'low';
}

export interface GeneratedContent {
  id: string;
  type: 'image' | 'video' | 'copy';
  url?: string;
  text?: string;
  createdAt: string;
  eventId?: string;
}
// Event Types
export enum EventType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
  SPECIAL = 'SPECIAL'
}

export enum EventCategory {
  PUJA = 'PUJA',
  UTSAV = 'UTSAV',
  KIRTAN = 'KIRTAN',
  PRAVACHAN = 'PRAVACHAN',
  SEVA = 'SEVA'
}

export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface BilingualText {
  marathi: string;
  english: string;
}

export interface SevaOption {
  name: string;
  amount: number;
  description: string;
}

export interface Event {
  id: string;
  title: BilingualText;
  description: BilingualText;
  eventType: EventType;
  category: EventCategory;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  venue: string;
  images: string[];
  requiresRegistration: boolean;
  maxParticipants?: number;
  registrationFee: number;
  prasadAvailable: boolean;
  sevaOptions: SevaOption[];
  status: EventStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Donation Types
export enum DonationCategory {
  GENERAL = 'GENERAL',
  ANNA_DAAN = 'ANNA_DAAN',
  GO_SEVA = 'GO_SEVA',
  VIDYA_DAAN = 'VIDYA_DAAN',
  AUSHADH_SEVA = 'AUSHADH_SEVA',
  TEMPLE_RENOVATION = 'TEMPLE_RENOVATION',
  FESTIVAL_SPONSOR = 'FESTIVAL_SPONSOR',
  DAILY_PUJA = 'DAILY_PUJA'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface DonorInfo {
  name: string;
  email: string;
  phone: string;
  address?: string;
  panNumber?: string;
  isAnonymous: boolean;
}

export interface Donation {
  id: string;
  donor: DonorInfo;
  category: DonationCategory;
  subcategory?: string;
  amount: number;
  currency: string;
  inMemoryOf?: string;
  occasion?: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  receiptNumber?: string;
  receipt80G: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DonationCreateRequest {
  donor: DonorInfo;
  category: DonationCategory;
  subcategory?: string;
  amount: number;
  inMemoryOf?: string;
  occasion?: string;
  receipt80G: boolean;
}

// Panchang Types
export interface TithiInfo {
  name: string;
  paksha: string;
  number: number;
  endTime?: string;
}

export interface NakshatraInfo {
  name: string;
  number: number;
  endTime?: string;
}

export interface TimePeriod {
  start: string;
  end: string;
}

export interface PanchangData {
  date: string;
  weekday: string;
  weekdayEnglish: string;
  marathiMonth: string;
  marathiYear: number;
  tithi: TithiInfo;
  nakshatra: NakshatraInfo;
  yoga: { name: string };
  karana: { name: string };
  sunrise: string;
  sunset: string;
  moonrise?: string;
  rahuKaal: TimePeriod;
  isEkadashi: boolean;
  isPurnima: boolean;
  isAmavasya: boolean;
  festival?: string;
  festivalEnglish?: string;
}

export interface Festival {
  date: string;
  name: string;
  englishName: string;
  marathiMonth: string;
  tithi: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TEMPLE_MANAGER = 'TEMPLE_MANAGER',
  CONTENT_EDITOR = 'CONTENT_EDITOR',
  SEVA_COORDINATOR = 'SEVA_COORDINATOR',
  ACCOUNTANT = 'ACCOUNTANT'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  profile: {
    name: string;
    phone?: string;
    designation?: string;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Dashboard Types
export interface DashboardStats {
  donations: {
    today: { amount: number; count: number };
    thisWeek: { amount: number; count: number };
    thisMonth: { amount: number; count: number };
    byCategory: Array<{ category: string; amount: number; count: number }>;
  };
  events: {
    upcoming: number;
    today: Array<{ id: string; title: BilingualText; startTime: string; venue: string }>;
  };
  recentDonations: Array<{
    id: string;
    donor: string;
    amount: number;
    category: string;
    date: string;
  }>;
}

// Category Labels
export const DonationCategoryLabels: Record<DonationCategory, BilingualText> = {
  [DonationCategory.GENERAL]: { marathi: 'सामान्य देणगी', english: 'General Donation' },
  [DonationCategory.ANNA_DAAN]: { marathi: 'अन्नदान', english: 'Food Donation' },
  [DonationCategory.GO_SEVA]: { marathi: 'गोसेवा', english: 'Cow Service' },
  [DonationCategory.VIDYA_DAAN]: { marathi: 'विद्यादान', english: 'Education' },
  [DonationCategory.AUSHADH_SEVA]: { marathi: 'औषधसेवा', english: 'Medical Aid' },
  [DonationCategory.TEMPLE_RENOVATION]: { marathi: 'मंदिर जीर्णोद्धार', english: 'Temple Renovation' },
  [DonationCategory.FESTIVAL_SPONSOR]: { marathi: 'उत्सव प्रायोजकत्व', english: 'Festival Sponsorship' },
  [DonationCategory.DAILY_PUJA]: { marathi: 'नित्य पूजा', english: 'Daily Puja' },
};

export const EventCategoryLabels: Record<EventCategory, BilingualText> = {
  [EventCategory.PUJA]: { marathi: 'पूजा', english: 'Puja' },
  [EventCategory.UTSAV]: { marathi: 'उत्सव', english: 'Festival' },
  [EventCategory.KIRTAN]: { marathi: 'कीर्तन', english: 'Kirtan' },
  [EventCategory.PRAVACHAN]: { marathi: 'प्रवचन', english: 'Discourse' },
  [EventCategory.SEVA]: { marathi: 'सेवा', english: 'Service' },
};

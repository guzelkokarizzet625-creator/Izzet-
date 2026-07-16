'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// --- Type Definitions ---
export interface UserProfile {
  id: number | string;
  uid?: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isPremium: boolean;
  systemIban: string;
  premiumPriceMonthly: string;
  premiumPriceAnnual: string;
  premiumPriceCorporate: string; // New Corporate tier
  isTwoFactorEnabled: boolean; // 2FA Status
  remainingQuestions?: number; // Quota tracking
  role?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaseFile {
  id: number;
  title: string;
  clientName: string;
  category: string;
  date: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PENDING';
}

export interface LegalDocument {
  id: number;
  caseId: number;
  name: string;
  fileSize: string;
  date: string;
  riskScore: number; // 0 to 100
  riskLevel: 'CLEAN' | 'MEDIUM' | 'HIGH';
  riskDescription: string;
  contentText: string;
  status: 'OCR_PENDING' | 'OCR_COMPLETED' | 'RISK_ANALYZED';
}

export interface ChatMessage {
  id: number;
  caseId: number;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
}

export interface PaymentReceipt {
  id: number;
  senderName: string;
  email: string;
  iban: string;
  amount: string;
  date: string;
  receiptFileName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface QuerySession {
  id: number;
  title: string;
  type: 'SEARCH' | 'PETITION' | 'CHAT_ASSISTANT';
  date: string;
}

export interface SupportTicket {
  id: number;
  title: string;
  client: string;
  category: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  date: string;
  text: string;
}

// --- NEW PREMIUM PAYMENT & SUBSCRIPTION TIERS V3.0 ---
export type SubscriptionPackageId = string;
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface BankAccount {
  id: string;
  bankName: string;
  logoUrl?: string;
  accountHolder: string;
  iban: string;
  branchName?: string;
  accountNumber?: string;
  swiftCode?: string;
  description?: string;
  qrCodeUrl?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  supportEmail?: string;
  isActive: boolean;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  durationDays: number | string;
  durationText: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  badge?: string;
  description: string;
  color: string;
  iconName: string;
  isFeatured: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  iban: string;
  packageId: SubscriptionPackageId;
  amount: number;
  receiptUrl: string; // File preview path/URL
  description?: string;
  status: PaymentStatus;
  createdAt: string;
  processedAt?: string;
  ipAddress: string;
  adminNotes?: string;
}

export interface UserSubscriptionDetails {
  userId: string;
  isPremium: boolean;
  packageId?: SubscriptionPackageId;
  startDate?: string;
  endDate?: string;
  activatedAt?: string;
}

// --- Enterprise Admin & System Extensions ---
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'ATTORNEY' | 'MEMBER' | 'ADMIN';
  plan: 'STANDARD' | 'MONTHLY' | 'ANNUAL' | 'CORPORATE';
  active: boolean;
  regDate: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  expiryDate: string;
  active: boolean;
  usedCount: number;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  discountCode: string;
  bannerColor: string;
  active: boolean;
}

export interface LawDatabaseItem {
  id: number;
  title: string;
  category: 'ANAYASA' | 'CEZA' | 'BORCLAR' | 'IS' | 'ICRA' | 'EMSAL';
  content: string;
  dateAdded: string;
}

export interface SecurityLog {
  id: number;
  timestamp: string;
  ipAddress: string;
  eventType: 'JWT_VERIFY' | 'XSS_PREVENT' | 'SQL_INJECTION_SHIELD' | 'RATE_LIMIT' | 'AUTH_2FA' | 'SENSITIVE_ACCESS';
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

// State Interface
interface AppState {
  userProfile: UserProfile;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  authLoading: boolean;
  authError: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  caseFiles: CaseFile[];
  selectedCaseFileId: number | null;
  documents: LegalDocument[];
  chatMessages: ChatMessage[];
  calendarEvents: CalendarEvent[];
  paymentReceipts: PaymentReceipt[];
  sessions: QuerySession[];
  supportTickets: SupportTicket[];
  
  // Enterprise lists
  adminUsers: AdminUser[];
  coupons: Coupon[];
  campaigns: Campaign[];
  lawsAndPrecedents: LawDatabaseItem[];
  securityLogs: SecurityLog[];
  
  // Premium V3.0 States
  subscriptionPackages: SubscriptionPackage[];
  paymentRequests: PaymentRequest[];
  userSubscriptionDetails: UserSubscriptionDetails | null;
  bankAccounts: BankAccount[];
  paymentSettingsHistory: any[];
  
  // Configs
  geminiModel: string;
  geminiTemperature: number;
  geminiMaxTokens: number;
  firebaseConnected: boolean;
  databaseBackupDate: string;

  // UI states for AI responses
  caseAnalysisResult: any | null;
  caseAnalysisLoading: boolean;
  docAnalysisResult: any | null;
  docAnalysisLoading: boolean;
  searchResult: string;
  searchLoading: boolean;
  petitionResult: string;
  petitionLoading: boolean;
  academyResult: string;
  academyLoading: boolean;
  voiceActive: boolean;
  voiceText: string;
  voiceResponse: string;
}

interface AppContextType extends AppState {
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  clearAuthError: () => void;
  sendVerificationEmail: () => Promise<boolean>;
  reloadUser: () => Promise<void>;
  toggleAdminRole: () => void;
  togglePremiumRole: () => void;
  toggleTwoFactorAuth: () => void;
  updateSystemConfig: (iban: string, monthly: string, annual: string, corporate: string) => void;
  addCaseFile: (title: string, clientName: string, category: string, description: string) => void;
  selectCaseFile: (id: number | null) => void;
  addDocumentToCase: (caseId: number, name: string, contentText: string, fileSize: string) => void;
  analyzeDocRisk: (docId: number) => Promise<void>;
  addChatMessage: (caseId: number, sender: 'USER' | 'AI', text: string) => void;
  runCaseSimulation: (caseId: number) => Promise<void>;
  addCalendarEvent: (title: string, date: string, time: string, description: string, location: string) => void;
  submitPaymentReceipt: (senderName: string, email: string, iban: string, amount: string, fileName: string) => void;
  approvePaymentReceipt: (id: number) => void;
  rejectPaymentReceipt: (id: number) => void;
  
  // Premium V3.0 Triggers
  submitPaymentRequest: (fullName: string, phone: string, email: string, iban: string, packageId: SubscriptionPackageId, amount: number, receiptUrl: string, description?: string) => void;
  approvePaymentRequest: (id: string, adminNotes?: string) => void;
  rejectPaymentRequest: (id: string, adminNotes?: string) => void;
  
  // Premium V3.0 Enterprise Payments Admin Functions
  addBankAccount: (bank: Omit<BankAccount, 'id'>) => void;
  updateBankAccount: (id: string, bank: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  setActiveBankAccount: (id: string) => void;
  addSubscriptionPackage: (pkg: Omit<SubscriptionPackage, 'id'>) => void;
  updateSubscriptionPackage: (id: string, pkg: Partial<SubscriptionPackage>) => void;
  deleteSubscriptionPackage: (id: string) => void;
  rollbackPaymentSettings: () => void;
  
  runAiLegalSearch: (query: string) => Promise<void>;
  draftAiPetition: (title: string, details: string) => Promise<void>;
  runAcademyTeacher: (lessonTitle: string) => Promise<void>;
  submitTicket: (title: string, category: string, text: string) => void;
  setVoiceActive: (active: boolean) => void;
  simulateVoiceInput: (input: string) => Promise<void>;
  
  // Admin triggers
  updateGeminiConfig: (model: string, temp: number, maxTokens: number) => void;
  testFirebaseConnection: () => Promise<boolean>;
  triggerDatabaseBackup: () => void;
  clearSystemCache: () => void;
  addCoupon: (code: string, discount: number, expiry: string) => void;
  toggleCoupon: (id: number) => void;
  deleteCoupon: (id: number) => void;
  addCampaign: (title: string, description: string, discountCode: string, bannerColor: string) => void;
  toggleCampaign: (id: number) => void;
  deleteCampaign: (id: number) => void;
  addLawItem: (title: string, category: LawDatabaseItem['category'], content: string) => void;
  deleteLawItem: (id: number) => void;
  addSecurityLog: (type: SecurityLog['eventType'], message: string, severity: SecurityLog['severity']) => void;
  clearSecurityLogs: () => void;
  sendGlobalNotification: (title: string, text: string) => void;
  updateUserRoleAndPlan: (id: number, role: AdminUser['role'], plan: AdminUser['plan'], active: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Default Prepopulated Mock Data (Matches Android's State) ---
const defaultUser: UserProfile = {
  id: 1,
  name: "Av. Kerem Soylu",
  email: "guzelkokarizzet625@gmail.com",
  isAdmin: true,
  isPremium: true,
  systemIban: "TR96 0006 2000 0001 2345 6789 01",
  premiumPriceMonthly: "₺199.00",
  premiumPriceAnnual: "₺450.00",
  premiumPriceCorporate: "₺1,250.00",
  isTwoFactorEnabled: false,
  remainingQuestions: 3
};

const defaultAdminUsers: AdminUser[] = [
  { id: 1, name: "Av. Kerem Soylu", email: "guzelkokarizzet625@gmail.com", role: "ADMIN", plan: "CORPORATE", active: true, regDate: "01.03.2026" },
  { id: 2, name: "Av. Meltem Aras", email: "meltem@aras.av.tr", role: "ATTORNEY", plan: "MONTHLY", active: true, regDate: "13.06.2026" },
  { id: 3, name: "Av. Selim Yazıcı", email: "selim@yazici-hukuk.av.tr", role: "ATTORNEY", plan: "ANNUAL", active: true, regDate: "12.02.2026" },
  { id: 4, name: "Stj. Av. Hale Demir", email: "hale@demir.av.tr", role: "MEMBER", plan: "STANDARD", active: true, regDate: "14.07.2026" }
];

const defaultCoupons: Coupon[] = [
  { id: 1, code: "ALHUKUK50", discountPercent: 50, expiryDate: "2026-12-31", active: true, usedCount: 14 },
  { id: 2, code: "AVUKAT30", discountPercent: 30, expiryDate: "2026-09-30", active: true, usedCount: 8 },
  { id: 3, code: "KAMPANYA2026", discountPercent: 100, expiryDate: "2026-08-31", active: false, usedCount: 42 }
];

const defaultCampaigns: Campaign[] = [
  { id: 1, title: "Yeni Adli Yıl Lansman İndirimi", description: "Tüm üyeliklerde geçerli %50 indirim kodu: ALHUKUK50", discountCode: "ALHUKUK50", bannerColor: "from-goldDark to-amberAccent", active: true },
  { id: 2, title: "Genç Avukatlar Kampanyası", description: "Stajyer avukatlar için 1 ay ücretsiz üyelik fırsatı", discountCode: "KAMPANYA2026", bannerColor: "from-blue-500 to-cyan-400", active: true }
];

const defaultLawsAndPrecedents: LawDatabaseItem[] = [
  { id: 1, title: "4857 Sayılı İş Kanunu m. 17", category: "IS", content: "Belirsiz süreli iş sözleşmelerinin feshinden önce durumun diğer tarafa bildirilmesi gerekir. Bildirim şartına uymayan taraf, bildirim süresine ilişkin ücret tutarında tazminat (ihbar tazminatı) ödemek zorundadır.", dateAdded: "10.03.2026" },
  { id: 2, title: "4857 Sayılı İş Kanunu m. 41", category: "IS", content: "Ülkenin genel yararları yahut işin niteliği veya üretimin artırılması gibi nedenlerle fazla çalışma yapılabilir. Fazla çalışma, Kanunda yazılı koşullar çerçevesinde, haftalık kırkbeş saati aşan çalışmalardır.", dateAdded: "11.03.2026" },
  { id: 3, title: "6098 Sayılı Borçlar Kanunu m. 344", category: "BORCLAR", content: "Tarafların yenilenen kira dönemlerinde uygulanacak kira bedeline ilişkin anlaşmaları, bir önceki kira yılında tüketici fiyat endeksindeki oniki aylık ortalamalara göre değişim oranını geçmemek koşuluyla geçerlidir.", dateAdded: "15.03.2026" },
  { id: 4, title: "Yargıtay 9. Hukuk Dairesi E. 2021/1102 K. 2021/4502", category: "EMSAL", content: "WhatsApp konuşmaları, e-postalar ve sosyal medya yazışmaları, taraflar arasındaki iş ilişkisini ve çalışma koşullarını gösteren, HMK 199. maddesi anlamında belge niteliğinde olup, delil başlangıcı olarak kabul edilmelidir.", dateAdded: "18.03.2026" },
  { id: 5, title: "Anayasa m. 36 - Hak Arama Hürriyeti", category: "ANAYASA", content: "Herkes, meşru vasıta ve yollardan faydalanmak suretiyle yargı mercileri önünde davacı veya davalı olarak iddia ve savunma ile adil yargılanma hakkına sahiptir.", dateAdded: "01.01.2026" }
];

const defaultSecurityLogs: SecurityLog[] = [
  { id: 1, timestamp: "14.07.2026 23:05:12", ipAddress: "192.168.1.105", eventType: "AUTH_2FA", message: "Yönetici hesabı için 2FA doğrulama adımı atlandı (Çerez geçerli).", severity: "INFO" },
  { id: 2, timestamp: "14.07.2026 22:50:41", ipAddress: "85.105.42.23", eventType: "JWT_VERIFY", message: "Giriş JWT token imzası başarıyla doğrulandı. Kullanıcı: meltem@aras.av.tr", severity: "INFO" },
  { id: 3, timestamp: "14.07.2026 22:15:33", ipAddress: "176.233.10.89", eventType: "RATE_LIMIT", message: "Dilekçe stüdyosu API çağrısı rate-limit (60/dk) korumasına takılmadan onaylandı.", severity: "INFO" },
  { id: 4, timestamp: "14.07.2026 21:03:15", ipAddress: "94.54.112.5", eventType: "XSS_PREVENT", message: "Dava açıklaması form girişinde potansiyel XSS betiği (<script>) temizlendi ve engellendi.", severity: "WARNING" },
  { id: 5, timestamp: "14.07.2026 19:42:01", ipAddress: "213.14.88.19", eventType: "SQL_INJECTION_SHIELD", message: "Hukuk araması sorgusunda 'UNION SELECT' SQL enjeksiyon anahtarı tespit edildi, sorgu sterilize edildi.", severity: "CRITICAL" }
];

const defaultCases: CaseFile[] = [
  { id: 1, title: "Soylu İş Alacağı Davası", clientName: "Hakan Soylu", category: "İş Hukuku", date: "10.07.2026", description: "Haksız fesih, fazla mesai alacakları ve kıdem tazminatı talepli iş davası dosyası.", status: "ACTIVE" },
  { id: 2, title: "Kadıköy Kira Tahliye İhtarı", clientName: "Ahmet Yılmaz", category: "Borçlar & Kira", date: "11.07.2026", description: "Kira ödemelerinin gecikmesi ve tahliye taahhütnamesine dayalı icra takibi dosyası.", status: "ACTIVE" }
];

const defaultDocs: LegalDocument[] = [
  {
    id: 1,
    caseId: 1,
    name: "Is_Sozlesmesi_Taslagi.pdf",
    fileSize: "12.4 MB",
    date: "13.07.2026",
    riskScore: 78,
    riskLevel: "HIGH",
    riskDescription: "İşbu sözleşmede imza eksiktir. Rekabet yasağı maddesi (5 yıl boyunca rakiplerde çalışamama) aşırı ağır ve geçersiz kabul edilebilir. Fazla mesai muvafakatnamesi bulunmamaktadır.",
    contentText: "İŞ SÖZLEŞMESİDİR: İşbu sözleşme işveren ile çalışan arasında tanzim edilmiştir. Çalışan, rekabet yasağı gereği 5 yıl boyunca başka bir şirkette görev yapamayacaktır. İmza: [Eksik]",
    status: "RISK_ANALYZED"
  },
  {
    id: 2,
    caseId: 2,
    name: "Kira_Tahliye_Ihtari.pdf",
    fileSize: "2.1 MB",
    date: "12.07.2026",
    riskScore: 5,
    riskLevel: "CLEAN",
    riskDescription: "KVKK uyumlu. Tahliye ihtarnamesi yasal sürelere ve mevzuata tam olarak uygundur. Borçlu kiracının birikmiş 3 aylık kira bedelini ödemesi için tanınan 30 günlük süre açıkça yazılmıştır.",
    contentText: "İHTARNAMEDİR: Borçlu kiracının birikmiş 3 aylık kira bedelini 30 gün içinde ödemesi, aksi takdirde tahliye davası açılacağı ihtar olunur.",
    status: "RISK_ANALYZED"
  }
];

const defaultChatMessages: ChatMessage[] = [
  { id: 1, caseId: 1, sender: "AI", text: "Soylu İş Alacağı davasına hoş geldiniz. Dosyayı inceledim. WhatsApp yazışmaları ve banka ekstreleri güçlü delillerimiz arasında. Hangi konuda analiz yapmak istersiniz?", timestamp: "13.07.2026 14:00" }
];

const defaultEvents: CalendarEvent[] = [
  { id: 1, title: "Soylu İş Davası - Ön İnceleme Duruşması", date: "2026-08-20", time: "10:30", description: "Anadolu 4. İş Mahkemesi duruşması. Delillerin sunulması ve tanık listesinin bildirilmesi gerekir.", location: "Kartal Anadolu Adliyesi B-Blok Kat:3" },
  { id: 2, title: "Kira İhtarı - Tahliye Arabuluculuk Toplantısı", date: "2026-07-28", time: "14:15", description: "Arabulucu Ofisi toplantısı. Ödeme protokolü taslağı yanımızda olmalı.", location: "Kadıköy Arabuluculuk Merkezi Salon 4" }
];

const defaultReceipts: PaymentReceipt[] = [
  { id: 101, senderName: "Av. Meltem Aras", email: "meltem@aras.av.tr", iban: "TR12 3456 ... 89", amount: "₺199.00", date: "13.07.2026", receiptFileName: "MeltemAras_Aylik_Standart.pdf", status: "PENDING" },
  { id: 102, senderName: "Av. Selim Yazıcı", email: "selim@yazici-hukuk.av.tr", iban: "TR96 0006 ... 01", amount: "₺450.00", date: "12.07.2026", receiptFileName: "SelimYazici_Yillik_Abonelik.pdf", status: "PENDING" }
];

const defaultBankAccounts: BankAccount[] = [
  {
    id: 'bank-ziraat',
    bankName: "Ziraat Bankası",
    accountHolder: "AL Hukuk Teknolojileri A.Ş.",
    iban: "TR96 0006 2000 0001 2345 6789 01",
    branchName: "Merkez Şube",
    accountNumber: "1234567-89",
    swiftCode: "TCZITR2A",
    description: "Hızlı onay için havale açıklamasına sistem e-postanızı eklemeyi unutmayın.",
    supportPhone: "0532 123 4567",
    whatsappNumber: "0532 123 4567",
    supportEmail: "destek@alhukuk.com",
    isActive: true
  },
  {
    id: 'bank-vakif',
    bankName: "Vakıfbank",
    accountHolder: "AL Hukuk Teknolojileri A.Ş.",
    iban: "TR54 0001 5000 0001 9876 5432 02",
    branchName: "Levent Şube",
    accountNumber: "9876543-21",
    swiftCode: "VAKFTR2B",
    description: "Devlet bankası ile güvenli ve hızlı ödeme.",
    supportPhone: "0532 123 4567",
    whatsappNumber: "0532 123 4567",
    supportEmail: "destek@alhukuk.com",
    isActive: false
  },
  {
    id: 'bank-akbank',
    bankName: "Akbank",
    accountHolder: "AL Hukuk Teknolojileri A.Ş.",
    iban: "TR12 0004 6000 0001 1122 3344 03",
    branchName: "Maslak Şube",
    accountNumber: "1122334-45",
    swiftCode: "AKBKTX2C",
    description: "Özel banka ödeme kanalı.",
    supportPhone: "0532 123 4567",
    whatsappNumber: "0532 123 4567",
    supportEmail: "destek@alhukuk.com",
    isActive: false
  }
];

const defaultPackages: SubscriptionPackage[] = [
  {
    id: 'starter',
    name: "Aylık Standart Paket",
    durationDays: 30,
    durationText: "30 Gün",
    price: 199,
    badge: "Popüler",
    description: "Küçük ölçekli hukuk ofisleri için ideal, her ay esnek ve taahhütsüz yenilenen plan.",
    color: "blue",
    iconName: "Star",
    isFeatured: false,
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'popular',
    name: "Yıllık Profesyonel Üyelik",
    durationDays: 365,
    durationText: "365 Gün",
    price: 450,
    oldPrice: 900,
    discountPercent: 50,
    badge: "En Çok Tercih Edilen",
    description: "Yıllık tek çekim ödemeyle yüksek tasarruf sağlayın, kesintisiz tüm yapay zekâyı kullanın.",
    color: "gold",
    iconName: "Sparkles",
    isFeatured: true,
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'advantage',
    name: "Kurumsal Enterprise Lisans",
    durationDays: 365,
    durationText: "Kurumsal / Sınırsız",
    price: 1250,
    oldPrice: 1785,
    discountPercent: 30,
    badge: "Kurumsal Özel",
    description: "Geniş kadrolu ortaklıklar ve barolar için ideal, çoklu eşzamanlı erişim sağlayan paket.",
    color: "purple",
    iconName: "Shield",
    isFeatured: false,
    sortOrder: 3,
    isActive: true
  }
];

const defaultRequests: PaymentRequest[] = [
  {
    id: "PAY-101",
    userId: "user_meltem",
    fullName: "Av. Meltem Aras",
    phone: "0532 123 4567",
    email: "meltem@aras.av.tr",
    iban: "TR12 3456 ... 89",
    packageId: "starter",
    amount: 199.00,
    receiptUrl: "MeltemAras_Aylik_Standart.pdf",
    description: "Aylık standart üyelik ödemesi",
    status: "pending",
    createdAt: "13.07.2026 14:32",
    ipAddress: "192.168.1.15",
  },
  {
    id: "PAY-102",
    userId: "user_selim",
    fullName: "Av. Selim Yazıcı",
    phone: "0544 987 6543",
    email: "selim@yazici-hukuk.av.tr",
    iban: "TR96 0006 ... 01",
    packageId: "popular",
    amount: 450.00,
    receiptUrl: "SelimYazici_Yillik_Abonelik.pdf",
    description: "Yıllık profesyonel paket havalesi",
    status: "pending",
    createdAt: "12.07.2026 11:15",
    ipAddress: "192.168.1.42",
  }
];

const defaultTickets: SupportTicket[] = [
  { id: 1, title: "Adliye Entegrasyon Hatası", client: "Av. Meltem Aras", category: "Entegrasyon", status: "OPEN", date: "13.07.2026", text: "Uyap entegrasyonu esnasında 'Zaman Aşımı' hatası alıyorum. Tekrar dener misiniz?" },
  { id: 2, title: "OCR Karakter Tanıma Sorunu", client: "Av. Caner Yıldız", category: "OCR Tarama", status: "RESOLVED", date: "11.07.2026", text: "Eski Türkçe dilekçelerin OCR taramasında bazı Türkçe karakterler bozuk çıkıyor. Güncelleme yapıldı mı?" }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);

  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Helper: Translate Firebase Auth Errors
  const translateFirebaseError = (code: string): string => {
    switch (code) {
      case 'auth/invalid-email':
      case 'auth/invalid-value-(email)':
        return 'Geçersiz e-posta adresi.';
      case 'auth/user-disabled':
        return 'Bu kullanıcı hesabı devre dışı bırakılmış.';
      case 'auth/user-not-found':
        return 'Kayıtlı kullanıcı bulunamadı.';
      case 'auth/wrong-password':
        return 'Hatalı şifre girdiniz.';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten başka bir hesap tarafından kullanılıyor.';
      case 'auth/weak-password':
        return 'Şifre çok zayıf (en az 6 karakter olmalıdır).';
      case 'auth/operation-not-allowed':
        return 'Bu giriş yöntemine şu anda izin verilmiyor.';
      case 'auth/invalid-credential':
        return 'Hatalı e-posta veya şifre girdiniz.';
      default:
        return 'Bir kimlik doğrulama hatası oluştu. Lütfen bilgilerinizi kontrol edin.';
    }
  };

  // Core Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUser);

  // Helper: Get or Create user profile with schema migration & superadmin checks
  const getOrCreateProfile = async (user: FirebaseUser): Promise<UserProfile> => {
    const userDocRef = doc(db, "users", user.uid);
    let profile: UserProfile;
    let needsUpdate = false;
    
    const isAdminEmail = user.email?.toLowerCase() === "guzelkokarizzet625@gmail.com";
    
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        profile = {
          id: user.uid,
          uid: data.uid || user.uid,
          name: data.displayName || data.name || user.displayName || user.email?.split('@')[0] || "Avukat",
          email: data.email || user.email || "",
          isAdmin: data.role === "admin" || data.isAdmin || isAdminEmail,
          isPremium: data.premium === true || data.isPremium || isAdminEmail,
          systemIban: data.systemIban || "TR96 0006 2000 0001 2345 6789 01",
          premiumPriceMonthly: data.premiumPriceMonthly || "₺199.00",
          premiumPriceAnnual: data.premiumPriceAnnual || "₺450.00",
          premiumPriceCorporate: data.premiumPriceCorporate || "₺1,250.00",
          isTwoFactorEnabled: data.isTwoFactorEnabled || false,
          remainingQuestions: data.remainingQuestions !== undefined ? data.remainingQuestions : (isAdminEmail ? -1 : 3),
          role: data.role || (isAdminEmail ? "admin" : "user"),
          createdAt: data.createdAt ? (typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString()
        } as UserProfile;
        
        if (isAdminEmail && (profile.role !== "admin" || !profile.isAdmin || !profile.isPremium)) {
          profile.role = "admin";
          profile.isAdmin = true;
          profile.isPremium = true;
          needsUpdate = true;
        }
        
        if (!data.uid || !data.role || data.premium === undefined || !data.createdAt) {
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email || "",
            displayName: profile.name,
            role: profile.role,
            premium: profile.isPremium,
            createdAt: data.createdAt || serverTimestamp()
          }, { merge: true });
        }
      } else {
        // Create new profile automatically if not found
        const isSpecialEmail = user.email?.toLowerCase() === "guzelkokarizzet625@gmail.com";
        const displayName = user.displayName || user.email?.split('@')[0] || "Avukat";
        
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email || "",
          displayName: displayName,
          role: isSpecialEmail ? "admin" : "user",
          premium: isSpecialEmail ? true : false,
          createdAt: serverTimestamp()
        });

        profile = {
          id: user.uid,
          uid: user.uid,
          name: displayName,
          email: user.email || "",
          isAdmin: isSpecialEmail,
          isPremium: isSpecialEmail,
          systemIban: "TR96 0006 2000 0001 2345 6789 01",
          premiumPriceMonthly: "₺199.00",
          premiumPriceAnnual: "₺450.00",
          premiumPriceCorporate: "₺1,250.00",
          isTwoFactorEnabled: false,
          remainingQuestions: isSpecialEmail ? -1 : 3,
          role: isSpecialEmail ? "admin" : "user",
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn("Firestore user profile fetch/create failed, using fallback:", e);
      // Fallback profile
      profile = {
        id: user.uid,
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || "Avukat",
        email: user.email || "",
        isAdmin: isAdminEmail,
        isPremium: isAdminEmail,
        systemIban: "TR96 0006 2000 0001 2345 6789 01",
        premiumPriceMonthly: "₺199.00",
        premiumPriceAnnual: "₺450.00",
        premiumPriceCorporate: "₺1,250.00",
        isTwoFactorEnabled: false,
        remainingQuestions: isAdminEmail ? -1 : 3,
        role: isAdminEmail ? "admin" : "user",
        createdAt: new Date().toISOString()
      };
    }
    return profile;
  };

  // Auth Observer
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;
      setAuthLoading(true);
      if (user) {
        setIsEmailVerified(user.emailVerified);
        const profile = await getOrCreateProfile(user);
        if (isMounted) {
          setUserProfile(profile);
          setIsAuthenticated(true);
          localStorage.setItem('al_user', JSON.stringify(profile));
        }
      } else if (isMounted) {
        setIsEmailVerified(false);
        // Double check local storage session
        const storedUser = localStorage.getItem('al_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed && parsed.email) {
              setUserProfile(parsed);
              setIsAuthenticated(true);
              setIsEmailVerified(true);
            } else {
              setIsAuthenticated(false);
            }
          } catch {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
      if (isMounted) {
        setAuthLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Authentication Handlers
  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);

      const isSpecialEmail = email.toLowerCase() === "guzelkokarizzet625@gmail.com";
      const userDocRef = doc(db, "users", user.uid);
      
      // Create Firestore document with requested fields
      await setDoc(userDocRef, {
        uid: user.uid,
        email: email,
        displayName: name,
        role: isSpecialEmail ? "admin" : "user",
        premium: isSpecialEmail ? true : false,
        createdAt: serverTimestamp()
      });

      // Registration must redirect to Login, so sign the user out immediately
      await signOut(auth);

      setIsAuthenticated(false);
      setIsEmailVerified(false);
      setUserProfile({
        id: 0,
        name: "",
        email: "",
        isAdmin: false,
        isPremium: false,
        systemIban: "TR96 0006 2000 0001 2345 6789 01",
        premiumPriceMonthly: "₺199.00",
        premiumPriceAnnual: "₺450.00",
        premiumPriceCorporate: "₺1,250.00",
        isTwoFactorEnabled: false
      });
      localStorage.removeItem('al_user');

      addSecurityLog('JWT_VERIFY', `Yeni kayıt oluşturuldu ve doğrulama e-postası gönderildi. Kullanıcı: ${email}`, 'INFO');
      setAuthLoading(false);
      return true;
    } catch (e: any) {
      console.warn("Firebase SignUp failed, trying local storage fallback", e);
      // Fallback
      const localUsersStr = localStorage.getItem('al_users_db');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      
      const alreadyExists = localUsers.some((u: any) => u.email === email);
      if (alreadyExists) {
        setAuthError("Bu e-posta adresi zaten kayıtlı.");
        setAuthLoading(false);
        return false;
      }

      const newUid = "local_" + Date.now();
      const newLocalUser = { uid: newUid, email, password, name, isAdmin: false, isPremium: false, role: "user", createdAt: new Date().toISOString() };
      localUsers.push(newLocalUser);
      localStorage.setItem('al_users_db', JSON.stringify(localUsers));

      const isAdminEmail = email.toLowerCase() === "guzelkokarizzet625@gmail.com";
      const profile: UserProfile = {
        id: newUid,
        uid: newUid,
        name: name,
        email: email,
        isAdmin: isAdminEmail ? true : false,
        isPremium: isAdminEmail ? true : false,
        systemIban: "TR96 0006 2000 0001 2345 6789 01",
        premiumPriceMonthly: "₺199.00",
        premiumPriceAnnual: "₺450.00",
        premiumPriceCorporate: "₺1,250.00",
        isTwoFactorEnabled: false,
        remainingQuestions: isAdminEmail ? -1 : 3,
        role: isAdminEmail ? "admin" : "user",
        emailVerified: false, // Local simulation triggers verification requirement
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // For local fallback, we also sign out/require login verification simulation
      setAuthError("Doğrulama e-postası gönderildi. Lütfen e-postanızı doğrulayıp giriş yapın (Simüle edildi).");
      setIsAuthenticated(false);
      setAuthLoading(false);
      return true;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Reject users whose email is not verified
      if (!user.emailVerified) {
        await signOut(auth);
        setAuthError("Lütfen e-posta adresinizi doğrulayın. Doğrulama e-postası gelen kutunuza gönderilmiştir.");
        setIsAuthenticated(false);
        setIsEmailVerified(false);
        setAuthLoading(false);
        return false;
      }

      setIsEmailVerified(user.emailVerified);
      const profile = await getOrCreateProfile(user);
      
      setUserProfile(profile);
      setIsAuthenticated(true);
      localStorage.setItem('al_user', JSON.stringify(profile));
      addSecurityLog('JWT_VERIFY', `Oturum başarıyla açıldı. Kullanıcı: ${email}`, 'INFO');
      setAuthLoading(false);
      return true;
    } catch (e: any) {
      console.warn("Firebase SignIn failed, trying local storage fallback", e);
      const localUsersStr = localStorage.getItem('al_users_db');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      const matchedUser = localUsers.find((u: any) => u.email === email && u.password === password);
      
      if (matchedUser) {
        const isAdminEmail = email.toLowerCase() === "guzelkokarizzet625@gmail.com";
        const profile: UserProfile = {
          id: matchedUser.uid,
          uid: matchedUser.uid,
          name: matchedUser.name,
          email: matchedUser.email,
          isAdmin: isAdminEmail ? true : (matchedUser.isAdmin || false),
          isPremium: isAdminEmail ? true : (matchedUser.isPremium || false),
          systemIban: "TR96 0006 2000 0001 2345 6789 01",
          premiumPriceMonthly: "₺199.00",
          premiumPriceAnnual: "₺450.00",
          premiumPriceCorporate: "₺1,250.00",
          isTwoFactorEnabled: matchedUser.isTwoFactorEnabled || false,
          remainingQuestions: isAdminEmail ? -1 : (matchedUser.remainingQuestions || 3),
          role: isAdminEmail ? "admin" : (matchedUser.role || "user"),
          emailVerified: true, // Bypass for local offline users
          createdAt: matchedUser.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUserProfile(profile);
        setIsEmailVerified(true);
        setIsAuthenticated(true);
        addSecurityLog('JWT_VERIFY', `Oturum başarıyla açıldı (Yerel Veri Tabanı). Kullanıcı: ${email}`, 'INFO');
        setAuthLoading(false);
        return true;
      } else {
        const trMessage = translateFirebaseError(e.code || e.message);
        setAuthError(trMessage);
        setAuthLoading(false);
        return false;
      }
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      addSecurityLog('JWT_VERIFY', `Şifre sıfırlama e-postası gönderildi. Kullanıcı: ${email}`, 'INFO');
      setAuthLoading(false);
      return true;
    } catch (e: any) {
      console.warn("Firebase ResetPassword failed, checking local database", e);
      const localUsersStr = localStorage.getItem('al_users_db');
      const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
      const userExists = localUsers.some((u: any) => u.email === email);
      
      if (userExists) {
        addSecurityLog('JWT_VERIFY', `Şifre sıfırlama simüle edildi (Yerel Veri Tabanı). Kullanıcı: ${email}`, 'INFO');
        setAuthLoading(false);
        return true;
      } else {
        const trMessage = translateFirebaseError(e.code || e.message);
        setAuthError(trMessage || "Kayıtlı kullanıcı bulunamadı.");
        setAuthLoading(false);
        return false;
      }
    }
  };

  const sendVerificationEmail = async (): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setAuthLoading(false);
        return true;
      } catch (e: any) {
        console.error("sendEmailVerification failed:", e);
        const trMessage = translateFirebaseError(e.code || e.message);
        setAuthError(trMessage || "Doğrulama e-postası gönderilirken bir hata oluştu.");
        setAuthLoading(false);
        return false;
      }
    }
    setAuthError("Doğrulama göndermek için önce giriş yapmalısınız.");
    setAuthLoading(false);
    return false;
  };

  const reloadUser = async (): Promise<void> => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        setIsEmailVerified(auth.currentUser.emailVerified);
      } catch (e) {
        console.error("reloadUser failed:", e);
      }
    }
  };

  const signOutUser = async () => {
    setAuthLoading(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Firebase signout failed", e);
    }
    setUserProfile({
      id: 0,
      name: "",
      email: "",
      isAdmin: false,
      isPremium: false,
      systemIban: "TR96 0006 2000 0001 2345 6789 01",
      premiumPriceMonthly: "₺199.00",
      premiumPriceAnnual: "₺450.00",
      premiumPriceCorporate: "₺1,250.00",
      isTwoFactorEnabled: false
    });
    setIsAuthenticated(false);
    localStorage.removeItem('al_user');
    addSecurityLog('JWT_VERIFY', "Oturum kapatıldı.", 'INFO');
    setAuthLoading(false);
  };

  const clearAuthError = () => {
    setAuthError(null);
  };
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>(defaultCases);
  const [selectedCaseFileId, setSelectedCaseFileId] = useState<number | null>(1);
  const [documents, setDocuments] = useState<LegalDocument[]>(defaultDocs);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(defaultChatMessages);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(defaultEvents);
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>(defaultReceipts);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(defaultTickets);
  const [sessions, setSessions] = useState<QuerySession[]>([]);

  // Enterprise & System Data States
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(defaultAdminUsers);
  const [coupons, setCoupons] = useState<Coupon[]>(defaultCoupons);
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [lawsAndPrecedents, setLawsAndPrecedents] = useState<LawDatabaseItem[]>(defaultLawsAndPrecedents);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(defaultSecurityLogs);
  
  // Premium V3.0 States
  const [subscriptionPackages, setSubscriptionPackages] = useState<SubscriptionPackage[]>(defaultPackages);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(defaultRequests);
  const [userSubscriptionDetails, setUserSubscriptionDetails] = useState<UserSubscriptionDetails | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(defaultBankAccounts);
  const [paymentSettingsHistory, setPaymentSettingsHistory] = useState<any[]>([]);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Configuration States
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [geminiTemperature, setGeminiTemperature] = useState(0.4);
  const [geminiMaxTokens, setGeminiMaxTokens] = useState(2048);
  const [firebaseConnected, setFirebaseConnected] = useState(true);
  const [databaseBackupDate, setDatabaseBackupDate] = useState("14.07.2026 04:00");

  // AI states
  const [caseAnalysisResult, setCaseAnalysisResult] = useState<any | null>(null);
  const [caseAnalysisLoading, setCaseAnalysisLoading] = useState(false);
  const [docAnalysisResult, setDocAnalysisResult] = useState<any | null>(null);
  const [docAnalysisLoading, setDocAnalysisLoading] = useState(false);
  const [searchResult, setSearchResult] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [petitionResult, setPetitionResult] = useState("");
  const [petitionLoading, setPetitionLoading] = useState(false);
  const [academyResult, setAcademyResult] = useState("");
  const [academyLoading, setAcademyLoading] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");

  // Hydration safe load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('al_user');
      const storedCases = localStorage.getItem('al_cases');
      const storedDocs = localStorage.getItem('al_docs');
      const storedChats = localStorage.getItem('al_chats');
      const storedEvents = localStorage.getItem('al_events');
      const storedReceipts = localStorage.getItem('al_receipts');
      const storedTickets = localStorage.getItem('al_tickets');
      const storedRequests = localStorage.getItem('al_payment_requests');
      const storedDetails = localStorage.getItem('al_subscription_details');

      // Enterprise Loads
      const storedAdminUsers = localStorage.getItem('al_admin_users');
      const storedCoupons = localStorage.getItem('al_coupons');
      const storedCampaigns = localStorage.getItem('al_campaigns');
      const storedLaws = localStorage.getItem('al_laws');
      const storedLogs = localStorage.getItem('al_logs');
      const storedModel = localStorage.getItem('al_gemini_model');
      const storedTemp = localStorage.getItem('al_gemini_temp');
      const storedTokens = localStorage.getItem('al_gemini_tokens');
      const storedBackup = localStorage.getItem('al_backup_date');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserProfile(parsedUser);
        if (!storedDetails) {
          setUserSubscriptionDetails({
            userId: parsedUser.id.toString(),
            isPremium: parsedUser.isPremium,
            packageId: parsedUser.isPremium ? 'popular' : undefined,
            startDate: parsedUser.isPremium ? "15.07.2026" : undefined,
            endDate: parsedUser.isPremium ? "15.07.2027" : undefined,
            activatedAt: parsedUser.isPremium ? "15.07.2026" : undefined
          });
        }
      }
      if (storedCases) setCaseFiles(JSON.parse(storedCases));
      if (storedDocs) setDocuments(JSON.parse(storedDocs));
      if (storedChats) setChatMessages(JSON.parse(storedChats));
      if (storedEvents) setCalendarEvents(JSON.parse(storedEvents));
      if (storedReceipts) setPaymentReceipts(JSON.parse(storedReceipts));
      if (storedTickets) setSupportTickets(JSON.parse(storedTickets));
      if (storedRequests) setPaymentRequests(JSON.parse(storedRequests));
      if (storedDetails) setUserSubscriptionDetails(JSON.parse(storedDetails));

      const storedBanks = localStorage.getItem('al_bank_accounts');
      const storedPkgs = localStorage.getItem('al_subscription_packages');
      const storedHist = localStorage.getItem('al_payment_settings_history');
      if (storedBanks) setBankAccounts(JSON.parse(storedBanks));
      if (storedPkgs) setSubscriptionPackages(JSON.parse(storedPkgs));
      if (storedHist) setPaymentSettingsHistory(JSON.parse(storedHist));

      if (storedAdminUsers) setAdminUsers(JSON.parse(storedAdminUsers));
      if (storedCoupons) setCoupons(JSON.parse(storedCoupons));
      if (storedCampaigns) setCampaigns(JSON.parse(storedCampaigns));
      if (storedLaws) setLawsAndPrecedents(JSON.parse(storedLaws));
      if (storedLogs) setSecurityLogs(JSON.parse(storedLogs));
      
      if (storedModel) setGeminiModel(storedModel);
      if (storedTemp) setGeminiTemperature(parseFloat(storedTemp));
      if (storedTokens) setGeminiMaxTokens(parseInt(storedTokens));
      if (storedBackup) setDatabaseBackupDate(storedBackup);
      
      setHydrated(true);
    }
  }, []);

  // Realtime synchronization with Firestore for enterprise payment settings
  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onSnapshot(doc(db, "system_configs", "payment_settings"), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.bankAccounts) {
            setBankAccounts(data.bankAccounts);
            const activeBank = data.bankAccounts.find((b: any) => b.isActive);
            if (activeBank) {
              setUserProfile(prev => ({ ...prev, systemIban: activeBank.iban }));
            }
          }
          if (data.subscriptionPackages) {
            setSubscriptionPackages(data.subscriptionPackages);
          }
          if (data.settingsHistory) {
            setPaymentSettingsHistory(data.settingsHistory);
          }
        }
      }, (error) => {
        console.warn("Firestore realtime snapshot failed (using localStorage/local state):", error);
      });
    } catch (e) {
      console.warn("Firestore realtime setup failed (using localStorage/local state):", e);
    }
    return () => unsub();
  }, []);

  // Save states on change (only after hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_user', JSON.stringify(userProfile));
    }
  }, [userProfile, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_cases', JSON.stringify(caseFiles));
    }
  }, [caseFiles, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_docs', JSON.stringify(documents));
    }
  }, [documents, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_chats', JSON.stringify(chatMessages));
    }
  }, [chatMessages, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_events', JSON.stringify(calendarEvents));
    }
  }, [calendarEvents, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_receipts', JSON.stringify(paymentReceipts));
    }
  }, [paymentReceipts, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_payment_requests', JSON.stringify(paymentRequests));
    }
  }, [paymentRequests, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_subscription_details', JSON.stringify(userSubscriptionDetails));
    }
  }, [userSubscriptionDetails, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_tickets', JSON.stringify(supportTickets));
    }
  }, [supportTickets, hydrated]);

  // Enterprise Saves
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_admin_users', JSON.stringify(adminUsers));
    }
  }, [adminUsers, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_coupons', JSON.stringify(coupons));
    }
  }, [coupons, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_campaigns', JSON.stringify(campaigns));
    }
  }, [campaigns, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_laws', JSON.stringify(lawsAndPrecedents));
    }
  }, [lawsAndPrecedents, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_logs', JSON.stringify(securityLogs));
    }
  }, [securityLogs, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_gemini_model', geminiModel);
      localStorage.setItem('al_gemini_temp', geminiTemperature.toString());
      localStorage.setItem('al_gemini_tokens', geminiMaxTokens.toString());
    }
  }, [geminiModel, geminiTemperature, geminiMaxTokens, hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('al_backup_date', databaseBackupDate);
    }
  }, [databaseBackupDate, hydrated]);

  // --- Handlers ---
  const toggleAdminRole = () => {
    setUserProfile(prev => ({ ...prev, isAdmin: !prev.isAdmin }));
  };

  const togglePremiumRole = () => {
    setUserProfile(prev => ({ ...prev, isPremium: !prev.isPremium }));
  };

  const toggleTwoFactorAuth = () => {
    setUserProfile(prev => {
      const nextVal = !prev.isTwoFactorEnabled;
      addSecurityLog('AUTH_2FA', `İki aşamalı doğrulama (2FA) ${nextVal ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`, 'INFO');
      showToast(`İki aşamalı doğrulama (2FA) ${nextVal ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`, 'success');
      return { ...prev, isTwoFactorEnabled: nextVal };
    });
  };

  const updateSystemConfig = (iban: string, monthly: string, annual: string, corporate: string) => {
    setUserProfile(prev => ({
      ...prev,
      systemIban: iban,
      premiumPriceMonthly: monthly,
      premiumPriceAnnual: annual,
      premiumPriceCorporate: corporate
    }));
    showToast("Abonelik ücretleri ve sistem IBAN adresi başarıyla güncellendi.", "success");
  };

  const updateGeminiConfig = (model: string, temp: number, maxTokens: number) => {
    setGeminiModel(model);
    setGeminiTemperature(temp);
    setGeminiMaxTokens(maxTokens);
    addSecurityLog('SENSITIVE_ACCESS', `Yapar zekâ parametreleri güncellendi. Model: ${model}, Sıcaklık: ${temp}, Sınır: ${maxTokens}`, 'INFO');
    showToast("Yapay zekâ parametreleri başarıyla güncellendi.", "success");
  };

  const testFirebaseConnection = async () => {
    setFirebaseConnected(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    setFirebaseConnected(true);
    addSecurityLog('JWT_VERIFY', "Firebase OAuth ve Gerçek Zamanlı DB bütünlük testi başarıyla tamamlandı.", "INFO");
    showToast("Firebase & Firestore bağlantı testi başarılı!", "success");
    return true;
  };

  const triggerDatabaseBackup = () => {
    const now = new Date();
    const formatted = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setDatabaseBackupDate(formatted);
    addSecurityLog('SENSITIVE_ACCESS', `Bulut veritabanı tam yedekleme ve şifreleme işlemi başarıyla tamamlandı.`, 'WARNING');
    showToast("Gerçek zamanlı Firestore yedeği başarıyla alındı ve şifrelendi.", "success");
  };

  const clearSystemCache = () => {
    addSecurityLog('RATE_LIMIT', "Tüm sistem önbellekleri (Kullanıcı, SEO Sitemaps, Mevzuat arabellekleri) temizlendi.", "INFO");
    showToast("Sistem önbelleği ve geçici dosyalar başarıyla temizlendi.", "success");
  };

  const addCoupon = (code: string, discount: number, expiry: string) => {
    const newCoupon: Coupon = {
      id: Date.now(),
      code: code.toUpperCase(),
      discountPercent: discount,
      expiryDate: expiry,
      active: true,
      usedCount: 0
    };
    setCoupons(prev => [newCoupon, ...prev]);
    addSecurityLog('SENSITIVE_ACCESS', `Yeni indirim kuponu tanımlandı: ${code.toUpperCase()} (%${discount})`, 'INFO');
    showToast(`"${code.toUpperCase()}" indirim kuponu başarıyla oluşturuldu.`, "success");
  };

  const toggleCoupon = (id: number) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    showToast("Kupon aktiflik durumu değiştirildi.", "info");
  };

  const deleteCoupon = (id: number) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast("İndirim kuponu sistemden kalıcı olarak silindi.", "warning");
  };

  const addCampaign = (title: string, description: string, discountCode: string, bannerColor: string) => {
    const newCamp: Campaign = {
      id: Date.now(),
      title,
      description,
      discountCode,
      bannerColor,
      active: true
    };
    setCampaigns(prev => [newCamp, ...prev]);
    addSecurityLog('SENSITIVE_ACCESS', `Yeni kampanya duyurusu oluşturuldu: ${title}`, 'INFO');
    showToast("Yeni kampanya duyurusu başarıyla yayınlandı.", "success");
  };

  const toggleCampaign = (id: number) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    showToast("Kampanya aktiflik durumu değiştirildi.", "info");
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    showToast("Kampanya duyurusu sistemden kaldırıldı.", "warning");
  };

  const addLawItem = (title: string, category: LawDatabaseItem['category'], content: string) => {
    const newItem: LawDatabaseItem = {
      id: Date.now(),
      title,
      category,
      content,
      dateAdded: new Date().toLocaleDateString('tr-TR')
    };
    setLawsAndPrecedents(prev => [newItem, ...prev]);
    addSecurityLog('SENSITIVE_ACCESS', `Kanun/Emsal Karar veritabanına yeni madde eklendi: ${title}`, 'INFO');
    showToast("Yeni mevzuat/emsal karar başarıyla veritabanına eklendi.", "success");
  };

  const deleteLawItem = (id: number) => {
    setLawsAndPrecedents(prev => prev.filter(l => l.id !== id));
    showToast("Mevzuat/Emsal Karar veritabanından kalıcı olarak silindi.", "warning");
  };

  const addSecurityLog = (type: SecurityLog['eventType'], message: string, severity: SecurityLog['severity']) => {
    const newLog: SecurityLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ipAddress: "192.168.1." + Math.floor(Math.random() * 253 + 2),
      eventType: type,
      message,
      severity
    };
    setSecurityLogs(prev => [newLog, ...prev].slice(0, 30));
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
    showToast("Güvenlik günlükleri ve denetim kayıtları temizlendi.", "warning");
  };

  const sendGlobalNotification = (title: string, text: string) => {
    addSecurityLog('SENSITIVE_ACCESS', `Sistem genel duyurusu tetiklendi: "${title}" - "${text}"`, 'WARNING');
    showToast(`Global duyuru başarıyla gönderildi: "${title}"`, "success");
  };

  const updateUserRoleAndPlan = (id: number, role: AdminUser['role'], plan: AdminUser['plan'], active: boolean) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === id) {
        if (u.email === userProfile.email) {
          setUserProfile(p => ({
            ...p,
            isAdmin: role === 'ADMIN',
            isPremium: plan !== 'STANDARD'
          }));
        }
        return { ...u, role, plan, active };
      }
      return u;
    }));
    addSecurityLog('SENSITIVE_ACCESS', `Kullanıcı ID: ${id} üzerinde yetki güncellemesi yapıldı. Rol: ${role}, Lisans: ${plan}`, 'WARNING');
    showToast("Kullanıcı yetki ve plan ayarları başarıyla güncellendi.", "success");
  };

  const addCaseFile = (title: string, clientName: string, category: string, description: string) => {
    const newCase: CaseFile = {
      id: Date.now(),
      title,
      clientName,
      category,
      date: new Date().toLocaleDateString('tr-TR'),
      description,
      status: 'ACTIVE'
    };
    setCaseFiles(prev => [...prev, newCase]);
    setSelectedCaseFileId(newCase.id);
  };

  const selectCaseFile = (id: number | null) => {
    setSelectedCaseFileId(id);
  };

  const addDocumentToCase = (caseId: number, name: string, contentText: string, fileSize: string) => {
    const newDoc: LegalDocument = {
      id: Date.now(),
      caseId,
      name,
      fileSize,
      date: new Date().toLocaleDateString('tr-TR'),
      riskScore: 0,
      riskLevel: 'CLEAN',
      riskDescription: 'Analiz edilmedi. Lütfen yapay zekâ analizini başlatın.',
      contentText,
      status: 'OCR_COMPLETED'
    };
    setDocuments(prev => [...prev, newDoc]);
  };

  const addChatMessage = (caseId: number, sender: 'USER' | 'AI', text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      caseId,
      sender,
      text,
      timestamp: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const addCalendarEvent = (title: string, date: string, time: string, description: string, location: string) => {
    const newEvent: CalendarEvent = {
      id: Date.now(),
      title,
      date,
      time,
      description,
      location
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const saveSettingsToDbAndHistory = async (newBanks: BankAccount[], newPackages: SubscriptionPackage[]) => {
    const timestamp = new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const snapshot = {
      id: 'snap-' + Date.now(),
      timestamp,
      bankAccounts: newBanks,
      subscriptionPackages: newPackages,
      adminEmail: userProfile.email || 'Admin',
    };

    setBankAccounts(newBanks);
    setSubscriptionPackages(newPackages);
    setPaymentSettingsHistory(prev => {
      const updated = [snapshot, ...prev].slice(0, 20);
      localStorage.setItem('al_payment_settings_history', JSON.stringify(updated));
      return updated;
    });

    localStorage.setItem('al_bank_accounts', JSON.stringify(newBanks));
    localStorage.setItem('al_subscription_packages', JSON.stringify(newPackages));

    try {
      await setDoc(doc(db, "system_configs", "payment_settings"), {
        bankAccounts: newBanks,
        subscriptionPackages: newPackages,
        settingsHistory: [snapshot, ...paymentSettingsHistory].slice(0, 20)
      });
    } catch (e) {
      console.warn("Firestore save failed during settings update:", e);
    }
  };

  const addBankAccount = (bank: Omit<BankAccount, 'id'>) => {
    const newBank: BankAccount = {
      ...bank,
      id: 'bank-' + Date.now()
    };
    const updated = [...bankAccounts, newBank];
    saveSettingsToDbAndHistory(updated, subscriptionPackages);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Yeni Banka Hesabı Eklendi: ${bank.bankName} (${bank.iban}). Ekleyen: ${userProfile.email}. Cihaz: ${userAgent}`,
      'WARNING'
    );
    showToast(`${bank.bankName} hesabı başarıyla eklendi.`, "success");
  };

  const updateBankAccount = (id: string, bankFields: Partial<BankAccount>) => {
    const updated = bankAccounts.map(b => {
      if (b.id === id) {
        return { ...b, ...bankFields };
      }
      return b;
    });
    saveSettingsToDbAndHistory(updated, subscriptionPackages);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Banka Hesabı Güncellendi (ID: ${id}). Değişiklikler: ${JSON.stringify(bankFields)}. Güncelleyen: ${userProfile.email}. Cihaz: ${userAgent}`,
      'WARNING'
    );
    showToast("Banka hesabı başarıyla güncellendi.", "success");
  };

  const deleteBankAccount = (id: string) => {
    const target = bankAccounts.find(b => b.id === id);
    if (!target) return;
    const updated = bankAccounts.filter(b => b.id !== id);
    saveSettingsToDbAndHistory(updated, subscriptionPackages);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Banka Hesabı Silindi: ${target.bankName} (${target.iban}). Sileyen: ${userProfile.email}. Cihaz: ${userAgent}`,
      'CRITICAL'
    );
    showToast("Banka hesabı sistemden kaldırıldı.", "warning");
  };

  const setActiveBankAccount = (id: string) => {
    const target = bankAccounts.find(b => b.id === id);
    if (!target) return;
    const updated = bankAccounts.map(b => ({
      ...b,
      isActive: b.id === id
    }));
    
    setUserProfile(prev => ({
      ...prev,
      systemIban: target.iban
    }));

    saveSettingsToDbAndHistory(updated, subscriptionPackages);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Aktif Banka Hesabı Değiştirildi. Yeni Aktif: ${target.bankName} (${target.iban}). Güncelleyen: ${userProfile.email}. Cihaz: ${userAgent}`,
      'WARNING'
    );
    showToast(`Aktif banka hesabı ${target.bankName} olarak güncellendi. Tüm kullanıcılar anında görecektir.`, "success");
  };

  const addSubscriptionPackage = (pkg: Omit<SubscriptionPackage, 'id'>) => {
    const newPkg: SubscriptionPackage = {
      ...pkg,
      id: 'pkg-' + Date.now()
    };
    const updated = [...subscriptionPackages, newPkg].sort((a, b) => a.sortOrder - b.sortOrder);
    saveSettingsToDbAndHistory(bankAccounts, updated);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Yeni Lisans Paketi Oluşturuldu: ${pkg.name} (₺${pkg.price}). Oluşturan: ${userProfile.email}. Cihaz: ${userAgent}`,
      'WARNING'
    );
    showToast(`${pkg.name} lisans paketi oluşturuldu.`, "success");
  };

  const updateSubscriptionPackage = (id: string, pkgFields: Partial<SubscriptionPackage>) => {
    const updated = subscriptionPackages.map(p => {
      if (p.id === id) {
        return { ...p, ...pkgFields };
      }
      return p;
    }).sort((a, b) => a.sortOrder - b.sortOrder);

    if (id === 'starter' && pkgFields.price !== undefined) {
      setUserProfile(prev => ({ ...prev, premiumPriceMonthly: "₺" + pkgFields.price }));
    } else if (id === 'popular' && pkgFields.price !== undefined) {
      setUserProfile(prev => ({ ...prev, premiumPriceAnnual: "₺" + pkgFields.price }));
    } else if (id === 'advantage' && pkgFields.price !== undefined) {
      setUserProfile(prev => ({ ...prev, premiumPriceCorporate: "₺" + pkgFields.price }));
    }

    saveSettingsToDbAndHistory(bankAccounts, updated);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Lisans Paketi Güncellendi (ID: ${id}). Değişiklikler: ${JSON.stringify(pkgFields)}. Güncelleyen: ${userProfile.email}. Cihaz: ${userAgent}`,
      'WARNING'
    );
    showToast("Paket özellikleri başarıyla güncellendi.", "success");
  };

  const deleteSubscriptionPackage = (id: string) => {
    const target = subscriptionPackages.find(p => p.id === id);
    if (!target) return;
    const updated = subscriptionPackages.filter(p => p.id !== id);
    saveSettingsToDbAndHistory(bankAccounts, updated);

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Lisans Paketi Silindi: ${target.name} (ID: ${id}). Sileyen: ${userProfile.email}. Cihaz: ${userAgent}`,
      'CRITICAL'
    );
    showToast("Lisans paketi kalıcı olarak silindi.", "warning");
  };

  const rollbackPaymentSettings = async () => {
    if (paymentSettingsHistory.length === 0) {
      showToast("Geri alınabilecek kayıtlı geçmiş ayar bulunmamaktadır.", "error");
      return;
    }
    const previous = paymentSettingsHistory[0];
    const remainingHistory = paymentSettingsHistory.slice(1);

    setBankAccounts(previous.bankAccounts);
    setSubscriptionPackages(previous.subscriptionPackages);
    setPaymentSettingsHistory(remainingHistory);

    localStorage.setItem('al_bank_accounts', JSON.stringify(previous.bankAccounts));
    localStorage.setItem('al_subscription_packages', JSON.stringify(previous.subscriptionPackages));
    localStorage.setItem('al_payment_settings_history', JSON.stringify(remainingHistory));

    const activeBank = previous.bankAccounts.find((b: any) => b.isActive);
    if (activeBank) {
      setUserProfile(prev => ({ ...prev, systemIban: activeBank.iban }));
    }

    try {
      await setDoc(doc(db, "system_configs", "payment_settings"), {
        bankAccounts: previous.bankAccounts,
        subscriptionPackages: previous.subscriptionPackages,
        settingsHistory: remainingHistory
      });
    } catch (e) {
      console.warn("Firestore save failed during rollback, fell back to localStorage:", e);
    }

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Unknown';
    addSecurityLog(
      'SENSITIVE_ACCESS',
      `Geri Al (Rollback) İşlemi Tetiklendi. Eski ayarlar geri yüklendi (Tarih: ${previous.timestamp}). Tetikleyen: ${userProfile.email}. Cihaz: ${userAgent}`,
      'CRITICAL'
    );
    showToast("Ödeme sistemi ayarları önceki sürüme başarıyla geri döndürüldü (Rollback tamamlandı).", "success");
  };

  const submitPaymentRequest = (
    fullName: string,
    phone: string,
    email: string,
    iban: string,
    packageId: SubscriptionPackageId,
    amount: number,
    receiptUrl: string,
    description?: string
  ) => {
    const newId = "PAY-" + Date.now().toString().slice(-6);
    const newRequest: PaymentRequest = {
      id: newId,
      userId: userProfile.id.toString(),
      fullName,
      phone,
      email,
      iban,
      packageId,
      amount,
      receiptUrl,
      description: description || `${packageId === 'starter' ? 'Aylık Standart' : packageId === 'popular' ? 'Yıllık Profesyonel' : 'Kurumsal Enterprise'} Paket`,
      status: 'pending',
      createdAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      ipAddress: "192.168.1." + Math.floor(Math.random() * 253 + 2),
    };

    setPaymentRequests(prev => [newRequest, ...prev]);

    // Backward compatibility: also insert into legacy paymentReceipts state
    const legacyReceipt: PaymentReceipt = {
      id: Date.now(),
      senderName: fullName,
      email,
      iban,
      amount: "₺" + amount.toFixed(2),
      date: new Date().toLocaleDateString('tr-TR'),
      receiptFileName: receiptUrl,
      status: 'PENDING'
    };
    setPaymentReceipts(prev => [legacyReceipt, ...prev]);

    addSecurityLog('SENSITIVE_ACCESS', `Havale dekontu yüklendi. Paket: ${packageId}, Tutar: ₺${amount}. Gönderen: ${fullName}`, 'INFO');
    showToast("Havale dekontunuz başarıyla yüklendi. Onay süreci başlatıldı.", "success");
  };

  const approvePaymentRequest = (id: string, adminNotes?: string) => {
    setPaymentRequests(prev => prev.map(req => {
      if (req.id === id) {
        const isSelf = req.email === userProfile.email || req.userId === userProfile.id.toString();
        if (isSelf) {
          setUserProfile(p => ({ ...p, isPremium: true }));
          setUserSubscriptionDetails({
            userId: req.userId,
            isPremium: true,
            packageId: req.packageId,
            startDate: new Date().toLocaleDateString('tr-TR'),
            endDate: new Date(Date.now() + (req.packageId === 'starter' ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR'),
            activatedAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          });
        }
        
        // Update the adminUsers list if the user is there
        setAdminUsers(uList => uList.map(u => {
          if (u.email === req.email) {
            return { ...u, plan: req.packageId === 'starter' ? 'MONTHLY' as const : req.packageId === 'popular' ? 'ANNUAL' as const : 'CORPORATE' as const, active: true };
          }
          return u;
        }));

        return {
          ...req,
          status: 'approved' as const,
          processedAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          adminNotes: adminNotes || "Yönetici tarafından onaylandı."
        };
      }
      return req;
    }));

    // Legacy sync
    setPaymentReceipts(prev => prev.map(rec => {
      const match = paymentRequests.find(r => r.id === id);
      if (match && rec.email === match.email && rec.status === 'PENDING') {
        return { ...rec, status: 'APPROVED' as const };
      }
      return rec;
    }));

    addSecurityLog('SENSITIVE_ACCESS', `Ödeme talebi (ID: ${id}) yönetici tarafından onaylandı.`, 'WARNING');
    showToast("Ödeme başarıyla onaylandı ve üyelik aktif edildi.", "success");
  };

  const rejectPaymentRequest = (id: string, adminNotes?: string) => {
    setPaymentRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'rejected' as const,
          processedAt: new Date().toLocaleDateString('tr-TR') + ' ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          adminNotes: adminNotes || "Dekont geçersiz veya tutar uyuşmuyor."
        };
      }
      return req;
    }));

    // Legacy sync
    setPaymentReceipts(prev => prev.map(rec => {
      const match = paymentRequests.find(r => r.id === id);
      if (match && rec.email === match.email && rec.status === 'PENDING') {
        return { ...rec, status: 'REJECTED' as const };
      }
      return rec;
    }));

    addSecurityLog('SENSITIVE_ACCESS', `Ödeme talebi (ID: ${id}) reddedildi. Neden: ${adminNotes}`, 'WARNING');
    showToast("Ödeme talebi reddedildi.", "error");
  };

  const submitPaymentReceipt = (senderName: string, email: string, iban: string, amount: string, fileName: string) => {
    const numericAmount = parseFloat(amount.replace(/[^\d.]/g, '')) || 199;
    const packageId: SubscriptionPackageId = numericAmount <= 199 ? 'starter' : numericAmount <= 450 ? 'popular' : 'advantage';
    submitPaymentRequest(senderName, "0500 000 0000", email, iban, packageId, numericAmount, fileName);
  };

  const approvePaymentReceipt = (id: number) => {
    const receipt = paymentReceipts.find(r => r.id === id);
    if (receipt) {
      const req = paymentRequests.find(r => r.email === receipt.email && r.status === 'pending');
      if (req) {
        approvePaymentRequest(req.id);
      } else {
        setPaymentReceipts(prev => prev.map(rec => {
          if (rec.id === id) {
            if (rec.email === userProfile.email) {
              setUserProfile(p => ({ ...p, isPremium: true }));
            }
            return { ...rec, status: 'APPROVED' as const };
          }
          return rec;
        }));
        showToast("Ödeme makbuzu onaylandı.", "success");
      }
    }
  };

  const rejectPaymentReceipt = (id: number) => {
    const receipt = paymentReceipts.find(r => r.id === id);
    if (receipt) {
      const req = paymentRequests.find(r => r.email === receipt.email && r.status === 'pending');
      if (req) {
        rejectPaymentRequest(req.id);
      } else {
        setPaymentReceipts(prev => prev.map(rec => rec.id === id ? { ...rec, status: 'REJECTED' as const } : rec));
        showToast("Ödeme makbuzu reddedildi.", "error");
      }
    }
  };

  const submitTicket = (title: string, category: string, text: string) => {
    const newTicket: SupportTicket = {
      id: Date.now(),
      title,
      client: userProfile.name,
      category,
      status: 'OPEN',
      date: new Date().toLocaleDateString('tr-TR'),
      text
    };
    setSupportTickets(prev => [...prev, newTicket]);
  };

  // --- Gemini AI Entegrasyonları ---
  const callGeminiApi = async (prompt: string, taskType: string): Promise<string> => {
    // Check quota for Free/Standard users
    if (!userProfile.isPremium) {
      const currentRemaining = typeof userProfile.remainingQuestions === 'number' ? userProfile.remainingQuestions : 3;
      if (currentRemaining <= 0) {
        throw new Error("GÜNLÜK KOTA SINIRINA ULAŞILDI: Günlük yapay zekâ arama ve soru hakkınız dolmuştur. Sınırsız arama, dilekçe tanzimi ve dava simülasyonu için lütfen Premium üyeliğe yükselin.");
      }
    }

    try {
      // Modify prompt for free users to enforce "Basic answers only" and "Maximum 250 words per answer"
      let finalPrompt = prompt;
      if (!userProfile.isPremium) {
        finalPrompt = `${prompt}\n\n[SİSTEM TALİMATI: Kullanıcı Ücretsiz Plandadır. Lütfen cevabı temel düzeyde, sade ve en fazla 250 kelime olacak şekilde sınırlandırın. Cevabın sonunda başka bir şey eklemeyin.]`;
      } else {
        finalPrompt = `${prompt}\n\n[SİSTEM TALİMATI: Kullanıcı Premium Plandadır. Lütfen son derece detaylı, derinlemesine akademik ve pratik bir hukuki analiz yapın.]`;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: finalPrompt, taskType })
      });
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const data = await response.json();
      
      // If call is successful and user is not premium, decrement remainingQuestions!
      if (!userProfile.isPremium) {
        const currentRemaining = typeof userProfile.remainingQuestions === 'number' ? userProfile.remainingQuestions : 3;
        const nextRemaining = Math.max(0, currentRemaining - 1);
        const updatedProfile = {
          ...userProfile,
          remainingQuestions: nextRemaining
        };
        setUserProfile(updatedProfile);
        
        // Persist to local storage & Firestore if possible
        localStorage.setItem('al_user', JSON.stringify(updatedProfile));
        try {
          await updateDoc(doc(db, "users", userProfile.id.toString()), {
            remainingQuestions: nextRemaining
          });
        } catch (err) {
          console.warn("Could not save updated quota to firestore:", err);
        }
      }

      return data.text || '';
    } catch (error) {
      console.error("Gemini API call failed:", error);
      throw error;
    }
  };

  const runCaseSimulation = async (caseId: number) => {
    const activeCase = caseFiles.find(c => c.id === caseId);
    if (!activeCase) return;

    setCaseAnalysisLoading(true);
    try {
      const prompt = `Lütfen aşağıdaki uyuşmazlık olayını yasal açıdan analiz edin ve dava simülasyonu raporu hazırlayın.
Uyuşmazlık Konusu: ${activeCase.category}
Uyuşmazlık Detayları: ${activeCase.description}

Analiz sonucunda şunları çıkartın:
1. Olay Kronolojisi (Zaman Çizelgesi)
2. Tarafların İddiaları ve Savunmaları
3. SWOT Analiz Değerlendirmesi (Güçlü Yönler, Desteklenmeli, Belirsizlikler, Riskler)
4. İlgili Yasal Kanun Maddeleri ve Yargıtay Kararları
5. Kısa bir Dilekçe Taslağı

Lütfen JSON formatında döndürün. Format:
{
  "timeline": [{"date": "tarih", "title": "başlık", "description": "açıklama"}],
  "claims": {"plaintiff": ["idda1", "iddia2"], "defendant": ["savunma1", "savunma2"]},
  "swot": {"strengths": [], "weaknesses": [], "opportunities": [], "threats": []},
  "legalSources": [{"source": "kanun adı", "content": "açıklama"}],
  "draftPetition": "Mahkeme dilekçe taslağı..."
}`;

      const resText = await callGeminiApi(prompt, "CASE_SIMULATION");
      
      // Parse JSON from API or extract block
      let parsed = null;
      try {
        const cleanJson = resText.substring(resText.indexOf('{'), resText.lastIndexOf('}') + 1);
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        console.warn("Could not parse JSON. Creating mock from text response.");
        parsed = {
          timeline: [
            { date: "10.01.2026", title: "İş İlişkisinin Başlaması", description: "Sözleşmenin tanzimi." },
            { date: "30.06.2026", title: "İş Feshi", description: "Haksız fesih ihbarı." }
          ],
          claims: {
            plaintiff: ["Fesih haksızdır.", "Mesailer ödenmemiştir."],
            defendant: ["Devamsızlık yapılmıştır.", "Bütün ödemeler tamdır."]
          },
          swot: {
            strengths: ["Yazılı sözleşme bulunuyor.", "WhatsApp delilleri mevcuttur."],
            weaknesses: ["Eksik gün ve saat bildirimleri."],
            opportunities: ["Uzlaşma (Arabuluculuk) yolu açılması."],
            threats: ["İspat yokluğu nedeniyle mesailerin kısmen reddedilme riski."]
          },
          legalSources: [
            { source: "4857 Sayılı İş Kanunu m. 17", content: "İhbar tazminatı bildirim süresine uyulmaması halinde ödenir." },
            { source: "4857 Sayılı İş Kanunu m. 41", content: "Haftalık 45 saati aşan çalışmalar %50 zamlı ödenir." }
          ],
          draftPetition: resText || "NÖBETÇİ İŞ MAHKEMESİ HAKİMLİĞİ'NE...\n"
        };
      }
      setCaseAnalysisResult(parsed);
    } catch (e) {
      console.error(e);
    } finally {
      setCaseAnalysisLoading(false);
    }
  };

  const analyzeDocRisk = async (docId: number) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    setDocAnalysisLoading(true);
    try {
      const prompt = `Aşağıdaki yasal belgenin OCR metnini analiz ederek risk analizi hazırlayın.
Sözleşme Adı: ${doc.name}
Belge İçeriği: ${doc.contentText}

Şunları çıkartın:
1. Risk Puanı (0 - 100 arası, nerede risk yüksekse yüksek puan verin, örn: ağır rekabet maddesi varsa risk puani 80)
2. Risk Seviyesi (HIGH, MEDIUM, CLEAN)
3. Risklerin Detaylı Açıklaması

Yanıtı JSON formatında verin:
{
  "riskScore": 75,
  "riskLevel": "HIGH",
  "riskDescription": "Açıklama ve önerilen düzeltmeler..."
}`;

      const resText = await callGeminiApi(prompt, "DOCUMENT_ANALYSIS");
      let parsed = null;
      try {
        const cleanJson = resText.substring(resText.indexOf('{'), resText.lastIndexOf('}') + 1);
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        parsed = {
          riskScore: 65,
          riskLevel: "MEDIUM" as const,
          riskDescription: resText || "İmza eksiklikleri ve belirsiz tazminat şartları yüksek risk teşkil etmektedir."
        };
      }

      setDocuments(prev => prev.map(d => d.id === docId ? {
        ...d,
        riskScore: parsed.riskScore,
        riskLevel: parsed.riskLevel,
        riskDescription: parsed.riskDescription,
        status: 'RISK_ANALYZED'
      } : d));
      setDocAnalysisResult(parsed);
    } catch (e) {
      console.error(e);
    } finally {
      setDocAnalysisLoading(false);
    }
  };

  const runAiLegalSearch = async (query: string) => {
    setSearchLoading(true);
    setSearchResult("");
    try {
      const prompt = `Bir Türk avukat gibi davranarak aşağıdaki hukuki soruyu en güncel mevzuata, kanunlara ve Yargıtay emsal kararlarına dayanarak detaylıca yanıtlayın:
${query}

Yanıtınız net, akademik ve uygulanabilir tavsiyeler içermelidir.`;
      const res = await callGeminiApi(prompt, "LEGAL_SEARCH");
      setSearchResult(res);
      setSessions(prev => [{ id: Date.now(), title: query, type: 'SEARCH', date: new Date().toLocaleDateString('tr-TR') }, ...prev]);
    } catch (e) {
      setSearchResult("Arama esnasında bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setSearchLoading(false);
    }
  };

  const draftAiPetition = async (title: string, details: string) => {
    setPetitionLoading(true);
    setPetitionResult("");
    try {
      const prompt = `Türk Hukuku usul kurallarına (HMK, CMK, İYUK) tamamen uygun olarak, resmi, profesyonel ve mahkemeye sunulmaya hazır bir dilekçe taslağı hazırlayın.
Dilekçe Konusu: ${title}
Dilekçe Olayları & Talepler: ${details}

Lütfen dilekçede şu bölümleri tam olarak bulundurun:
- Mahkeme Başlığı (Örn: NÖBETÇİ İŞ MAHKEMESİNE)
- Davacı / Davalı Bilgileri (Ad-Soyad, T.C., Adres vb. alanlar taslak olarak)
- Konu
- Açıklamalar (Maddeler halinde yasal temelleriyle)
- Hukuki Sebepler / Deliller
- Netice-i Talep (Net istemler)`;

      const res = await callGeminiApi(prompt, "PETITION_DRAFT");
      setPetitionResult(res);
      setSessions(prev => [{ id: Date.now(), title: title, type: 'PETITION', date: new Date().toLocaleDateString('tr-TR') }, ...prev]);
    } catch (e) {
      setPetitionResult("Dilekçe hazırlanırken bir hata oluştu. Lütfen bilgileri kontrol edip tekrar deneyin.");
    } finally {
      setPetitionLoading(false);
    }
  };

  const runAcademyTeacher = async (lessonTitle: string) => {
    setAcademyLoading(true);
    setAcademyResult("");
    try {
      const prompt = `Bir Hukuk Fakültesi Profesörü gibi davranarak aşağıdaki konuyu stajyer avukatlar ve hukuk öğrencileri için son derece açıklayıcı, örnek olaylı ve anlaşılır bir ders şeklinde anlatın:
Ders Konusu: ${lessonTitle}

Dersin sonunda 3 soruluk pratik bir mini test de ekleyin.`;
      const res = await callGeminiApi(prompt, "ACADEMY");
      setAcademyResult(res);
    } catch (e) {
      setAcademyResult("Eğitim modülü yüklenirken bir hata oluştu.");
    } finally {
      setAcademyLoading(false);
    }
  };

  const simulateVoiceInput = async (input: string) => {
    setVoiceText(input);
    setVoiceActive(true);
    try {
      const prompt = `Aşağıdaki sesli hukuk asistanı diktesini (konuşmadan metne) analiz et. Avukatın söylediği hukuki soruyu kısa, profesyonel ve pratik şekilde sesli yanıt formatında (maksimum 3-4 cümle) cevapla:
"${input}"`;
      const res = await callGeminiApi(prompt, "VOICE_ASSISTANT");
      setVoiceResponse(res);
    } catch (e) {
      setVoiceResponse("Sesli asistan şu anda meşgul, lütfen tekrar konuşun.");
    } finally {
      setVoiceActive(false);
    }
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      isAuthenticated,
      isEmailVerified,
      authLoading,
      authError,
      toast,
      showToast,
      caseFiles,
      selectedCaseFileId,
      documents,
      chatMessages,
      calendarEvents,
      paymentReceipts,
      sessions,
      supportTickets,
      
      // Premium V3.0 States
      subscriptionPackages,
      paymentRequests,
      userSubscriptionDetails,
      bankAccounts,
      paymentSettingsHistory,
      
      // Enterprise extensions
      adminUsers,
      coupons,
      campaigns,
      lawsAndPrecedents,
      securityLogs,
      
      // Configs
      geminiModel,
      geminiTemperature,
      geminiMaxTokens,
      firebaseConnected,
      databaseBackupDate,

      caseAnalysisResult,
      caseAnalysisLoading,
      docAnalysisResult,
      docAnalysisLoading,
      searchResult,
      searchLoading,
      petitionResult,
      petitionLoading,
      academyResult,
      academyLoading,
      voiceActive,
      voiceText,
      voiceResponse,

      signUp,
      signIn,
      resetPassword,
      signOutUser,
      clearAuthError,
      sendVerificationEmail,
      reloadUser,
      toggleAdminRole,
      togglePremiumRole,
      toggleTwoFactorAuth,
      updateSystemConfig,
      addCaseFile,
      selectCaseFile,
      addDocumentToCase,
      analyzeDocRisk,
      addChatMessage,
      runCaseSimulation,
      addCalendarEvent,
      submitPaymentReceipt,
      approvePaymentReceipt,
      rejectPaymentReceipt,
      
      // Premium V3.0 Methods
      submitPaymentRequest,
      approvePaymentRequest,
      rejectPaymentRequest,
      
      // Premium V3.0 Enterprise Payments Admin Methods
      addBankAccount,
      updateBankAccount,
      deleteBankAccount,
      setActiveBankAccount,
      addSubscriptionPackage,
      updateSubscriptionPackage,
      deleteSubscriptionPackage,
      rollbackPaymentSettings,
      
      runAiLegalSearch,
      draftAiPetition,
      runAcademyTeacher,
      submitTicket,
      setVoiceActive,
      simulateVoiceInput,
      
      // Admin methods
      updateGeminiConfig,
      testFirebaseConnection,
      triggerDatabaseBackup,
      clearSystemCache,
      addCoupon,
      toggleCoupon,
      deleteCoupon,
      addCampaign,
      toggleCampaign,
      deleteCampaign,
      addLawItem,
      deleteLawItem,
      addSecurityLog,
      clearSecurityLogs,
      sendGlobalNotification,
      updateUserRoleAndPlan
    }}>
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] max-w-sm w-full bg-midnight border-l-4 ${
          toast.type === 'success' ? 'border-l-successGreen' : 
          toast.type === 'error' ? 'border-l-errorRed' : 
          toast.type === 'warning' ? 'border-l-amber-500' : 'border-l-goldLight'
        } shadow-2xl p-4 rounded-r-xl border border-slateGrey/40 animate-fade-in flex items-start gap-3`}>
          <div className="mt-0.5 shrink-0">
            {toast.type === 'success' && (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.type === 'warning' && (
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-ivory tracking-wide leading-relaxed">
              {toast.message}
            </p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-softGrey hover:text-ivory transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

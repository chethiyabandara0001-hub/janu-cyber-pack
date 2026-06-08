/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DatabaseDoc {
  integritySalt?: string;
}

export interface User extends DatabaseDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: string;
  dataUsage?: {
    totalGB: number;
    usedGB: number;
    billingCycleEnd: string;
    speedLimitMbps: number;
    activeConnections: number;
  };
}

export interface Package extends DatabaseDoc {
  id: string;
  title: string;
  description: string;
  price: number; // in Local Currency (e.g. LKR/USD)
  priceCurrency: string; // "LKR" or "USD"
  validityDays: number;
  bandwidthGB: string; // e.g. "Unlimited" or "100 GB"
  vpnTypeName: 'WireGuard' | 'Vmess' | 'SSH' | 'Trojan' | 'V2Ray';
  isFeatured: boolean;
  status: 'active' | 'inactive';
  isp?: 'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel' | 'SLT';
  packageType?: 'Mobile' | 'Router' | 'Fiber';
}

export interface Post extends DatabaseDoc {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'featured' | 'recent' | 'news';
  author: string;
  date: string;
}

export interface PaymentSlip extends DatabaseDoc {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  packageId: string;
  packageTitle: string;
  vpnTypeName: string;
  price: number;
  currency: string;
  bankSlipBase64: string; // Base64 slip image data
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
  vpnCode?: string; // Generated once approved
  adminNotes?: string;
  tier?: string;
}

export interface ContactDetails extends DatabaseDoc {
  phone: string;
  email: string;
  telegramChannel: string;
  telegramBotUser: string;
  address: string;
  workingHours: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
}

export interface HomeAnnouncement extends DatabaseDoc {
  title: string;
  subtitle: string;
  announcementText: string;
  showAnnouncement: boolean;
}

export interface FreePackage extends DatabaseDoc {
  id: string;
  isp: 'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel';
  packageType: 'Mobile' | 'Router' | 'Fiber';
  packageName: string;
  price: string;
  code: string;
  createdAt?: string;
}

export interface FreeRequest extends DatabaseDoc {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  isp: string;
  packageType: string;
  packageName: string;
  price: string;
  codeReceived: string;
  requestedAt: string;
}

export interface AdSettings extends DatabaseDoc {
  dayTimeAdCode: string;
  nightTimeAdCode: string;
}

export interface SupportMessage extends DatabaseDoc {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  sender: 'user' | 'admin';
  timestamp: string;
}

export interface AppState {
  packages: Package[];
  posts: Post[];
  slips: PaymentSlip[];
  contact: ContactDetails;
  announcement: HomeAnnouncement;
  freePackages?: FreePackage[];
  freeRequests?: FreeRequest[];
}

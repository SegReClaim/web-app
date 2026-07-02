import { Timestamp } from "firebase/firestore";

export type WasteType = "plastic" | "glass" | "aluminium" | "paper" | "metal" | "general";
export type MachineStatus = "online" | "offline" | "full" | "maintenance";
export type SessionStatus = "pending" | "active" | "completed" | "expired";
export type VoucherStatus = "active" | "redeemed" | "expired";
export type RedemptionTokenStatus = "pending" | "claimed" | "redeemed" | "expired";
export type UserRole = "user" | "admin" | "superadmin";
export type StockMode = "limited" | "unlimited";
export type ClaimLimitMode = "once" | "limited" | "unlimited";

export interface UserDoc {
  uid: string;
  phone: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  role?: UserRole;
  totalPoints: number;
  lifetimePoints: number;
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: Timestamp | null;
  createdAt: Timestamp;
}

export interface MachineDoc {
  machineId: string;
  locationName: string;
  status: MachineStatus;
  lastHeartbeat: Timestamp;
  fillLevels: {
    plastic: number;
    glass: number;
    aluminium: number;
    paper: number;
  };
  firmwareVersion: string;
}

export interface SessionDoc {
  sessionId: string;
  machineId: string;
  userId: string | null;
  status: SessionStatus;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export interface TransactionItem {
  wasteType: WasteType;
  weightGrams: number;
  confidenceScore: number;
  pointsEarned: number;
  imageUrl: string;
}

export interface TransactionDoc {
  transactionId: string;
  userId: string;
  machineId: string;
  sessionId: string;
  items: TransactionItem[];
  totalPoints: number;
  totalWeightGrams: number;
  pointsCalculated: boolean;
  createdAt: Timestamp;
}

export interface VoucherDoc {
  voucherId: string;
  userId: string;
  partnerId: string;
  rewardId?: string;
  partnerName?: string;
  brandName?: string;
  code: string;
  description: string;
  pointsSpent: number;
  status: VoucherStatus;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

/** @deprecated Legacy nested catalogue item — use RewardDoc subcollection */
export interface RewardCatalogueItem {
  description: string;
  pointsCost: number;
  totalStock: number;
  remaining: number;
}

export interface PartnerDoc {
  partnerId: string;
  name: string;
  slug?: string;
  logoUrl: string;
  description?: string;
  contactEmail?: string;
  websiteUrl?: string;
  active: boolean;
  sortOrder?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  /** @deprecated Use partners/{id}/rewards subcollection */
  rewardCatalogue?: RewardCatalogueItem[];
}

export interface RewardDoc {
  rewardId: string;
  partnerId: string;
  title: string;
  description: string;
  imageUrl?: string;
  brandName?: string;
  tags?: string[];
  pointsCost: number;
  rupeeValue?: number;
  stockMode: StockMode;
  totalStock?: number;
  remaining?: number;
  claimLimitMode: ClaimLimitMode;
  maxClaimsPerUser?: number;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  validFrom?: Timestamp | null;
  validUntil?: Timestamp | null;
  voucherValidityDays: number;
  redemptionInstructions?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
}

/** Partner with resolved rewards for display */
export interface PartnerWithRewards extends PartnerDoc {
  rewards: RewardDoc[];
}

export interface RewardClaimDoc {
  claimId: string;
  rewardId: string;
  partnerId: string;
  userId: string;
  voucherId: string;
  claimedAt: Timestamp;
}

export interface PointRule {
  wasteType: string;
  pointsPerGram: number;
  multiplier: number;
  active: boolean;
}

export interface RedemptionTokenDoc {
  tokenId: string;
  kioskId: string;
  machineId: string;
  credits: number;
  category: WasteType;
  weightGrams: number;
  status: RedemptionTokenStatus;
  userId: string | null;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  claimedAt?: Timestamp;
}

/** Form state for admin reward create/edit (no Timestamps) */
export interface RewardFormData {
  partnerId: string;
  title: string;
  description: string;
  imageUrl: string;
  brandName: string;
  tags: string;
  pointsCost: number;
  rupeeValue: number | "";
  stockMode: StockMode;
  totalStock: number;
  claimLimitMode: ClaimLimitMode;
  maxClaimsPerUser: number;
  active: boolean;
  featured: boolean;
  sortOrder: number;
  voucherValidityDays: number;
  redemptionInstructions: string;
  validFrom: string;
  validUntil: string;
}

export interface PartnerFormData {
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  contactEmail: string;
  websiteUrl: string;
  active: boolean;
  sortOrder: number;
}

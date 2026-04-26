import { Timestamp } from "firebase/firestore";

export type WasteType = "plastic" | "glass" | "aluminium" | "paper" | "metal" | "general";
export type MachineStatus = "online" | "offline" | "full" | "maintenance";
export type SessionStatus = "pending" | "active" | "completed" | "expired";
export type VoucherStatus = "active" | "redeemed" | "expired";
export type RedemptionTokenStatus = "pending" | "claimed" | "redeemed" | "expired";

export interface UserDoc {
  uid: string;
  phone: string;
  displayName: string;
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
  partnerName?: string; // joined client-side
  code: string;
  description: string;
  pointsSpent: number;
  status: VoucherStatus;
  expiresAt: Timestamp;
  createdAt: Timestamp;
}

export interface RewardCatalogueItem {
  description: string;
  pointsCost: number;
  totalStock: number;
  remaining: number;
}

export interface PartnerDoc {
  partnerId: string;
  name: string;
  logoUrl: string;
  rewardCatalogue: RewardCatalogueItem[];
  active: boolean;
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

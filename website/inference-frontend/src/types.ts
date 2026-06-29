export interface TxRecord {
  id: string;
  deployHash: string;
  entryPoint: string;
  contract: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  blockHeight?: number;
}

export type ResourceType = 'compute' | 'storage' | 'bandwidth';

export interface NodeLocation {
  lat: number;
  lng: number;
  name: string;
  country?: string;
  resource?: ResourceType;
  load?: number;
}

export interface NetworkStats {
  totalNodes: number;
  activeNodes: number;
  countries: number;
  transferredBytes: number;
  bandwidthGbps: number;
  regions: Record<string, number>;
  locations: NodeLocation[];
}

export interface NetworkUsage {
  bandwidthGbps: number;
  transferredTB: number;
  daily: { date: string; bandwidthGbps: number; transferredTB: number }[];
}

export type ReferralStatus = 'pending' | 'qualified';

export interface ReferralRecord {
  id: string;
  name: string;
  status: ReferralStatus;
  date: string;
}

export interface ReferralAccount {
  account: string;
  inviteCode: string;
  totalReferrals: number;
  qualifiedReferrals: number;
  pendingReferrals: number;
  lifetimeReward: number;
  level: number;
  referralsNeeded: number;
  invitedBy?: string;
  history: ReferralRecord[];
}

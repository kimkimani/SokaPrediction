export interface PredictionFixture {
  id: string | number;
  fixtureRef: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  prediction: string;
  result: 'won' | 'lost' | 'pending' | string;
  status: string;
  statusLong?: string;
  kickoffTime: string;
  date?: string;
  leagueName: string;
  leagueCountry: string;
  countryFlag: string;
  leagueLogo?: string;
  homeScore: string | number;
  awayScore: string | number;
  confidence: number;
  odds?: string | number;
  aiAnalysis?: string;
  probabilities?: {
    home: string;
    draw: string;
    away: string;
  };
  totalVotes?: number;
  votes1?: number;
  votesX?: number;
  votes2?: number;
  userVote?: string | null;
}

export interface JackpotFixture {
  id: string | number;
  position: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  kickoffTime: string;
  date?: string;
  leagueName?: string;
  leagueCountry?: string;
  countryFlag?: string;
  prediction: string;
  status: string;
  homeScore?: string | number;
  awayScore?: string | number;
  result?: string;
  confidence?: number;
  aiAnalysis?: string;
  probabilities?: {
    home: string;
    draw: string;
    away: string;
  };
}

export interface JackpotItem {
  id: string;
  name: string;
  slug: string;
  gamesCount: number;
  price: number;
  entryFee: string;
  estimatedPool: string;
  nextGameStartTime: string;
  earliestKickoff?: string;
  latestKickoff?: string;
  timeWindow?: string;
  durationHours?: number;
  status: string;
  submissionsFill?: string;
  premiumCount?: string;
  fixtures: JackpotFixture[];
  games?: JackpotFixture[];
}

export interface VipPackage {
  id: string;
  slug: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  features: string[];
  isFeatured?: boolean;
}

export interface OddsPack {
  id: number | string;
  slug: string;
  name: string;
  tag: string;
  price: number;
  durationDays: number;
  picksPerDay: number;
  oddsMinDecimal: string;
  description: string;
  color: string;
  riskLevel: string;
}

export interface SiteSettings {
  siteName: string;
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  address?: string;
}

export interface VoteResponse {
  success: boolean;
  stats?: {
    fixtureId: string;
    totalVotes: number;
    votes1: number;
    votesX: number;
    votes2: number;
    homePercent: number;
    drawPercent: number;
    awayPercent: number;
    userVote: string;
  };
  error?: string;
}

export interface MpesaPushRequest {
  phone: string;
  account_name: string;
  amount: number;
  package: string;
  package_id?: string;
  package_slug?: string;
  package_type?: string;
}

export interface MpesaPushResponse {
  status: number | boolean;
  message?: string;
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
  ResponseCode?: string;
  CustomerMessage?: string;
}

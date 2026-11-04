import {
  PredictionFixture,
  JackpotItem,
  VipPackage,
  OddsPack,
  SiteSettings,
  MpesaPushRequest,
  MpesaPushResponse,
} from '../types';

export const DEFAULT_API_BASE_URL = 'https://cheerplex.co.ke/soka_king/api';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('soka_php_api_url') || localStorage.getItem('254_php_api_url');
    if (saved && saved.trim()) return saved.trim();
  }
  return (import.meta.env.VITE_PHP_API_URL as string) || DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('soka_php_api_url', url.trim());
  }
}

export function normalizeFixture(raw: any, index: number = 0): PredictionFixture {
  const id = String(raw.id || raw.fixtureRef || raw.fixture_ref || raw.fixtureId || `fix_${index}`);
  const homeTeam = raw.homeTeam || raw.home_team || raw.home || 'Home Team';
  const awayTeam = raw.awayTeam || raw.away_team || raw.away || 'Away Team';
  const prediction = raw.prediction || raw.tip || raw.pick || '1X';
  const status = String(raw.status || (raw.homeScore !== undefined && raw.homeScore !== null && raw.homeScore !== '-' ? 'FT' : 'NS')).toUpperCase();
  const statusLong = raw.statusLong || raw.status_long || (status === 'FT' ? 'Match Finished' : status === 'LIVE' ? 'In Play' : 'Not Started');
  const kickoffTime = raw.kickoffTime || raw.kickoff_time || raw.date || raw.date_time || new Date().toISOString();
  const leagueName = raw.leagueName || raw.league_name || raw.competition || raw.league || 'Premier League';
  const leagueCountry = raw.leagueCountry || raw.league_country || raw.country || '';
  const countryFlag = raw.countryFlag || raw.country_flag || '';
  const leagueLogo = raw.leagueLogo || raw.league_logo || '';
  const homeTeamLogo = raw.homeTeamLogo || raw.home_team_logo || '';
  const awayTeamLogo = raw.awayTeamLogo || raw.away_team_logo || '';
  const homeScore = raw.homeScore !== undefined ? raw.homeScore : raw.home_score;
  const awayScore = raw.awayScore !== undefined ? raw.awayScore : raw.away_score;
  const confidence = typeof raw.confidence === 'number' ? raw.confidence : parseInt(String(raw.confidence || 78), 10) || 78;
  const odds = raw.odds ? String(raw.odds) : undefined;
  const result = raw.result || (status === 'FT' ? (raw.isWon ? 'won' : 'pending') : 'pending');

  return {
    id,
    fixtureRef: String(raw.fixtureRef || raw.fixture_ref || id),
    homeTeam,
    awayTeam,
    homeTeamLogo,
    awayTeamLogo,
    prediction,
    result,
    status,
    statusLong,
    kickoffTime,
    leagueName,
    leagueCountry,
    countryFlag,
    leagueLogo,
    homeScore,
    awayScore,
    confidence,
    odds,
    aiAnalysis: raw.aiAnalysis || raw.ai_analysis || raw.analysis || `${prediction} forecast for ${homeTeam} vs ${awayTeam} based on statistical form metrics.`,
    probabilities: raw.probabilities || { home: '45%', draw: '28%', away: '27%' },
    totalVotes: raw.totalVotes || raw.total_votes || 120,
    votes1: raw.votes1 || raw.votes_1 || 60,
    votesX: raw.votesX || raw.votes_x || 35,
    votes2: raw.votes2 || raw.votes_2 || 25,
  };
}

export class CheerplexApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = getApiBaseUrl().replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      const startIdx = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) 
        ? firstBrace 
        : firstBracket;
      
      if (startIdx !== -1) {
        const lastBrace = text.lastIndexOf('}');
        const lastBracket = text.lastIndexOf(']');
        const endIdx = Math.max(lastBrace, lastBracket);
        if (endIdx > startIdx) {
          const jsonStr = text.substring(startIdx, endIdx + 1);
          return JSON.parse(jsonStr) as T;
        }
      }

      return JSON.parse(text) as T;
    } catch (err) {
      console.warn(`[Cheerplex API] Request to ${url} failed`, err);
      throw err;
    }
  }

  static async getHealth(): Promise<{ status: string; service: string; host?: string; timestamp?: string }> {
    try {
      return await this.request('/health');
    } catch {
      // Test connectivity by querying predictions
      try {
        await this.request('/predictions?category=today');
        return { status: 'online', service: 'Cheerplex PHP MySQL REST API' };
      } catch {
        return { status: 'offline', service: 'Cheerplex PHP MySQL REST API (Unreachable)' };
      }
    }
  }

  static async getPredictions(category: string = 'all'): Promise<PredictionFixture[]> {
    try {
      const data = await this.request<any>(`/predictions?category=${encodeURIComponent(category)}`);
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data && Array.isArray(data.predictions)) {
        list = data.predictions;
      } else if (data && Array.isArray(data.fixtures)) {
        list = data.fixtures;
      }

      if (list && list.length > 0) {
        return list.map((item, idx) => normalizeFixture(item, idx));
      }

      return [];
    } catch (err) {
      console.error(`[Cheerplex API] Error fetching predictions for category "${category}":`, err);
      return [];
    }
  }

  static async castVote(fixtureId: string | number, vote: string, userId: string = 'guest_' + Math.random().toString(36).substring(7)) {
    try {
      return await this.request<{ success: boolean; stats: any }>('/predictions/vote', {
        method: 'POST',
        body: JSON.stringify({ fixtureId: String(fixtureId), vote, userId })
      });
    } catch (err) {
      console.warn('[Cheerplex API] castVote failed:', err);
      return {
        success: false,
        stats: { fixtureId: String(fixtureId), userVote: vote }
      };
    }
  }

  static async getJackpots(): Promise<JackpotItem[]> {
    try {
      const data = await this.request<JackpotItem[]>('/jackpots');
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.error('[Cheerplex API] Error fetching jackpots:', err);
      return [];
    }
  }

  static async getJackpotById(id: string): Promise<JackpotItem | null> {
    try {
      const data = await this.request<JackpotItem>(`/jackpots/${encodeURIComponent(id)}`);
      if (data && data.name) return data;
    } catch (err) {
      console.warn(`[Cheerplex API] Direct fetch for jackpot ${id} failed, checking list:`, err);
    }

    try {
      const all = await this.getJackpots();
      const match = all.find(j => j.id === id || j.slug === id);
      return match || null;
    } catch {
      return null;
    }
  }

  static async getVipPackages(): Promise<VipPackage[]> {
    try {
      const data = await this.request<VipPackage[]>('/vip-packages');
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.error('[Cheerplex API] Error fetching VIP packages:', err);
      return [];
    }
  }

  static async getOddsPacks(): Promise<OddsPack[]> {
    try {
      const data = await this.request<OddsPack[]>('/odds-packs');
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.error('[Cheerplex API] Error fetching odds packs:', err);
      return [];
    }
  }

  static async getSiteSettings(): Promise<SiteSettings> {
    try {
      const data = await this.request<SiteSettings>('/site-settings');
      if (data && typeof data === 'object') {
        return data;
      }
      return {
        siteName: 'Soka Predictions',
        email: 'support@sokapredictions.com',
        phone: '+254740841375',
        whatsapp: '+254740841375',
        telegram: 'https://t.me/sokapredictions',
        facebook: 'https://www.facebook.com/sokapredictions/',
        twitter: 'https://x.com/sokapredictions',
        instagram: 'https://www.instagram.com/sokapredictions/',
        address: 'Nairobi, Kenya'
      };
    } catch (err) {
      console.error('[Cheerplex API] Error fetching site settings:', err);
      return {
        siteName: 'Soka Predictions',
        email: 'support@sokapredictions.com',
        phone: '+254740841375',
        whatsapp: '+254740841375',
        telegram: 'https://t.me/sokapredictions',
        facebook: 'https://www.facebook.com/sokapredictions/',
        twitter: 'https://x.com/sokapredictions',
        instagram: 'https://www.instagram.com/sokapredictions/',
        address: 'Nairobi, Kenya'
      };
    }
  }

  static async getExternalLinks(): Promise<any[]> {
    try {
      const data = await this.request<any[]>('/external-links');
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (err) {
      console.error('[Cheerplex API] Error fetching external links:', err);
      return [];
    }
  }

  static async initiateMpesaPayment(req: MpesaPushRequest): Promise<MpesaPushResponse> {
    try {
      return await this.request<MpesaPushResponse>('/mpesa/stkpush', {
        method: 'POST',
        body: JSON.stringify(req)
      });
    } catch (err) {
      console.error('[Cheerplex API] Error initiating M-Pesa push:', err);
      throw err;
    }
  }
}

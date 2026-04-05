import { Family, Bot, Broker, BotAsset, AggregatedStats, PortfolioHistory, Tactic, SelectedAsset, CompetitorAsset } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_PROFTVIEW_API_URL || 'http://localhost:8000/api/proftview';

const getAuthHeader = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('proftview_token');
    if (token) return { 'Authorization': `Token ${token}` };
  }
  return {};
};

export const apiProftviewClient = {
  async login(credentials: { username: string; password: string }): Promise<{ token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    const data: unknown = await res.json();
    return data as { token: string };
  },

  async verify(token: string): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/auth/verify/`, {
      headers: { 'Authorization': `Token ${token}` },
    });
    if (!res.ok) throw new Error(`Token verification failed: ${res.status}`);
    const data: unknown = await res.json();
    return data;
  },

  async getFamilies(): Promise<Family[]> {
    const res = await fetch(`${BASE_URL}/families/`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as Family[];
  },

  async getFamily(id: number): Promise<Family> {
    const res = await fetch(`${BASE_URL}/families/${id}/`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as Family;
  },

  async getBots(): Promise<Bot[]> {
    const res = await fetch(`${BASE_URL}/bots/`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as Bot[];
  },

  async getBrokers(): Promise<Broker[]> {
    const res = await fetch(`${BASE_URL}/brokers/`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as Broker[];
  },

  async getAssets(params?: { family?: number; bot?: number; broker?: number }): Promise<BotAsset[]> {
    let url = `${BASE_URL}/assets/`;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.family !== undefined) searchParams.append('family', params.family.toString());
      if (params.bot !== undefined) searchParams.append('bot', params.bot.toString());
      if (params.broker !== undefined) searchParams.append('broker', params.broker.toString());
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as BotAsset[];
  },

  async getAsset(id: number): Promise<BotAsset> {
    const res = await fetch(`${BASE_URL}/assets/${id}/`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as BotAsset;
  },

  async getAggregatedAssets(params?: { family?: number; bot?: number; broker?: number }): Promise<AggregatedStats> {
    let url = `${BASE_URL}/assets/aggregated/`;
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.family !== undefined) searchParams.append('family', params.family.toString());
      if (params.bot !== undefined) searchParams.append('bot', params.bot.toString());
      if (params.broker !== undefined) searchParams.append('broker', params.broker.toString());
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as AggregatedStats;
  },

  async addCapital(data: { bot_id: number; amount: number; broker_id: number }): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/bot/add-capital/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const dataRes: unknown = await res.json();
    return dataRes;
  },

  async addAssetCapital(data: { bot_asset_id: number; amount: number }): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/assets/add-remove-capital/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const dataRes: unknown = await res.json();
    return dataRes;
  },

  async closePosition(data: { bot_asset_id: number; all_quantity: boolean; execution_price: number; quantity_closed?: number }): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/assets/close-position/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const dataRes: unknown = await res.json();
    return dataRes;
  },

  async getHistory(botId?: number): Promise<PortfolioHistory[]> {
    let url = `${BASE_URL}/history/`;
    if (botId !== undefined) {
      url += `?bot_id=${botId}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as PortfolioHistory[];
  }
};

const GEMS_BASE_URL = process.env.NEXT_PUBLIC_GEMS_API_URL || 'http://localhost:8000/api/gemsfinder';

export const apiGemsfinderClient = {
  async getTactics(): Promise<Tactic[]> {
    const res = await fetch(`${GEMS_BASE_URL}/tactics/`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as Tactic[];
  },

  async getAssets(sessionId: number): Promise<SelectedAsset[]> {
    const res = await fetch(`${GEMS_BASE_URL}/assets/?session=${sessionId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as SelectedAsset[];
  },

  async getCompetitors(targetAssetId: number): Promise<CompetitorAsset[]> {
    const res = await fetch(`${GEMS_BASE_URL}/competitors/?target_asset=${targetAssetId}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: unknown = await res.json();
    return data as CompetitorAsset[];
  }
};

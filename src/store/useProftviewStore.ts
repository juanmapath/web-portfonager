import { create } from 'zustand';
import { Family, Bot, Broker, BotAsset } from '../app/api/types';
import { apiProftviewClient } from '../app/api/client';

interface ProftviewState {
  families: Family[];
  bots: Bot[];
  brokers: Broker[];
  assets: BotAsset[];
  isLoading: boolean;
  error: string | null;

  fetchFamilies: () => Promise<void>;
  fetchBots: () => Promise<void>;
  fetchBrokers: () => Promise<void>;
  fetchAssets: (params?: { family?: number; bot?: number; broker?: number }) => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useProftviewStore = create<ProftviewState>((set) => ({
  families: [],
  bots: [],
  brokers: [],
  assets: [],
  isLoading: false,
  error: null,

  fetchFamilies: async () => {
    set({ isLoading: true, error: null });
    try {
      const families = await apiProftviewClient.getFamilies();
      set({ families, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching families';
      set({ error: message, isLoading: false });
    }
  },

  fetchBots: async () => {
    set({ isLoading: true, error: null });
    try {
      const bots = await apiProftviewClient.getBots();
      set({ bots, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching bots';
      set({ error: message, isLoading: false });
    }
  },

  fetchBrokers: async () => {
    set({ isLoading: true, error: null });
    try {
      const brokers = await apiProftviewClient.getBrokers();
      set({ brokers, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching brokers';
      set({ error: message, isLoading: false });
    }
  },

  fetchAssets: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const assets = await apiProftviewClient.getAssets(params);
      set({ assets, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching assets';
      set({ error: message, isLoading: false });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [families, bots, brokers, assets] = await Promise.all([
        apiProftviewClient.getFamilies(),
        apiProftviewClient.getBots(),
        apiProftviewClient.getBrokers(),
        apiProftviewClient.getAssets()
      ]);
      set({ families, bots, brokers, assets, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error fetching all data';
      set({ error: message, isLoading: false });
    }
  }
}));

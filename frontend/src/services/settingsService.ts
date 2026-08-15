import { settingsStorage } from './localStorageService';
import { Settings } from '../types';

export const settingsService = {
  get: async (): Promise<Settings> => {
    const settings = settingsStorage.get();
    if (!settings) throw new Error('Settings not found');
    return settings;
  },

  update: async (settings: Partial<Settings>): Promise<Settings> => {
    return settingsStorage.update(settings);
  },
};

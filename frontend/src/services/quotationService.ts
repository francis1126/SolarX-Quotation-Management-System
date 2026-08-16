import { quotationStorage, settingsStorage } from './localStorageService';
import { Quotation, DashboardStats, Settings } from '../types';
import { generateQuotationPDF } from '../utils/quotationPdf';

export const quotationService = {
  getAll: async (search?: string, status?: string, _startDate?: string, _endDate?: string): Promise<Quotation[]> => {
    return quotationStorage.getAll({ search, status });
  },

  getById: async (id: string): Promise<Quotation> => {
    const quotation = quotationStorage.getById(id);
    if (!quotation) throw new Error('Quotation not found');
    return quotation;
  },

  create: async (quotation: Partial<Quotation>): Promise<Quotation> => {
    return quotationStorage.create(quotation);
  },

  update: async (id: string, quotation: Partial<Quotation>): Promise<Quotation> => {
    const updated = quotationStorage.update(id, quotation);
    if (!updated) throw new Error('Quotation not found');
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    quotationStorage.delete(id);
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    return quotationStorage.getDashboardStats();
  },

  updateExpired: async (): Promise<void> => {
    // Not needed for localStorage version
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    const quotation = quotationStorage.getById(id);
    if (!quotation) throw new Error('Quotation not found');
    return generateQuotationPDF(quotation, settingsStorage.get() as Settings | null);
  },
};

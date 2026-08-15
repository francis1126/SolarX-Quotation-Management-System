export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Customer {
  _id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  productCode: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  sellingPrice: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  productId?: string;
  productCode: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Quotation {
  _id: string;
  quotationNumber: string;
  customerId?: string | Customer;
  customerName?: string;
  customerCompany?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  quotationDate: string;
  validUntil?: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  vat: number;
  vatRate: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';
  notes?: string;
  termsAndConditions?: string;
  createdBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  _id?: string;
  company: {
    name: string;
    logo?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    tin?: string;
  };
  quotation: {
    defaultValidityDays: number;
    vatEnabled: boolean;
    vatPercentage: number;
    prefix?: string;
    defaultTermsAndConditions: string;
  };
  currency?: {
    code: string;
    symbol: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  totalValue: number;
  recentQuotations: Quotation[];
  monthlyStats: Array<{
    _id: { year: number; month: number };
    count: number;
    total: number;
  }>;
}

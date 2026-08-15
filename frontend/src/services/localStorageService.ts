// LocalStorage Service for offline data management
// This replaces the backend API calls with localStorage operations

const STORAGE_KEYS = {
  USERS: 'solarx_users',
  PRODUCTS: 'solarx_products',
  QUOTATIONS: 'solarx_quotations',
  SETTINGS: 'solarx_settings',
  CURRENT_USER: 'solarx_current_user',
};

// Helper functions
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const getSingleFromStorage = <T>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
};

const saveSingleToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initialize default data
const initializeDefaultData = () => {
  // Initialize settings if not exists
  const settings = getSingleFromStorage<any>(STORAGE_KEYS.SETTINGS);
  if (!settings) {
    const defaultSettings = {
      company: {
        name: 'SolarX',
        address: '',
        phone: '',
        email: '',
        website: '',
      },
      quotation: {
        defaultValidityDays: 30,
        vatEnabled: true,
        vatPercentage: 12,
        prefix: 'QT',
        defaultTermsAndConditions: '1. Quotation is valid for 30 days from the date of issue.\n2. Prices are subject to change without prior notice.\n3. 50% down payment required upon order confirmation.\n4. Balance due upon delivery.\n5. Warranty as per manufacturer specifications.',
      },
      currency: {
        code: 'PHP',
        symbol: '₱',
      },
    };
    saveSingleToStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
  }
};

// Initialize on load
initializeDefaultData();

// User operations
export const userStorage = {
  getAll: () => getFromStorage<any>(STORAGE_KEYS.USERS),
  
  getById: (id: string) => {
    const users = getFromStorage<any>(STORAGE_KEYS.USERS);
    return users.find((u: any) => u._id === id);
  },
  
  getByEmail: (email: string) => {
    const users = getFromStorage<any>(STORAGE_KEYS.USERS);
    return users.find((u: any) => u.email === email);
  },
  
  create: (user: any) => {
    const users = getFromStorage<any>(STORAGE_KEYS.USERS);
    const newUser = {
      ...user,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  
  update: (id: string, data: any) => {
    const users = getFromStorage<any>(STORAGE_KEYS.USERS);
    const index = users.findIndex((u: any) => u._id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveToStorage(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const users = getFromStorage<any>(STORAGE_KEYS.USERS);
    const filtered = users.filter((u: any) => u._id !== id);
    saveToStorage(STORAGE_KEYS.USERS, filtered);
  },
};

// Product operations
export const productStorage = {
  getAll: () => getFromStorage<any>(STORAGE_KEYS.PRODUCTS),
  
  getById: (id: string) => {
    const products = getFromStorage<any>(STORAGE_KEYS.PRODUCTS);
    return products.find((p: any) => p._id === id);
  },
  
  create: (product: any) => {
    const products = getFromStorage<any>(STORAGE_KEYS.PRODUCTS);
    const newProduct = {
      ...product,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    products.push(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },
  
  update: (id: string, data: any) => {
    const products = getFromStorage<any>(STORAGE_KEYS.PRODUCTS);
    const index = products.findIndex((p: any) => p._id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...data };
      saveToStorage(STORAGE_KEYS.PRODUCTS, products);
      return products[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const products = getFromStorage<any>(STORAGE_KEYS.PRODUCTS);
    const filtered = products.filter((p: any) => p._id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);
  },
};

// Quotation operations
export const quotationStorage = {
  getAll: (filters?: { search?: string; status?: string }) => {
    let quotations = getFromStorage<any>(STORAGE_KEYS.QUOTATIONS);
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      quotations = quotations.filter((q: any) =>
        q.quotationNumber.toLowerCase().includes(search) ||
        q.customerName.toLowerCase().includes(search) ||
        (q.customerCompany && q.customerCompany.toLowerCase().includes(search))
      );
    }
    
    if (filters?.status) {
      quotations = quotations.filter((q: any) => q.status === filters.status);
    }
    
    return quotations.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  getById: (id: string) => {
    const quotations = getFromStorage<any>(STORAGE_KEYS.QUOTATIONS);
    return quotations.find((q: any) => q._id === id);
  },
  
  create: (quotation: any) => {
    const quotations = getFromStorage<any>(STORAGE_KEYS.QUOTATIONS);
    const year = new Date().getFullYear();
    const count = quotations.filter((q: any) => q.quotationNumber.includes(`Q-${year}`)).length;
    const number = String(count + 1).padStart(4, '0');
    
    const newQuotation = {
      ...quotation,
      _id: Date.now().toString(),
      quotationNumber: `Q-${year}-${number}`,
      status: quotation.status || 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    quotations.push(newQuotation);
    saveToStorage(STORAGE_KEYS.QUOTATIONS, quotations);
    return newQuotation;
  },
  
  update: (id: string, data: any) => {
    const quotations = getFromStorage<any>(STORAGE_KEYS.QUOTATIONS);
    const index = quotations.findIndex((q: any) => q._id === id);
    if (index !== -1) {
      quotations[index] = {
        ...quotations[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveToStorage(STORAGE_KEYS.QUOTATIONS, quotations);
      return quotations[index];
    }
    return null;
  },
  
  delete: (id: string) => {
    const quotations = getFromStorage<any>(STORAGE_KEYS.QUOTATIONS);
    const filtered = quotations.filter((q: any) => q._id !== id);
    saveToStorage(STORAGE_KEYS.QUOTATIONS, filtered);
  },
  
  getDashboardStats: () => {
    const quotations = getFromStorage<any>(STORAGE_KEYS.QUOTATIONS);
    const total = quotations.length;
    const totalValue = quotations.reduce((sum: number, q: any) => sum + q.grandTotal, 0);
    
    const recentQuotations = quotations
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    // Monthly stats
    const monthlyStats: any[] = [];
    const monthlyMap = new Map();
    
    quotations.forEach((q: any) => {
      const date = new Date(q.quotationDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { year: date.getFullYear(), month: date.getMonth() + 1, count: 0, total: 0 });
      }
      const stat = monthlyMap.get(key);
      stat.count++;
      stat.total += q.grandTotal;
    });
    
    monthlyMap.forEach((value) => {
      monthlyStats.push({
        _id: { year: value.year, month: value.month },
        count: value.count,
        total: value.total,
      });
    });
    
    monthlyStats.sort((a, b) => b._id.year - a._id.year || b._id.month - a._id.month);
    
    return {
      total,
      pending: 0,
      accepted: 0,
      rejected: 0,
      totalValue,
      recentQuotations,
      monthlyStats: monthlyStats.slice(0, 12),
    };
  },
};

// Settings operations
export const settingsStorage = {
  get: () => {
    return getSingleFromStorage<any>(STORAGE_KEYS.SETTINGS);
  },
  
  update: (data: any) => {
    const current = getSingleFromStorage<any>(STORAGE_KEYS.SETTINGS) || {};
    const updated = { ...current, ...data };
    saveSingleToStorage(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};

// Auth operations
export const authStorage = {
  getCurrentUser: () => {
    return getSingleFromStorage<any>(STORAGE_KEYS.CURRENT_USER);
  },
  
  setCurrentUser: (user: any) => {
    saveSingleToStorage(STORAGE_KEYS.CURRENT_USER, user);
  },
  
  clearCurrentUser: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
  
  login: async (email: string, password: string) => {
    const user = userStorage.getByEmail(email);
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      authStorage.setCurrentUser(userWithoutPassword);
      return userWithoutPassword;
    }
    throw new Error('Invalid email or password');
  },
  
  register: async (userData: any) => {
    const existing = userStorage.getByEmail(userData.email);
    if (existing) {
      throw new Error('Email already registered');
    }
    const user = userStorage.create(userData);
    const { password: _, ...userWithoutPassword } = user;
    authStorage.setCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  },
  
  logout: () => {
    authStorage.clearCurrentUser();
  },
  
  isAuthenticated: () => {
    return !!authStorage.getCurrentUser();
  },
};

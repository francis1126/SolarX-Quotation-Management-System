import { productStorage } from './localStorageService';
import { Product } from '../types';

export const productService = {
  getAll: async (search?: string, category?: string, status?: string): Promise<Product[]> => {
    let products = productStorage.getAll();
    
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.productCode.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (status) {
      products = products.filter(p => p.status === status);
    }
    
    return products;
  },

  getById: async (id: string): Promise<Product> => {
    const product = productStorage.getById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  create: async (product: Partial<Product>): Promise<Product> => {
    return productStorage.create(product);
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const updated = productStorage.update(id, product);
    if (!updated) throw new Error('Product not found');
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    productStorage.delete(id);
  },
};

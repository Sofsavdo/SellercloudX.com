// Products Store (HAQIQIY API)
import { create } from 'zustand';
import { productsApi, Product } from '../services/api';

interface ProductsState {
  // State
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  
  // Filters
  searchQuery: string;
  statusFilter: string;
  
  // Actions
  fetchProducts: () => Promise<void>;
  selectProduct: (product: Product | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  clearError: () => void;
  
  // Computed
  getFilteredProducts: () => Product[];
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  searchQuery: '',
  statusFilter: 'all',
  
  // Fetch all products from API
  fetchProducts: async () => {
    // Cache - 30 sekundda bir marta so'rov
    const { lastFetched, isLoading } = get();
    if (isLoading) return;
    
    const now = new Date();
    if (lastFetched && (now.getTime() - lastFetched.getTime()) < 30000) {
      return; // Cache'dan foydalanish
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const products = await productsApi.getAll();
      set({ 
        products, 
        isLoading: false,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('Products fetch error:', error);
      const message = error.response?.data?.message || 
                     error.response?.data?.error ||
                     'Mahsulotlarni yuklashda xatolik';
      set({ error: message, isLoading: false });
    }
  },
  
  // Select product
  selectProduct: (product) => {
    set({ selectedProduct: product });
  },
  
  // Add product to local state
  addProduct: (product) => {
    set((state) => ({
      products: [product, ...state.products],
    }));
  },
  
  // Update product locally and on server
  updateProduct: (id, data) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
  },
  
  // Delete product
  deleteProduct: async (id) => {
    try {
      await productsApi.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 
                     error.response?.data?.error ||
                     'O\'chirishda xatolik';
      set({ error: message });
      throw error;
    }
  },
  
  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  // Set status filter
  setStatusFilter: (status) => {
    set({ statusFilter: status });
  },
  
  // Clear error
  clearError: () => {
    set({ error: null });
  },
  
  // Get filtered products
  getFilteredProducts: () => {
    const { products, searchQuery, statusFilter } = get();
    
    return products.filter((product) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' ||
        product.name?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  },
}));

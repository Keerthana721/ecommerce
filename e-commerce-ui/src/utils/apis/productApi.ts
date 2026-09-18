import { apiClient } from "./axiosConfig";

export interface BackendProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  sku?: string;
  category: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  specs: Array<{ name: string; value: string }>;
  reviews: any[];
  featured?: boolean;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  quantity: number;
  imageUrl: string;
  isActive: boolean;
  discountPrice?: number;
}

export const enrichBackendProduct = (beProd: any): BackendProduct => {
  const imageValues = beProd.images ?? beProd.imageUrls ?? (beProd.imageUrl || beProd.image ? [beProd.imageUrl || beProd.image] : []);

  return {
    id: beProd.id.toString(),
    name: beProd.name,
    description: beProd.description || '',
    price: Number(beProd.price),
    sku: beProd.sku,
    category: (beProd.category || 'uncategorized').toLowerCase(),
    stock: Number(beProd.quantity ?? beProd.stock ?? beProd.availableQuantity ?? 0),
    rating: Number(beProd.rating ?? 0),
    reviewsCount: Number(beProd.reviewsCount ?? 0),
    images: Array.isArray(imageValues) ? imageValues.filter(Boolean) : [],
    specs: beProd.specs || [],
    reviews: beProd.reviews || [],
    featured: Boolean(beProd.featured)
  };
};

const productApi = {
  list: async (): Promise<any[]> => {
    const { data } = await apiClient.get("/products");
    const products = data?.data ?? data;
    return Array.isArray(products) ? products : (products?.content ?? []);
  },

  get: async (id: number | string): Promise<any> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data?.data ?? data ?? null;
  },

  create: async (payload: ProductPayload): Promise<any> => {
    const { data } = await apiClient.post("/products", payload);
    return data?.data ?? data;
  },

  update: async (id: number | string, payload: ProductPayload): Promise<any> => {
    const { data } = await apiClient.put(`/products/${id}`, payload);
    return data?.data ?? data;
  },

  delete: async (id: number | string): Promise<any> => {
    const { data } = await apiClient.delete(`/products/${id}`);
    return data;
  }
};

export default productApi;

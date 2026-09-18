import { apiClient } from "./axiosConfig";

const inventoryApi = {
  get: async (productId: number | string): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const { data } = await apiClient.get(`/inventory/api/inventory/product/${productId}`);
      return {
        success: data.success,
        data: data.data,
        message: data.message
      };
    } catch {
      return { success: false, message: 'Offline' };
    }
  }
};

export default inventoryApi;

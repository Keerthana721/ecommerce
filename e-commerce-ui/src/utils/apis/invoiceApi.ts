import { apiClient } from "./axiosConfig";

const invoiceApi = {
  getByOrder: async (orderId: number | string): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
      const { data } = await apiClient.get(`/invoices/api/invoices/order/${orderId}`);
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

export default invoiceApi;

import { apiClient } from "./axiosConfig";

const orderApi = {
  create: async (userId: number | string, payload: { items: any[]; totalAmount: number; shippingAddress: string }): Promise<any> => {
    const { data } = await apiClient.post("/orders", {
      userId: Number(userId),
      items: payload.items.map((it) => ({
        productId: Number(it.productId),
        productName: it.name,
        quantity: Number(it.quantity),
        price: Number(it.price),
        subtotal: Number(it.price * it.quantity)
      })),
      totalAmount: payload.totalAmount,
      shippingAddress: payload.shippingAddress,
      billingAddress: payload.shippingAddress,
      status: 'PENDING',
      paymentStatus: 'PAID'
    }, {
      headers: {
        'X-User-Id': userId.toString()
      }
    });
    return data;
  },

  listByUser: async (userId: number | string): Promise<any[]> => {
    const { data } = await apiClient.get(`/orders/user/${userId}`);
    return data.data || [];
  },

  get: async (id: number | string): Promise<any> => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data.data || null;
  }
};

export default orderApi;

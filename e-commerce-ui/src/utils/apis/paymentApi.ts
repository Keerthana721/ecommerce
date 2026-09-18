import { apiClient } from "./axiosConfig";

const paymentApi = {
  createRazorpayOrder: async (orderId: number | string, amount: number): Promise<any> => {
    const { data } = await apiClient.post("/payments/api/payments/razorpay/create-order", {
      orderId: Number(orderId),
      amount
    });
    return data;
  },

  verifyRazorpayPayment: async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<any> => {
    const { data } = await apiClient.post("/payments/api/payments/razorpay/verify", {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    });
    return data;
  }
};

export default paymentApi;

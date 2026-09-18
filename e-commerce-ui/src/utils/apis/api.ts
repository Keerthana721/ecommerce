import userApi from './userApi';
import orderApi from './orderApi';
import productApi, { enrichBackendProduct } from './productApi';
import inventoryApi from './inventoryApi';
import invoiceApi from './invoiceApi';
import paymentApi from './paymentApi';

export const api = {
  status: userApi.status,
  orders: orderApi,
  products: productApi,
  inventory: inventoryApi,
  invoices: invoiceApi,
  payments: paymentApi,
};

export { enrichBackendProduct };

export default api;

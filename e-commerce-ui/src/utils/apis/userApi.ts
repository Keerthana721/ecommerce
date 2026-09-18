import type { Address } from "../../context/AuthContext";
import type { LoginResponse, UserRegisterDto, ApiResponse } from "../user/user";
import { apiClient } from "./axiosConfig";

const userApi = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post("/users/login", { email, password });
    if (data.success ) {
      localStorage.setItem("ec_token", data.token);
    }
    return data;
  },

  // Registration
  register: async (payload: UserRegisterDto): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post("/users", payload);
    return data;
  },

   addAddress: async (payload: Address): Promise<ApiResponse<any>> => {
    const token = localStorage.getItem("ec_token");
    const { data } = await apiClient.post("/addresses", payload,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    return data;
  },


  // User profile helpers
  getProfile: async () => {
    const { data } = await apiClient.get("/users/profile");
    return data;
  },

  getAllUsers: async () => {
    const { data } = await apiClient.get("/users");
    return data;
  },

  updateUser: async (id: number, payload: any) => {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id: number) => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },

  updateProfile: async (payload: { username?: string; firstName?: string; lastName?: string; password?: string }) => {
    const { data } = await apiClient.put("/users/profile", payload);
    return data;
  },

  // New helpers
  status: {
    // Health‑check endpoint
    check: async () => {
      const { data } = await apiClient.get("/status");
      return data;
    },
  },

  orders: {
    // Retrieve orders for a specific user
    listByUser: async (userId: number | string) => {
      const { data } = await apiClient.get(`/orders/user/${userId}`);
      // Some back‑ends wrap the array in a `data` field
      return data.data || [];
    },
  },
};

export default userApi;
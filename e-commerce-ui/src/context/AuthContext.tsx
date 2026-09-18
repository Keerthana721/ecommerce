import React, { createContext, useContext, useState, useEffect } from 'react';
// import { api } from '../utils/apis/api';
import type { LoginResponse, UserRegisterDto } from '../utils/user/user';
import userApi from '../utils/apis/userApi';

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  userId?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
  addresses: Address[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: User['role']) => Promise<boolean>;
  updateProfile: (name: string, avatar: string) => Promise<void> | void;
  addAddress: (address: Address) => Promise<void> | void;
  // updateAddress: (updatedAddress: Partial<Address>) => Promise<void>;
  // deleteAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ec_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ec_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ec_user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<any> => {
    try {
      const res = await userApi.login(email, password);
      if (res.success && res) {
         const loggedUser: User = {
           id: res.id,
           name: res.username || 'User',
           email: res.email,
           role: res.role,
           avatar: '',
           addresses: [],
         };
         setUser(loggedUser);
         // Store token for later use
         if (res.token) {
           localStorage.setItem('ec_token', res.token);
                 localStorage.setItem("ec_user_id", res.id);

         }
         return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (err) {
      console.error('Login failed via API', err);
      return false;
    }
  };

const addAddress = async (newAddr: Omit<Address, "id">) => {
  if (!user) return;

  const payload: Address = {
    ...newAddr,
    userId: Number(localStorage.getItem("ec_user_id")),
  };

  let updatedAddresses = [...user.addresses];

  // If new address is default, remove default from others
  if (payload.isDefault) {
    updatedAddresses = updatedAddresses.map(addr => ({
      ...addr,
      isDefault: false,
    }));
  }

  // First address should always be default
  if (updatedAddresses.length === 0) {
    payload.isDefault = true;
  }

  // Add the new address
  updatedAddresses.push(payload);

  console.log("Sending Payload:", payload);

  try {
    const response = await userApi.addAddress(payload);

    if (response.success) {
      setUser({
        ...user,
        addresses: updatedAddresses,
      });
    } else {
      console.error("Failed to add address:", response.message);
    }
  } catch (err) {
    console.error("Failed to add address", err);
  }
};


  const register = async (name: string, email: string, password: string, role: User['role']): Promise<boolean> => {
    try {
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      const splitName = name.trim().split(/\s+/);
      const firstName = splitName[0] || 'User';
      const lastName = splitName.slice(1).join(' ') || '';

      const payload: UserRegisterDto = {
        username,
        email,
        password,
        role,
        firstName,
        lastName
      };

      const response = await userApi.register(payload);
      if (response.success) {
        return true;
      }

      return false;
    } catch (err) {
      console.error('Registration failed via API', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('ec_token');
    setUser(null);
  };


  

  const updateProfile = async (name: string, avatar: string) => {
    if (!user) return;
    try {
      const splitName = name.trim().split(/\s+/);
      const firstName = splitName[0] || '';
      const lastName = splitName.slice(1).join(' ') || '';

      await userApi.updateProfile({
        firstName,
        lastName
      });
    } catch (err) {
      console.error('Failed to update profile on backend', err);
    }
    setUser({ ...user, name, avatar });
  };


  // const updateAddress = (id: string, updatedFields: Partial<Address>) => {
  //   if (!user) return;
  //   let updatedAddresses = user.addresses.map(addr => {
  //     // if (addr.id === id) {
  //     //   return { ...addr, ...updatedFields };
  //     // }
  //     return addr;
  //   });

  //   if (updatedFields.isDefault) {
  //     updatedAddresses = updatedAddresses.map(addr => 
  //       addr.id === id ? addr : { ...addr, isDefault: false }
  //     );
  //   }

  //   setUser({ ...user, addresses: updatedAddresses });
  // };

  // const deleteAddress = (id: string) => {
  //   if (!user) return;
  //   const addressToDelete = user.addresses.find(addr => addr.id === id);
  //   let updatedAddresses = user.addresses.filter(addr => addr.id !== id);

  //   // If we deleted the default address and there are addresses left, set the first one as default
  //   if (addressToDelete?.isDefault && updatedAddresses.length > 0) {
  //     updatedAddresses[0].isDefault = true;
  //   }

  //   setUser({ ...user, addresses: updatedAddresses });
  // };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, addAddress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

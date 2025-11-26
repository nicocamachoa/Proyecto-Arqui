import api, { USE_MOCK } from './api';
import { Customer, Address } from '../models';
import { mockCustomers, mockAddresses } from '../data/mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const customerService = {
  /**
   * Get customer profile by user ID
   */
  getProfile: async (userId: number): Promise<Customer | null> => {
    if (USE_MOCK) {
      await delay(200);
      const customer = mockCustomers.find(c => c.userId === userId);
      return customer || null;
    }

    try {
      // Backend uses customer ID which equals user ID
      const response = await api.get<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        profileImageUrl: string | null;
        createdAt: string;
        updatedAt: string;
      }>(`/customers/${userId}`);

      // Map backend response to Customer model
      return {
        id: response.data.id,
        userId: response.data.id,
        email: response.data.email,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        phone: response.data.phone,
        createdAt: response.data.createdAt,
      };
    } catch {
      return null;
    }
  },

  /**
   * Get customer by ID
   */
  getCustomerById: async (customerId: number): Promise<Customer | null> => {
    if (USE_MOCK) {
      await delay(200);
      const customer = mockCustomers.find(c => c.id === customerId);
      return customer || null;
    }

    try {
      const response = await api.get<Customer>(`/customers/${customerId}`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Update customer profile
   */
  updateProfile: async (customerId: number, data: Partial<Customer>): Promise<Customer> => {
    if (USE_MOCK) {
      await delay(300);
      const index = mockCustomers.findIndex(c => c.id === customerId);
      if (index === -1) {
        throw new Error('Cliente no encontrado');
      }
      // In mock mode, just return merged data
      const updated = { ...mockCustomers[index], ...data };
      return updated;
    }

    const response = await api.put<Customer>(`/customers/${customerId}`, data);
    return response.data;
  },

  /**
   * Get customer addresses
   */
  getAddresses: async (customerId: number): Promise<Address[]> => {
    if (USE_MOCK) {
      await delay(200);
      return mockAddresses.filter(a => a.customerId === customerId);
    }

    const response = await api.get<Address[]>(`/customers/${customerId}/addresses`);
    return response.data;
  },

  /**
   * Add new address
   */
  addAddress: async (customerId: number, address: Omit<Address, 'id' | 'customerId'>): Promise<Address> => {
    if (USE_MOCK) {
      await delay(300);
      const newAddress: Address = {
        id: mockAddresses.length + 1,
        customerId,
        ...address,
      };
      mockAddresses.push(newAddress);
      return newAddress;
    }

    const response = await api.post<Address>(`/customers/${customerId}/addresses`, address);
    return response.data;
  },

  /**
   * Update address
   */
  updateAddress: async (customerId: number, addressId: number, data: Partial<Address>): Promise<Address> => {
    if (USE_MOCK) {
      await delay(300);
      const index = mockAddresses.findIndex(a => a.id === addressId && a.customerId === customerId);
      if (index === -1) {
        throw new Error('Dirección no encontrada');
      }
      const updated = { ...mockAddresses[index], ...data };
      mockAddresses[index] = updated;
      return updated;
    }

    const response = await api.put<Address>(`/customers/${customerId}/addresses/${addressId}`, data);
    return response.data;
  },

  /**
   * Delete address
   */
  deleteAddress: async (customerId: number, addressId: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(200);
      const index = mockAddresses.findIndex(a => a.id === addressId && a.customerId === customerId);
      if (index !== -1) {
        mockAddresses.splice(index, 1);
      }
      return;
    }

    await api.delete(`/customers/${customerId}/addresses/${addressId}`);
  },

  /**
   * Set default address
   */
  setDefaultAddress: async (customerId: number, addressId: number): Promise<void> => {
    if (USE_MOCK) {
      await delay(200);
      mockAddresses.forEach(a => {
        if (a.customerId === customerId) {
          a.isDefault = a.id === addressId;
        }
      });
      return;
    }

    await api.put(`/customers/${customerId}/addresses/${addressId}/default`);
  },
};

export default customerService;

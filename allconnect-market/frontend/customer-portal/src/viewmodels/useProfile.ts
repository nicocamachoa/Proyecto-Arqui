import { useState, useCallback, useEffect } from 'react';
import { customerService, getErrorMessage } from '../services';
import { Customer, Address } from '../models';
import { useAuthStore } from '../stores/authStore';

export const useProfile = () => {
  const { user } = useAuthStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const customerData = await customerService.getProfile(user.id);
      setCustomer(customerData);

      if (customerData) {
        const addressData = await customerService.getAddresses(customerData.id);
        setAddresses(addressData);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (data: Partial<Customer>) => {
    if (!customer) throw new Error('No hay perfil cargado');

    setIsLoading(true);
    setError(null);

    try {
      const updated = await customerService.updateProfile(customer.id, data);
      setCustomer(updated);
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

  const addAddress = useCallback(async (address: Omit<Address, 'id' | 'customerId'>) => {
    if (!customer) throw new Error('No hay perfil cargado');

    setIsLoading(true);
    setError(null);

    try {
      const newAddress = await customerService.addAddress(customer.id, address);
      setAddresses(prev => [...prev, newAddress]);
      return newAddress;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

  const updateAddress = useCallback(async (addressId: number, data: Partial<Address>) => {
    if (!customer) throw new Error('No hay perfil cargado');

    setIsLoading(true);
    setError(null);

    try {
      const updated = await customerService.updateAddress(customer.id, addressId, data);
      setAddresses(prev => prev.map(a => a.id === addressId ? updated : a));
      return updated;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

  const deleteAddress = useCallback(async (addressId: number) => {
    if (!customer) throw new Error('No hay perfil cargado');

    setIsLoading(true);
    setError(null);

    try {
      await customerService.deleteAddress(customer.id, addressId);
      setAddresses(prev => prev.filter(a => a.id !== addressId));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

  const setDefaultAddress = useCallback(async (addressId: number) => {
    if (!customer) throw new Error('No hay perfil cargado');

    try {
      await customerService.setDefaultAddress(customer.id, addressId);
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addressId })));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }, [customer]);

  // Get default address
  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  return {
    customer,
    addresses,
    defaultAddress,
    isLoading,
    error,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchProfile,
  };
};

export default useProfile;
